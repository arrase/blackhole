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
uniform float uQuality;
uniform float uDiskTemp;
uniform float uAccretionDisk;

const int MAX_STEPS = 1100;
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

float diskHeight(float r, float rPlus){
  if(r <= rPlus || r >= DISK_OUT) return 0.0;
  return 0.065 * r * sqrt(max(0.0, (r - rPlus) / r));
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
  float star = pow(max(0.0, 1.0 - dist * 2.8), expFactor);
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

  // Micro-campo estelar ultra denso (polvo estelar de fondo)
  stars += starFieldLayer(d, 380.0, 0.38, 28.0, 2.2);

  // Estrellas tenues densas
  stars += starFieldLayer(d, 220.0, 0.48, 20.0, 2.8);

  // Estrellas medias
  stars += starFieldLayer(d, 120.0, 0.62, 14.0, 3.5);

  // Estrellas brillantes de primera magnitud
  stars += starFieldLayer(d, 55.0, 0.78, 10.0, 5.0);

  // Estrellas gigantes con halo luminoso sutil
  stars += starFieldLayer(d, 24.0, 0.88, 7.0, 6.8);

  // Concentracion de nubes estelares a lo largo del plano galactico
  vec3 gAxis = normalize(vec3(0.82, 0.38, 0.42));
  float galBand = exp(-pow(dot(d, gAxis) * 3.0, 2.0));
  float galCore = exp(-pow(dot(d, gAxis) * 1.8, 2.0));
  stars += starFieldLayer(d, 320.0, 0.35, 24.0, 3.2) * galCore * 2.2;

  // Bandas de polvo cosmico de alto contraste (nubes moleculares oscuras) y rica emision interestelar
  float dust1 = fbm(d * 3.8);
  float dust2 = fbm(d * 7.5 + vec3(1.7, 3.2, 0.5));
  float rifts = smoothstep(0.22, 0.65, dust1 * dust2);
  vec3 emissionCol = mix(vec3(0.02, 0.05, 0.14), vec3(0.26, 0.13, 0.04), dust1);
  vec3 nebula = pow(galBand, 1.6) * (1.0 - rifts * 0.82) * emissionCol * 1.5;

  return stars * uStars + nebula;
}

// Muestreo del disco de acrecion 2D base (Modo Baja)
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

  // Estructura de plasma fluido organico base
  vec3 q1 = vec3(r * 2.2, cos(aRot) * 2.2, sin(aRot) * 2.2);
  vec3 q2 = vec3(r * 4.6, cos(aRot * 1.6 + tAnim * 0.12) * 3.2, sin(aRot * 1.6 + tAnim * 0.12) * 3.2);
  float n1 = fbm(q1);
  float n2 = fbm(q2);
  float streaks = 0.55 + 0.75 * n1 * (0.6 + 0.7 * n2);
  float rings = 0.82 + 0.18 * sin(r * 5.2 + n1 * 1.3);
  float bright = temp * rings * streaks * 2.8;

  float edgeIn = smoothstep(rPlus * 1.01, rPlus * 1.15, r);
  float edgeOut = smoothstep(DISK_OUT, DISK_OUT * 0.45, r);
  bright *= edgeIn * edgeOut;
  if(bright <= 0.0001) return vec4(0.0);

  float beta = min(length(vGas), 0.95);
  float gamma = 1.0 / sqrt(1.0 - beta * beta);
  vec3 nPhoton = -normalize(vel);
  float D = 1.0 / (gamma * (1.0 - dot(vGas, nPhoton)));
  float g = sqrt(max(1.0 - rPlus / r, 0.0));
  float shift = clamp(D * g, 0.04, 3.2);
  float boost = pow(shift, 2.6);

  float tc = temp * shift * 1.45;
  tc *= uDiskTemp;
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

  float ringBoost = (crossingCount > 1) ? (1.0 + uGlow * 1.6) : (1.0 + uGlow * (0.25 / r));
  vec3 emit = col * bright * boost * uIntensity * ringBoost * 2.1;

  float cosIncidence = max(abs(vel.y) / max(length(vel), 0.001), 0.15);
  float tau = (2.2 * bright) / cosIncidence;
  float alpha = clamp(1.0 - exp(-tau), 0.0, 0.96);

  return vec4(emit, alpha);
}

