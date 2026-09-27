export const vertexShader = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const fragmentShader = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 uCamFwd;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform float uFov;
uniform float uIntensity;
uniform float uDiskSpeed;
uniform float uSteps;
uniform float uStars;
uniform float uGlow;
uniform float uSpin;

const int MAX_STEPS = 600;
const float DISK_OUT = 13.0;

// Radio del horizonte de eventos en metrica de Kerr: r+(a) = M + sqrt(M^2 - a^2) con M = 0.5
float getRPlus(float spin){
  float a = clamp(spin, 0.0, 0.999);
  return 0.5 * (1.0 + sqrt(max(0.0, 1.0 - a * a)));
}

// ISCO progrado en metrica de Kerr: formula analitica de Bardeen-Press-Teukolsky
float getIsco(float spin){
  if(spin <= 0.001) return 3.0;
  float a = clamp(spin, 0.0, 0.999);
  float z1 = 1.0 + pow(1.0 - a * a, 1.0 / 3.0) * (pow(1.0 + a, 1.0 / 3.0) + pow(1.0 - a, 1.0 / 3.0));
  float z2 = sqrt(3.0 * a * a + z1 * z1);
  return 0.5 * (3.0 + z2 - sqrt(max(0.0, (3.0 - z1) * (3.0 + z1 + 2.0 * z2))));
}

// Aceleracion geodesica para rayos nulos en metrica de Kerr:
// a_Kerr = a_Schw + 2 * (v_photon x B_gm)
vec3 geodesicAcc(vec3 p, vec3 vel){
  vec3 h = cross(p, vel);
  float h2 = dot(h, h);
  float r2 = dot(p, p);
  float r = sqrt(r2);
  vec3 aSchw = -1.5 * h2 * p / (r2 * r2 * r);
  if(uSpin <= 0.001) return aSchw;

  float M = 0.5;
  float a = uSpin * M;
  vec3 J = vec3(0.0, a * M, 0.0);
  vec3 rHat = p / r;
  vec3 Bgm = (3.0 * dot(J, rHat) * rHat - J) / (r2 * r);
  return aSchw + 2.0 * cross(-normalize(vel), Bgm);
}

float hash(vec3 p){
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
vec3 hash3(vec3 p){
  return vec3(hash(p), hash(p + 17.13), hash(p + 41.7));
}
float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return v;
}

// Capa de estrellas puntuales de alta definicion
vec3 starFieldLayer(vec3 d, float scale, float threshold, float expFactor, float intensity){
  vec3 p = d * scale;
  vec3 id = floor(p);
  vec3 f = fract(p) - 0.5;
  float h = hash(id);
  if(h < threshold) return vec3(0.0);

  vec3 off = (hash3(id) - 0.5) * 0.65;
  float dist = length(f - off);
  float star = pow(max(0.0, 1.0 - dist * 3.8), expFactor);
  if(star <= 0.0001) return vec3(0.0);

  float temp = hash(id + 5.5);
  // Clasificacion espectral estelar: azul O/B -> blanco A/F -> amarillo G (Sol) -> naranja/rojo K/M
  vec3 tint;
  if(temp < 0.35){
    tint = mix(vec3(0.72, 0.86, 1.0), vec3(0.92, 0.95, 1.0), temp / 0.35);
  } else if(temp < 0.75){
    tint = mix(vec3(0.92, 0.95, 1.0), vec3(1.0, 0.92, 0.78), (temp - 0.35) / 0.4);
  } else {
    tint = mix(vec3(1.0, 0.92, 0.78), vec3(1.0, 0.62, 0.38), (temp - 0.75) / 0.25);
  }

  float tw = 0.88 + 0.12 * sin(uTime * 1.5 + h * 30.0);
  float brightness = (h - threshold) / (1.0 - threshold);
  return tint * star * brightness * intensity * tw;
}

