import { background } from "./background";
import { color } from "./color";
import { hash, header, ign, sceneUniforms } from "./common";
import { disk } from "./disk";
import { kerr } from "./kerr";
import { noise } from "./noise";

// Raymarch principal: radiancia lineal HDR sin tonemap; la exposicion y el revelado van en post
export const raymarchFragment = `${header}
${sceneUniforms}
${ign}
${hash}
${noise}
${kerr}
${color}
${background}
${disk}

// Semiespesor de la fotosfera turbulenta densa (3 H) y de la corona caliente opticamente fina (5 H)
const float SLAB = 3.0;
const float CORONA_SLAB = 5.0;
// Maximo de RGBA16F: un Inf en la historia la envenenaria hasta el siguiente reinicio
const float F16_MAX = 65000.0;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 starColor;

void main(){
  // Subpixel de Halton por frame: la acumulacion temporal lo convierte en antialiasing
  vec2 uv = (gl_FragCoord.xy + uJitter - 0.5 * uRes) / uRes.y;
  // n_i: vector unitario de la tetrada del observador estatico hacia el pixel
  vec3 n = (uCamFwd * uFov + uCamRight * uv.x + uCamUp * uv.y) / length(vec3(uFov, uv));
  vec3 x = uCamPos;
  vec3 p = uCamU + n;
  float pixelAngle = 1.0 / (uRes.y * uFov);

  // Fase estratificada de bajo ruido azul (IGN + razon aurea temporal) para el sub-muestreo del volumen
  float jitter = fract(ign(gl_FragCoord.xy) + 0.6180339887 * uFrame);
  bool hasDisk = uAccretionDisk > 0.5;
  float s = 0.0;

  vec3 col = vec3(0.0);
  float tr = 1.0;
  bool captured = false;
  int crossings = 0;
  int order = 0;
  vec3 dx, dp;

  for(int i = 0; i < MAX_STEPS; i++){
    float r = geodesic(x, p, dx, dp);
    if(r < uRPlus){ captured = true; break; }
    if(r > 60.0 && dot(x, dx) > 0.0) break;

    // Macro-paso geodesico gobernado solo por la curvatura del espaciotiempo (desacoplado de H)
    float dt = clamp(0.09 * r * r / (r + 2.0), 0.012, 1.3);
    if(r < 3.4) dt = min(dt, 0.014 + 0.032 * (r - uRPlus));
    if(hasDisk && r < DISK_OUT + 1.2 && abs(x.y) < 0.14 * r) dt = min(dt, 0.046 * r);

    float speed = length(dx);
    float h = dt / speed;
    vec3 dx2, dp2;
    geodesic(x + h * dx, p + h * dp, dx2, dp2);
    vec3 nextX = x + 0.5 * h * (dx + dx2);
    vec3 nextP = p + 0.5 * h * (dp + dp2);

    // Interseccion exacta del segmento [x, nextX] con la envoltura del disco y la corona: nunca salta
    // losas finas en los anillos de fotones (n = 1, 2) y tiene coste nulo en el espacio vacio
    if(hasDisk && crossings < 3 && (min(abs(x.y), abs(nextX.y)) < 0.65 || x.y * nextX.y <= 0.0)){
      vec3 midX = 0.5 * (x + nextX);
      float midR = ksRadius(midX);
      if(midR > uRPlus && midR < DISK_OUT){
        float H = diskHeight(midR);
        float corH = CORONA_SLAB * H;
        bool inZone = H > 1e-6 && min(x.y, nextX.y) < corH && max(x.y, nextX.y) > -corH;
        if(!inZone) order = min(crossings, 2);

        if(inZone){
          vec3 midP = 0.5 * (p + nextP);
          vec3 gas = gasVelocity(midR);
          float gMid = max(redshift(midP, ksVelocity(midX, midR, gas)), 1e-3);
          float dtComoving = dt / max(gMid * speed, 0.08);
          float corCol = coronaColumn(midR);
          float corHScale = 3.0 * H;
          vec3 corSrc = corCol > 0.0 ? blackbody(effectiveRedshift(gMid) * 1.05 * uTPeak) * uDiskUnit : vec3(0.0);

          float slabH = SLAB * H;
          float dySeg = nextX.y - x.y;
          float t0 = 0.0, t1 = 1.0;
          if(abs(dySeg) > 1e-7){
            float ta = (-slabH - x.y) / dySeg;
            float tb = ( slabH - x.y) / dySeg;
            t0 = clamp(min(ta, tb), 0.0, 1.0);
            t1 = clamp(max(ta, tb), 0.0, 1.0);
          } else if(abs(x.y) >= slabH){
            t0 = 0.0;
            t1 = 0.0;
          }

          // 1. Corona frontal [0, t0]
          if(corCol > 0.0 && t0 > 0.0){
            float tauF = diskSlabTau(x.y, mix(x.y, nextX.y, t0), corHScale, corCol, 1.0, t0 * dtComoving);
            col += tr * (1.0 - exp(-tauF)) * corSrc;
            tr *= exp(-tauF);
          }

          // 2. Fotosfera turbulenta [t0, t1] con sub-muestreo estratificado
          if(t1 > t0 && tr >= 0.005){
            float column = diskColumn(midR, gas.y);
            if(column > 1e-4){
              float lens = order == 0 ? 1.0 : (order == 1 ? LENS_DEMAG : LENS_DEMAG * LENS_DEMAG);
              float fp = (s + 0.5 * (t0 + t1) * dt) * pixelAngle * lens;
              float zonal = diskZonalRing(midR, fp);
              float subLen = (t1 - t0) * dt;
              float subDy = abs(dySeg) * (t1 - t0);
              int steps = clamp(int(ceil(max(subLen * GAS_RADIAL / (2.2 * midR), subDy / (0.45 * H)))), 1, 10);
              float invSteps = 1.0 / float(steps);
              float subComoving = (t1 - t0) * dtComoving * invSteps;
              float omega = gas.z / gas.x;

              for(int k = 0; k < steps; k++){
                float ta = mix(t0, t1, float(k) * invSteps);
                float tb = mix(t0, t1, float(k + 1) * invSteps);
                float tm = mix(ta, tb, 0.25 + 0.5 * jitter);
                vec3 sx = mix(x, nextX, tm);
                vec3 sp = mix(p, nextP, tm);
                float sr = max(ksRadius(sx), uRPlus + 1e-4);
                vec2 field = gasFields(sx, sr, H, omega, fp, zonal);
                float dtau = diskSlabTau(mix(x.y, nextX.y, ta), mix(x.y, nextX.y, tb), H, column, field.x, subComoving);
                float teff = diskTeff(sr, field.y);
                if(teff > 0.0){
                  float sg = redshift(sp, ksVelocity(sx, sr, gas));
                  col += tr * (1.0 - exp(-dtau)) * diskSource(sg, teff, diskDepth(sx.y, H, column));
                }
                tr *= exp(-dtau);
                if(tr < 0.005) break;
              }
            }
          }

          // 3. Corona posterior [t1, 1] (ocluida naturalmente por la transmitancia del disco)
          if(corCol > 0.0 && t1 < 1.0 && tr >= 0.005){
            float tauB = diskSlabTau(mix(x.y, nextX.y, t1), nextX.y, corHScale, corCol, 1.0, (1.0 - t1) * dtComoving);
            col += tr * (1.0 - exp(-tauB)) * corSrc;
            tr *= exp(-tauB);
          }

          if(tr < 0.005) break;
        }
        if((x.y < 0.0 && nextX.y >= 0.0) || (x.y > 0.0 && nextX.y <= 0.0)){
          crossings++;
          if(!inZone) order = min(crossings, 2);
        }
      }
    }

    x = nextX;
    p = nextP;
    s += dt;
  }

  // Cola asintotica de deflexion gravitatoria desde r_esc hasta el infinito (-M x_perp / r^2, M = 0.5)
  bool hitSky = !captured && tr >= 0.005;
  vec3 dir = normalize(dx);
  if(hitSky){
    vec3 xPerp = x - dir * dot(x, dir);
    dir = normalize(dir - 0.5 * xPerp / max(dot(x, x), 1.0));
  }

  // Derivadas de pantalla sanitizadas frente a discontinuidades del quad 2x2 junto a la sombra o el disco
  float valid = hitSky ? 1.0 : 0.0;
  vec3 ddx = dFdx(dir), ddy = dFdy(dir);
  float badX = abs(dFdx(valid)), badY = abs(dFdy(valid));
  if(badX > 0.5){
    vec3 fallback = normalize(cross(dir, abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0))) * pixelAngle;
    ddx = badY < 0.5 ? cross(dir, ddy) : fallback;
  }
  if(badY > 0.5) ddy = badX < 0.5 ? cross(ddx, dir) : cross(dir, ddx);

  vec3 stars = vec3(0.0);
  if(hitSky){
    col += tr * background(dir, ddx, ddy, stars);
    stars *= tr;
  }

  // Cota inferior 0.25 al compensar la mezcla hardware: impide que stars / uHistoryWeight sature F16_MAX
  // en escenas estaticas; post y bloom aplican el factor complementario uStarScale
  starColor = vec4(min(stars / max(uHistoryWeight, 0.25), vec3(F16_MAX)), 1.0);
  fragColor = vec4(min(col, vec3(F16_MAX)), 1.0);
}
`;
