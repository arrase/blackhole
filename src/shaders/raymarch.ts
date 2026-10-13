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

// La losa del volumen llega a SLAB escalas de altura: por encima la densidad es < e^-4.5 de la central,
// concentrando todos los pasos del raymarch en la fotosfera activa
const float SLAB = 3.0;
// Profundidad optica maxima de un paso dentro del disco
const float STEP_TAU = 0.12;
// Maximo de RGBA16F: un Inf en la historia la envenenaria hasta el siguiente reinicio
const float F16_MAX = 65000.0;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 starColor;

void main(){
  // Subpixel de Halton por frame: la acumulacion temporal lo convierte en antialiasing
  vec2 uv = (gl_FragCoord.xy + uJitter - 0.5 * uRes) / uRes.y;
  // n_i: vector unitario de la tetrada del observador estatico hacia el pixel (componentes
  // covariantes espaciales). La tetrada incluye la aberracion gravitatoria
  vec3 n = (uCamFwd * uFov + uCamRight * uv.x + uCamUp * uv.y) / length(vec3(uFov, uv));
  vec3 x = uCamPos;
  vec3 p = uCamU + n;
  // Tamano angular del pixel: con la longitud recorrida da la huella del rayo para el LOD del ruido
  float pixelAngle = 1.0 / (uRes.y * uFov);

  // Fase cuasi-aleatoria de bajo ruido azul (IGN + razon aurea temporal) para el primer paso en la losa
  float jitter = fract(ign(gl_FragCoord.xy) + 0.6180339887 * uFrame);
  bool hasDisk = uAccretionDisk > 0.5;
  float s = 0.0;

  vec3 col = vec3(0.0);
  float tr = 1.0;
  bool captured = false;
  bool inside = false;
  int crossings = 0;
  // Orden de la imagen para el LOD: se congela mientras el rayo esta en la losa
  int order = 0;
  vec3 dx, dp;

  for(int i = 0; i < MAX_STEPS; i++){
    float r = geodesic(x, p, dx, dp);
    if(r < uRPlus){ captured = true; break; }
    if(r > 60.0 && dot(x, dx) > 0.0) break;

    float H = diskHeight(r);
    bool diskZone = hasDisk && r < DISK_OUT;
    bool inSlab = diskZone && abs(x.y) < SLAB * H;
    // Tras el tercer cruce del disco (imagen n = 2) las imagenes de orden mayor son subpixel y la
    // transmitancia restante es despreciable: se corta al salir de la losa y se trata como capturado
    if(crossings >= 3 && !inSlab){ captured = true; break; }
    if(!inSlab) order = crossings;
    float lens = pow(LENS_DEMAG, float(order));
    float fp = s * pixelAngle * lens;

    float dt = clamp(0.09 * r * r / (r + 2.0), 0.012, 1.3);
    if(r < 3.4) dt = min(dt, 0.015 + 0.035 * (r - uRPlus));
    vec3 dir = dx / length(dx);

    vec3 gas;
    vec2 field;
    float column, k = 0.0;
    if(inSlab){
      gas = gasVelocity(r);
      column = diskColumn(r, gas.y);
      field = gasFields(x, r, H, gas.z / gas.x, fp);
      k = diskAbsorption(x.y, H, column, field.x);
      // Paso fino por profundidad optica, perfil vertical y celda radial para definir las turbulencias
      dt = min(dt, min(STEP_TAU / max(k, 1e-6), min(0.24 * H / max(abs(dir.y), 1e-3), 0.55 * r / GAS_RADIAL)));
      if(!inside) dt *= 0.04 + 0.96 * jitter;
    } else if(hasDisk){
      // Aterriza en la losa (por arriba o por el borde exterior) en vez de saltarsela
      if(r < DISK_OUT && x.y * dir.y < 0.0) dt = min(dt, (abs(x.y) - SLAB * H) / abs(dir.y) + 1e-4);
      float inward = -dot(x.xz, dir.xz) / length(x.xz);
      if(r >= DISK_OUT && inward > 0.0 && abs(x.y) < SLAB * diskHeight(DISK_OUT) + 0.25) dt = min(dt, (r - DISK_OUT) / inward + 1e-3);
    }
    inside = inSlab;

    // Heun con paso de longitud espacial dt (el parametro afin se reescala por |dx|)
    float h = dt / length(dx);
    vec3 dx2, dp2;
    geodesic(x + h * dx, p + h * dp, dx2, dp2);
    vec3 nextX = x + 0.5 * h * (dx + dx2);
    vec3 nextP = p + 0.5 * h * (dp + dp2);

    if(inSlab){
      // Transporte radiativo con integral analitica del perfil gaussiano vertical en [x.y, nextX.y]
      vec3 midX = 0.5 * (x + nextX);
      vec3 midP = 0.5 * (p + nextP);
      float dtau = diskSlabTau(x.y, nextX.y, H, column, field.x, dt);
      float teff = diskTeff(r, field.y);
      if(teff > 0.0) col += tr * (1.0 - exp(-dtau)) * diskSource(midX, midP, r, gas, teff, diskDepth(midX.y, H, column));
      tr *= exp(-dtau);
      if(tr < 0.005) break;
    }
    if(diskZone && x.y * nextX.y < 0.0) crossings++;

    x = nextX;
    p = nextP;
    s += dt;
  }

  // Derivadas en pantalla de la direccion final: la huella del pixel en el cielo tras la lente. Fuera
  // de cualquier rama (control de flujo uniforme); junto a la sombra o al disco valen basura y la
  // estrella de ese pixel solo se atenua
  vec3 dir = normalize(dx);
  vec3 ddx = dFdx(dir), ddy = dFdy(dir);
  vec3 stars = vec3(0.0);
  // Cielo con el corrimiento al azul de la camara (background.ts) visto a traves del disco
  if(!captured){
    col += tr * background(dir, ddx, ddy, stars);
    stars *= tr;
  }
  // Las estrellas no se acumulan: su capa se limpia cada frame y la mezcla de la historia la
  // multiplica por uHistoryWeight, que aqui se deshace. Un punto que se mueve varios pixeles por
  // frame (orbita de la camara amplificada por la lente) dejaba en la media exponencial una estela
  // de puntos que en HDR no se apaga; la PSF analitica centrada en el pixel ya es estable sin ella
  starColor = vec4(min(stars / uHistoryWeight, vec3(F16_MAX)), 1.0);
  fragColor = vec4(min(col, vec3(F16_MAX)), 1.0);
}
`;