// Fondo cosmico espectacular con miles de estrellas puntuales y plano galactico profundo
vec3 background(vec3 d){
  vec3 stars = vec3(0.0);

  // Miriadas de estrellas tenues de fondo (polvo estelar lejana)
  stars += starFieldLayer(d, 260.0, 0.65, 22.0, 2.0);

  // Estrellas de densidad media
  stars += starFieldLayer(d, 140.0, 0.76, 16.0, 2.6);

  // Estrellas brillantes de primera magnitud
  stars += starFieldLayer(d, 65.0, 0.86, 12.0, 3.8);

  // Estrellas gigantes con halo luminoso sutil
  stars += starFieldLayer(d, 28.0, 0.93, 8.0, 5.2);

  // Plano galactico profundo y calido (contraste oscuro, sin niebla blanquecina)
  vec3 gAxis = normalize(vec3(0.35, 0.92, 0.22));
  float galBand = exp(-pow(dot(d, gAxis) * 3.8, 2.0));
  float dust = fbm(d * 3.2) * fbm(d * 6.5 + 2.0);
  vec3 dustCol = mix(vec3(0.04, 0.06, 0.11), vec3(0.14, 0.11, 0.08), fbm(d * 2.0));
  vec3 nebula = galBand * dust * dustCol * 1.5;

  return stars * uStars + nebula;
}

// Muestreo del disco de acrecion con bordes suaves transparentes (sin borde negro ni corte de pegatina)
vec4 sampleDisk(vec3 p, vec3 vel, float rPlus, float rIsco, int crossingCount){
  float r = length(p.xz);
  if(r < rPlus * 1.01 || r > DISK_OUT) return vec4(0.0);

  float M = 0.5;
  float a_spin = uSpin * M;
  float sqrtM = sqrt(M);

  // Frecuencia kepleriana prograda en Kerr
  float omega = sqrtM / (pow(r, 1.5) + a_spin * sqrtM);
  float phi = atan(p.z, p.x);

  // Adveccion temporal acotada: evita moire por cizalladura radial infinita
  float tAnim = mod(uTime * uDiskSpeed, 62.831853);
  float shearFlow = tAnim * (0.5 / (r + 1.4));
  float aRot = phi + shearFlow;

  vec3 rHat = vec3(p.x, 0.0, p.z) / r;
  vec3 phiHat = vec3(-p.z, 0.0, p.x) / r;
  vec3 vGas;
  float temp;

  if(r >= rIsco){
    // Zona kepleriana estable (Novikov-Thorne / Shakura-Sunyaev)
    float vTangential = min(r * omega / sqrt(max(1.0 - 1.0 / r, 0.05)), 0.85);
    vGas = vTangential * phiHat;

    float x = rIsco / r;
    temp = pow(x, 0.75) * pow(max(1.0 - sqrt(x) * 0.95, 0.0), 0.25);
  } else {
    // Plunging Region: caida libre suave en espiral hacia el horizonte
    float f = max(1.0 - rPlus / r, 0.0);
    float omegaIsco = sqrtM / (pow(rIsco, 1.5) + a_spin * sqrtM);
    float vIsco = rIsco * omegaIsco;
    float vTangential = vIsco * (rIsco / r) * sqrt(max(f, 0.001));
    float vRadial = -sqrt(clamp(1.0 - f * (1.0 + (rIsco * rIsco) / (r * r)), 0.0, 1.0)) * 0.85;
    vGas = vTangential * phiHat + vRadial * rHat;

    temp = 0.48 * pow(max(r - rPlus, 0.0) / max(rIsco - rPlus, 0.001), 0.5);
    aRot += 1.8 * sqrt(rIsco - r);
  }

  // Estructura de plasma fluido organico
  vec3 q1 = vec3(r * 2.2, cos(aRot) * 2.2, sin(aRot) * 2.2);
  vec3 q2 = vec3(r * 4.6, cos(aRot * 1.6 + tAnim * 0.12) * 3.2, sin(aRot * 1.6 + tAnim * 0.12) * 3.2);
  float n1 = fbm(q1);
  float n2 = fbm(q2);
  float streaks = 0.55 + 0.75 * n1 * (0.6 + 0.7 * n2);
  float rings = 0.82 + 0.18 * sin(r * 5.2 + n1 * 1.3);
  float bright = temp * rings * streaks * 2.8;

  // Transicion suave hacia el borde exterior (desvanecimiento continuo sin cortes)
  float edgeIn = smoothstep(rPlus * 1.01, rPlus * 1.15, r);
  float edgeOut = smoothstep(DISK_OUT, DISK_OUT * 0.45, r);
  bright *= edgeIn * edgeOut;
  if(bright <= 0.0001) return vec4(0.0);

  // Doppler relativista + corrimiento gravitacional
  float beta = min(length(vGas), 0.95);
  float gamma = 1.0 / sqrt(1.0 - beta * beta);
  vec3 nPhoton = -normalize(vel);
  float D = 1.0 / (gamma * (1.0 - dot(vGas, nPhoton)));
  float g = sqrt(max(1.0 - rPlus / r, 0.0));
  float shift = clamp(D * g, 0.04, 3.2);

  // Beaming suave para preservar detalles en el lado brillante sin saturar en bloque
  float boost = pow(shift, 2.6);

  // Locus de Planck continuo segun temperatura observada
  float tc = temp * shift * 1.45;
  vec3 cold = vec3(0.72, 0.15, 0.02);
  vec3 warm = vec3(1.0, 0.58, 0.18);
  vec3 hot = vec3(1.0, 0.95, 0.88);
  vec3 blueShift = vec3(0.82, 0.91, 1.0);

  vec3 col;
  if(tc < 0.35){
    col = mix(cold, warm, tc / 0.35);
  } else if(tc < 0.85){
    col = mix(warm, hot, (tc - 0.35) / 0.5);
  } else {
    col = mix(hot, blueShift, min((tc - 0.85) * 0.7, 0.65));
  }

  // Modulacion de fotones en cruces secundarios (anillo de Einstein/fotones)
  float ringBoost = (crossingCount > 1) ? (1.0 + uGlow * 1.6) : (1.0 + uGlow * (0.25 / r));
  vec3 emit = col * bright * boost * uIntensity * ringBoost * 2.1;

  // Profundidad optica directamente proporcional al brillo/densidad:
  // en el borde exterior bright -> 0, por lo que tau -> 0 y alpha -> 0.
  // Esto elimina el borde negro opaco permitiendo que las estrellas de fondo se vean limpiamente.
  float cosIncidence = max(abs(vel.y) / max(length(vel), 0.001), 0.15);
  float tau = (2.2 * bright) / cosIncidence;
  float alpha = clamp(1.0 - exp(-tau), 0.0, 0.96);

  return vec4(emit, alpha);
}