// Radiacion espectral de cuerpo negro basada en la Ley de Planck (RGB: 650nm, 540nm, 450nm)
vec3 planckBlackbody(float T){
  // T en miles de Kelvin (kK). Rango fisico: 1.0 kK (1000 K) a 40.0 kK (40000 K)
  T = max(T, 0.4);
  // c2 / lambda para R (0.65 um), G (0.54 um), B (0.45 um):
  vec3 c2_lambda = vec3(22.13, 26.64, 31.97);
  vec3 denom = exp(c2_lambda / T) - 1.0;
  // Factores fotometricos sRGB (1 / lambda^5)
  vec3 spec = vec3(1.4, 1.0, 1.25) / denom;
  float maxVal = max(spec.r, max(spec.g, spec.b));
  return spec / max(maxVal, 0.00001);
}

// Muestreo del disco de acrecion 2D con turbulencia MHD (Modo Media)
vec4 sampleDiskMHD(vec3 p, vec3 vel, float rPlus, float rIsco, int crossingCount){
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
  float tEmit;

  if(r >= rIsco){
    // Zona kepleriana estable (Novikov-Thorne / Shakura-Sunyaev)
    float vTangential = min(r * omega / sqrt(max(1.0 - 1.0 / r, 0.05)), 0.85);
    vGas = vTangential * phiHat;

    float x = rIsco / r;
    float tempNorm = pow(x, 0.75) * pow(max(1.0 - sqrt(x) * 0.95, 0.0), 0.25);
    tEmit = 7.5 * tempNorm;
  } else {
    // Plunging Region: caida libre suave en espiral hacia el horizonte
    float f = max(1.0 - rPlus / r, 0.0);
    float omegaIsco = sqrtM / (pow(rIsco, 1.5) + a_spin * sqrtM);
    float vIsco = rIsco * omegaIsco;
    float vTangential = vIsco * (rIsco / r) * sqrt(max(f, 0.001));
    float vRadial = -sqrt(clamp(1.0 - f * (1.0 + (rIsco * rIsco) / (r * r)), 0.0, 1.0)) * 0.85;
    vGas = vTangential * phiHat + vRadial * rHat;

    tEmit = 3.6 * pow(max(r - rPlus, 0.0) / max(rIsco - rPlus, 0.001), 0.5);
    aRot += 1.8 * sqrt(rIsco - r);
  }
  float temp = tEmit / 7.5;

  // Turbulencia MHD realista con domain warping y ondas de choque espirales
  float spiral1 = 2.0 * aRot - 1.8 * log(max(r / max(rIsco, 0.1), 0.001));
  float spiral2 = 4.0 * aRot - 2.6 * log(max(r / max(rIsco, 0.1), 0.001));
  float shock = pow(0.5 + 0.5 * sin(spiral1), 1.8) * (0.8 + 0.2 * sin(spiral2));

  // Multi-octave domain warping para filamentos magneticos y remolinos de plasma
  vec3 q = vec3(r * 2.5, cos(aRot) * 2.5, sin(aRot) * 2.5);
  vec3 qWarp = q + vec3(
    fbm(q + vec3(tAnim * 0.1, 0.0, 1.5)),
    fbm(q + vec3(2.1, tAnim * 0.12, 0.0)),
    fbm(q + vec3(0.0, 3.4, -tAnim * 0.08))
  ) * 1.4;
  float n1 = fbm(qWarp);
  float n2 = fbm(qWarp * 2.2 + vec3(r * 1.6, 0.0, tAnim * 0.15));

  // Filamentos finos con gradientes pronunciados
  float filament = 1.0 - smoothstep(0.04, 0.35, abs(n1 - 0.5) * 2.0);

  // Estrias keplerianas de alta cizalladura combinadas con ondas de choque espirales
  vec3 qStreak = vec3(r * 6.0, cos(aRot * 4.0 + n1 * 2.2) * 4.5, sin(aRot * 4.0 + n1 * 2.2) * 4.5);
  float fineStreak = fbm(qStreak);
  float streaks = (0.4 + 0.85 * n1 * (0.5 + 0.8 * n2) + 0.45 * fineStreak + 0.55 * filament) * (0.7 + 0.65 * shock);

  // Anillos concentricos y modulacion de ondas de densidad
  float rings = (0.8 + 0.2 * sin(r * 6.2 + n1 * 2.0 + sin(spiral1) * 0.6)) * (0.88 + 0.12 * cos(r * 12.5 + n2 * 1.5));

  float bright = temp * rings * streaks * 2.8;

  // Transicion suave hacia el borde exterior
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
  float shift = clamp(D * g, 0.04, 3.4);
  float boost = pow(shift, 1.6);
  boost = max(boost, 0.42); // Incandescent thermal glow on the receding side!
  boost = boost / (1.0 + 0.15 * boost);

  // Calentamiento turbulento y corrimiento relativista observado (Ley de Planck)
  float tLocal = tEmit * (0.8 + 0.45 * filament + 0.3 * shock);
  float tObs = max(tLocal * pow(shift, 0.65), 2.6);
  tObs *= uDiskTemp;
  vec3 col = planckBlackbody(tObs);
  if(tObs > 10.0){
    col = mix(col, vec3(0.85, 0.92, 1.0), min((tObs - 10.0) / 25.0, 0.65));
  }

  // Modulacion de fotones en cruces secundarios con intensidad fisica suave
  float ringBoost = (crossingCount > 1) ? (1.0 + uGlow * 1.8) : (1.0 + uGlow * (0.3 / r));
  vec3 emit = col * bright * boost * uIntensity * ringBoost * 2.0;

  float cosIncidence = max(abs(vel.y) / max(length(vel), 0.001), 0.15);
  float tau = (2.4 * bright) / cosIncidence;
  float alpha = clamp(1.0 - exp(-tau), 0.0, 0.97);

  return vec4(emit, alpha);
}

// Muestreo volumetrico continuo 3D del disco de acrecion (Modo Alta)
vec4 sampleDiskVolume(vec3 pos, vec3 vel, float dt, float rPlus, float rIsco, int crossingCount, float H){
  float r = length(pos.xz);
  if(r < rPlus * 1.01 || r > DISK_OUT) return vec4(0.0);

  float M = 0.5;
  float a_spin = uSpin * M;
  float sqrtM = sqrt(M);

  // Frecuencia kepleriana prograda en Kerr
  float omega = sqrtM / (pow(r, 1.5) + a_spin * sqrtM);
  float phi = atan(pos.z, pos.x);

  // Adveccion temporal acotada: evita moire por cizalladura radial infinita
  float tAnim = mod(uTime * uDiskSpeed, 62.831853);
  float shearFlow = tAnim * (0.5 / (r + 1.4));
  float aRot = phi + shearFlow;

  vec3 rHat = vec3(pos.x, 0.0, pos.z) / r;
  vec3 phiHat = vec3(-pos.z, 0.0, pos.x) / r;
  vec3 vGas;
  float tEmit;

  if(r >= rIsco){
    // Zona kepleriana estable (Novikov-Thorne / Shakura-Sunyaev)
    float vTangential = min(r * omega / sqrt(max(1.0 - 1.0 / r, 0.05)), 0.85);
    vGas = vTangential * phiHat;

    float x = rIsco / r;
    float tempNorm = pow(x, 0.75) * pow(max(1.0 - sqrt(x) * 0.95, 0.0), 0.25);
    tEmit = 7.5 * tempNorm;
  } else {
    // Plunging Region: caida libre suave en espiral hacia el horizonte
    float f = max(1.0 - rPlus / r, 0.0);
    float omegaIsco = sqrtM / (pow(rIsco, 1.5) + a_spin * sqrtM);
    float vIsco = rIsco * omegaIsco;
    float vTangential = vIsco * (rIsco / r) * sqrt(max(f, 0.001));
    float vRadial = -sqrt(clamp(1.0 - f * (1.0 + (rIsco * rIsco) / (r * r)), 0.0, 1.0)) * 0.85;
    vGas = vTangential * phiHat + vRadial * rHat;

    tEmit = 3.6 * pow(max(r - rPlus, 0.0) / max(rIsco - rPlus, 0.001), 0.5);
    aRot += 1.8 * sqrt(rIsco - r);
  }
  float temp = tEmit / 7.5;

  // Turbulencia MHD realista con domain warping y ondas de choque espirales
  float spiral1 = 2.0 * aRot - 1.8 * log(max(r / max(rIsco, 0.1), 0.001));
  float spiral2 = 4.0 * aRot - 2.6 * log(max(r / max(rIsco, 0.1), 0.001));
  float shock = pow(0.5 + 0.5 * sin(spiral1), 1.8) * (0.8 + 0.2 * sin(spiral2));

  // Multi-octave domain warping para filamentos magneticos y remolinos de plasma en 3D
  vec3 q = vec3(r * 2.5, cos(aRot) * 2.5, sin(aRot) * 2.5);
  vec3 qWarp = q + vec3(
    fbm(q + vec3(tAnim * 0.1, 0.0, 1.5)),
    fbm(q + vec3(2.1, tAnim * 0.12, 0.0)),
    fbm(q + vec3(0.0, 3.4, -tAnim * 0.08))
  ) * 1.4;
  float n1 = fbm(qWarp);
  float n2 = fbm(qWarp * 2.2 + vec3(r * 1.6, 0.0, tAnim * 0.15));

  // Filamentos finos con gradientes pronunciados
  float filament = 1.0 - smoothstep(0.04, 0.35, abs(n1 - 0.5) * 2.0);

  // Estrias keplerianas de alta cizalladura combinadas con ondas de choque espirales en 3D
  vec3 qStreak = vec3(r * 6.0, cos(aRot * 4.0 + n1 * 2.2) * 4.5, sin(aRot * 4.0 + n1 * 2.2) * 4.5);
  float fineStreak = fbm(qStreak);
  float streaks = (0.4 + 0.85 * n1 * (0.5 + 0.8 * n2) + 0.45 * fineStreak + 0.55 * filament) * (0.7 + 0.65 * shock);

  // Anillos concentricos y modulacion de ondas de densidad
  float rings = (0.8 + 0.2 * sin(r * 6.2 + n1 * 2.0 + sin(spiral1) * 0.6)) * (0.88 + 0.12 * cos(r * 12.5 + n2 * 1.5));

  float bright = temp * rings * streaks * 2.8;

  // Transicion suave hacia el borde exterior
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
  float shift = clamp(D * g, 0.04, 3.4);
  float boost = pow(shift, 1.6);
  boost = max(boost, 0.42); // Incandescent thermal glow on the receding side!
  boost = boost / (1.0 + 0.15 * boost);

  // Calentamiento turbulento y corrimiento relativista observado (Ley de Planck)
  float tLocal = tEmit * (0.8 + 0.45 * filament + 0.3 * shock);
  float tObs = max(tLocal * pow(shift, 0.65), 2.6);
  tObs *= uDiskTemp;
  vec3 col = planckBlackbody(tObs);
  if(tObs > 10.0){
    col = mix(col, vec3(0.85, 0.92, 1.0), min((tObs - 10.0) / 25.0, 0.65));
  }

  // Modulacion de fotones en cruces secundarios con intensidad fisica suave
  float ringBoost = (crossingCount > 1) ? (1.0 + uGlow * 1.8) : (1.0 + uGlow * (0.3 / r));

  // Perfil vertical gaussiano de densidad
  float yNorm = pos.y / H;
  float rhoVertical = exp(-2.5 * yNorm * yNorm);

  // Densidad volumetrica y transporte radiativo del paso
  float rho = 7.0 * rhoVertical * bright;
  float dTau = min(rho * dt * 0.70, 0.25);
  float stepAlpha = 1.0 - exp(-dTau);
  vec3 stepEmit = col * rho * boost * uIntensity * ringBoost * 2.2;

  return vec4(stepEmit, stepAlpha);
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
      float baseDt = (uQuality >= 1.5) ? 0.046 : 0.08;
      dt = min(dt, baseDt + abs(pos.y) * 0.25);
    }
    if(r < 3.2){
      dt = min(dt, 0.02 + 0.04 * (r - rPlus));
    }

    vec3 nextPos = pos + vel * dt + 0.5 * acc * (dt * dt);
    vec3 predVel = vel + acc * dt;
    vec3 nextAcc = geodesicAcc(nextPos, predVel);
    vec3 nextVel = vel + 0.5 * (acc + nextAcc) * dt;

    if(uQuality >= 1.5){
      if(pos.y * nextPos.y < 0.0 && r < DISK_OUT){
        crossingCount++;
      }
      float rDisk = length(pos.xz);
      float H = diskHeight(rDisk, rPlus);
      if(uAccretionDisk > 0.5 && H > 0.001 && abs(pos.y) < H){
        vec4 step = sampleDiskVolume(pos, vel, dt, rPlus, rIsco, crossingCount, H);
        col += tr * step.rgb * step.a;
        tr *= (1.0 - step.a);
        if(tr < 0.008) break;
      }
    } else {
      if(pos.y * nextPos.y < 0.0){
        crossingCount++;
        if(uAccretionDisk > 0.5){
          float t = pos.y / (pos.y - nextPos.y);
          vec3 p = mix(pos, nextPos, t);
          vec3 velAtP = mix(vel, nextVel, t);
          vec4 d;
          if(uQuality >= 0.5){
            d = sampleDiskMHD(p, velAtP, rPlus, rIsco, crossingCount);
          } else {
            d = sampleDisk(p, velAtP, rPlus, rIsco, crossingCount);
          }
          col += tr * d.rgb * d.a;
          tr *= (1.0 - d.a);
          if(tr < 0.008) break;
        }
      }
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