vec3 aces(vec3 x){
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 dir = normalize(uCamFwd * uFov + uCamRight * uv.x + uCamUp * uv.y);

  vec3 pos = uCamPos;
  vec3 vel = dir;

  float rPlus = getRPlus(uSpin);
  float rIsco = getIsco(uSpin);

  vec3 col = vec3(0.0);
  float tr = 1.0;
  bool captured = false;
  int crossingCount = 0;

  vec3 acc = geodesicAcc(pos, vel);

  for(int i = 0; i < MAX_STEPS; i++){
    if(float(i) >= uSteps) break;
    float r = length(pos);
    if(r < rPlus){ captured = true; break; }
    if(r > 60.0 && dot(pos, vel) > 0.0) break;

    float dt = clamp(0.06 * r * r / (r + 2.0), 0.015, 1.4);
    if(abs(pos.y) < 1.0 && r < DISK_OUT + 2.0){
      dt = min(dt, 0.08 + abs(pos.y) * 0.25);
    }
    if(r < 3.2){
      dt = min(dt, 0.02 + 0.04 * (r - rPlus));
    }

    vec3 nextPos = pos + vel * dt + 0.5 * acc * (dt * dt);
    vec3 predVel = vel + acc * dt;
    vec3 nextAcc = geodesicAcc(nextPos, predVel);
    vec3 nextVel = vel + 0.5 * (acc + nextAcc) * dt;

    if(pos.y * nextPos.y < 0.0){
      crossingCount++;
      float t = pos.y / (pos.y - nextPos.y);
      vec3 p = mix(pos, nextPos, t);
      vec3 velAtP = mix(vel, nextVel, t);
      vec4 d = sampleDisk(p, velAtP, rPlus, rIsco, crossingCount);
      col += tr * d.rgb * d.a;
      tr *= (1.0 - d.a);
      if(tr < 0.008) break;
    }

    pos = nextPos;
    vel = nextVel;
    acc = nextAcc;
  }

  if(!captured) col += tr * background(normalize(vel));

  col = aces(col * 1.05);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = gl_FragCoord.xy / uRes;
  col *= 0.55 + 0.45 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.2);
  gl_FragColor = vec4(col, 1.0);
}
`;
