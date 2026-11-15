// Disco de acrecion relativista de Novikov-Thorne + par magnetico interno GRMHD (Agol y Krolik 2000),
// region de caida espiral dentro del ISCO y corona caliente opticamente fina.
// Convenios de coordenadas y sentido de giro en kerr.ts; uniformes por frame en physics/disk.ts.
export const disk = `
uniform vec2 uIscoEL;     // E y L especificos de la orbita del ISCO: los conserva el gas que cae
uniform vec3 uNtRoots;    // Page-Thorne: raices x_i de x^3 - 3x + 2a
uniform vec3 uNtCoefs;    // Page-Thorne: c_i = 3 (x_i - a)^2 / (x_i (x_i - x_j)(x_i - x_k))
uniform float uFluxPeak;  // flujo maximo (mismas unidades que pageThorneFlux)
uniform float uTPeak;     // temperatura efectiva maxima, kK
uniform float uDiskUnit;  // unidades de radiancia del disco (ver physics/disk.ts)
uniform float uFlowPeriod;// ventana base de media orbita en r_peak, r_s / c
uniform vec2 uLayerPhase; // fase de cada capa del mapa de flujo en [0, 1) (reloj en CPU, doble precision)
uniform vec2 uLayerEpoch; // numero de siembra de cada capa (entero modulo 65536)

// Profundidad optica vertical base del disco en el anillo interno: el perfil radial Sigma ~ r^-1.2
// hace el borde exterior translucido con vetas volumetricas delante del nucleo ardiente
const float DISK_TAU = 4.6;
// Velocidad radial transonica de entrada al ISCO (~ c_s en discos magnetizados GRMHD): produce
// lenguas espirales semitransparentes visibles entre r_ISCO y el horizonte r+
const float ISCO_INFLOW = 0.025;
// Dispersion de ln(densidad) y ln(disipacion) de la turbulencia MRI: filamentos de choque MHD
// definidos y canales entre brazos con profundidad volumetrica real
const vec2 TURBULENCE = vec2(0.84, 0.56);
// Celdas base por vuelta: multiplo exacto de NOISE_SIZE.x (64), azimut 100 % sin costura
const float GAS_CELLS = 256.0;
// Celdas radiales por unidad de sqrt(r): mantiene el espesor fino de los filamentos hasta el borde
const float GAS_RADIAL = 22.0;
// Demagnificacion de Lyapunov por medio giro en la esfera de fotones para el LOD de anillos n>=1
const float LENS_DEMAG = 6.0;
// Peso relativo de la segunda cascada de filamentos finos
const float CASCADE_GAIN = 0.56;
// Sesgo de la huella del LOD: el jitter subpixel acumulado en la historia supermuestrea
const float LOD_BIAS = 0.45;

// Escala de altura volumetrica con flaring suave (H/r ~ 0.032 * r^0.18): cuerpo 3D visible
// estilo Interstellar y adelgazamiento relativista limpio hacia el horizonte
float diskHeight(float r){
  float flare = pow(max(r / uRIsco, 1.0), 0.18);
  return 0.032 * r * flare * sqrt(max(0.0, (r - uRPlus) / r));
}

// 4-velocidad del gas (u^t, u^r, u^phi) en Boyer-Lindquist. Fuera del ISCO, orbita circular prograda
// exacta; dentro, geodesica que cae conservando E y L del ISCO: (u^r)^2 = (1 - E^2)(r_isco/r - 1)^3
vec3 gasVelocity(float r){
  float a = spinA(), sm = sqrt(0.5);
  if(r >= uRIsco){
    float r32 = r * sqrt(r);
    float ut = (r32 + a * sm) / sqrt(r32 * (r32 - 1.5 * sqrt(r) + 2.0 * a * sm));
    return vec3(ut, 0.0, sm / (r32 + a * sm) * ut);
  }
  float E = uIscoEL.x, L = uIscoEL.y, delta = max(r * r - r + a * a, 1e-6);
  float ur = -sqrt((1.0 - E * E) * pow(uRIsco / r - 1.0, 3.0));
  float uphi = (L * (1.0 - 1.0 / r) + a * E / r) / delta;
  float ut = ((r * r + a * a + a * a / r) * E - a * L / r) / delta;
  return vec3(ut, ur, uphi);
}

// Flujo de Page-Thorne (ver physics/disk.ts) en x = sqrt(r / M)
float pageThorneFlux(float r){
  float x = sqrt(2.0 * r), x0 = sqrt(2.0 * uRIsco);
  float b = x - x0 - 1.5 * uSpin * log(x / x0) - dot(uNtCoefs, log((x - uNtRoots) / (x0 - uNtRoots)));
  return max(b, 0.0) / (x * x * x * x * (x * x * x - 3.0 * x + 2.0 * uSpin));
}

// Temperatura efectiva continua a traves del ISCO: incluye el par magnetico interno no nulo de
// Agol y Krolik (2000) y enfriamiento radial que despliega el espectro blanco-oro-naranja-carmesi
float diskTeff(float r, float d){
  if(r >= uRIsco){
    float fNorm = pageThorneFlux(r) / uFluxPeak + 0.065 * pow(uRIsco / r, 3.1) + 0.012 * pow(uRIsco / r, 1.35);
    return uTPeak * pow(d * fNorm, 0.225) * 0.99;
  }
  float u = clamp((r - uRPlus) / max(uRIsco - uRPlus, 1e-3), 0.0, 1.0);
  float plunge = (0.18 + 0.82 * u * u * (3.0 - 2.0 * u)) * exp(-1.10 * (1.0 - u));
  return uTPeak * pow(d * 0.077, 0.225) * 0.99 * plunge;
}

// Profundidad optica vertical en r: perfil concentrado en el anillo interno para que la periferia
// sea translucida con vetas volumetricas delante del nucleo ardiente
float diskColumn(float r, float ur){
  float edge = smoothstep(DISK_OUT, 0.72 * DISK_OUT, r);
  float radial = pow(uRIsco / max(r, uRIsco), 1.20);
  return DISK_TAU * edge * radial / (1.0 + r * abs(ur) / (uRIsco * ISCO_INFLOW));
}

// Turbulencia MRI en 2 cascadas:
// - Coordenada radial en sqrt(r) y espiral apretada (~8-12 grados) para formar filamentos
//   concéntricos tipo Interstellar hasta el borde exterior sin brazos de galaxia
// - Rotacion diferencial casi kepleriana (omega^0.78) y caida radial solo cerca/dentro del ISCO
// - Estructura 3D vertical marcada (q.z ~ 3.6 y/H) con nubes frias absorbentes en altura
vec2 gasFields(vec3 x, float r, float H, float omega, float fp){
  float sr = sqrt(r);
  vec3 q = vec3(atan(x.x, x.z) * GAS_CELLS / (2.0 * PI), sr * GAS_RADIAL, 3.6 * x.y / H);
  // Espiral apretada tipo Kepler/MRI (~8-12 grados de angulo de paso en el disco principal)
  float spiral = 9.0;
  q.x += spiral * q.y;
  float shear = 0.5 * spiral * GAS_RADIAL * sr;
  if(r < uRIsco){
    float span = max(uRIsco - uRPlus, 0.08);
    float u = (uRIsco - r) / span;
    q.x -= 1.4 * u * u / (u + 0.20) * GAS_CELLS / (2.0 * PI);
    shear += 1.4 * u * (u + 0.40) / ((u + 0.20) * (u + 0.20)) * r / span * GAS_CELLS / (2.0 * PI);
  }

  float normCasc = inversesqrt(1.0 + CASCADE_GAIN * CASCADE_GAIN);
  float omegaPeak = PI / uFlowPeriod;
  // Velocidad angular diferencial cercana a la kepleriana: nucleo rapido, borde exterior sereno
  float omegaPat = omegaPeak * pow(max(omega / omegaPeak, 1e-3), 0.78);
  float flowSpan = 0.55 * uFlowPeriod * GAS_CELLS / (2.0 * PI);
  float inflow = smoothstep(1.20 * uRIsco, uRPlus, r);
  float fp0 = LOD_BIAS * fp * length(vec2(0.5 * GAS_CELLS / (2.0 * PI), shear)) / r;
  float hLayer = smoothstep(0.45, 1.75, abs(x.y) / H);
  vec2 sum = vec2(0.0);
  float w2 = 0.0, kept = 0.0;

  for(int i = 0; i < 2; i++){
    float f = uLayerPhase[i];
    float w = 1.0 - abs(2.0 * f - 1.0);
    float layerShear = shear + 1.17 * (f - 0.35) * omegaPat * flowSpan;
    float fp1 = 4.0 * fp0 * sqrt(1.0 + 6.0e-5 * layerShear * layerShear);
    float w1 = 1.0 - smoothstep(4.5, 11.0, fp1);
    float v0 = 1.0 / (1.0 + 0.05 * fp0 * fp0);
    float v1 = (w1 * w1) / (1.0 + 0.05 * fp1 * fp1);
    kept += w * w * (v0 + CASCADE_GAIN * CASCADE_GAIN * v1) / (1.0 + CASCADE_GAIN * CASCADE_GAIN);

    vec3 seed = hash4(uvec4(uint(uLayerEpoch[i]), uint(i), 0u, 0u)).xyz * NOISE_SIZE;
    // floor(seed.x / 4) * 4 conserva la periodicidad exacta en 0.25 * qi.x (64) y 0.5 * qi.x (128)
    vec3 qi = q + vec3(floor(seed.x * 0.25) * 4.0, seed.yz);
    qi.x -= (f - 0.35) * omegaPat * flowSpan;
    qi.y += (f - 0.35) * (0.12 + 1.8 * inflow);

    // 1 sola lectura macro (0.25 * 256 = 64 = NOISE_SIZE.x, 100 % sin costura en azimut):
    // warp 3D suave para ondular filamentos y capas verticales sin crear brazos de galaxia
    vec4 macro = turbulence(qi * vec3(0.25, 0.90, 0.65), fp0 * 0.35);
    vec3 qw = qi + vec3(macro.wx * vec2(2.6, 0.75), macro.z * 0.90);

    vec3 c0 = turbulence(qw * vec3(0.5, 1.25, 1.0), fp0 * 0.65).xyz;
    if(w1 > 0.0){
      vec3 c1 = turbulence(qw * vec3(2.0, 4.0, 3.0) + vec3(0.0, 19.3, 7.1), fp1 * 0.55).xyz;
      c0 += (CASCADE_GAIN * w1) * c1;
    }
    c0 *= normCasc;

    // c0.x = rho, c0.y = diss, c0.z = ridge (filamentos de choque MHD densos e incandescentes).
    // En el plano medio (hLayer=0) la densidad y la temperatura se refuerzan; en las capas altas
    // (hLayer=1) las nubes densas se enfrian y crean vetas de absorcion volumetrica 3D
    vec2 g = vec2(
      0.72 * c0.x + 0.56 * c0.z + 0.16 * macro.z,
      0.62 * c0.y + 0.78 * c0.z + mix(0.32, -0.45, hLayer) * c0.x
    );
    sum += w * g;
    w2 += w * w;
  }
  float totalVar = min(kept / w2 + 0.22, 1.15);
  return exp(TURBULENCE * sum * inversesqrt(w2) - 0.5 * TURBULENCE * TURBULENCE * totalVar);
}

// erfc(x), x >= 0 (Abramowitz-Stegun 7.1.27, error < 5e-4)
float erfc(float x){
  float d = 1.0 + x * (0.278393 + x * (0.230389 + x * (0.000972 + x * 0.078108)));
  d *= d;
  return 1.0 / (d * d);
}

// Profundidad optica vertical efectiva hacia el nucleo caliente
float diskDepth(float y, float H, float column){
  return min(max(column, 1.2), 2.6) * 0.5 * erfc(abs(y) / (sqrt(2.0) * H));
}

// Integral analitica del perfil gaussiano vertical entre y0 e y1 en el marco comovil del plasma,
// conservando profundidad volumetrica a angulos rasantes sin ocultar del todo el nucleo
float diskSlabTau(float y0, float y1, float H, float column, float q, float dtComoving){
  float dy = abs(y1 - y0);
  float dtEff = min(dtComoving, 3.0 * dy + 0.38 * dtComoving);
  if(dy < 1e-4 * H){
    float ym = 0.5 * (y0 + y1);
    return q * column * exp(-0.5 * ym * ym / (H * H)) / (sqrt(2.0 * PI) * H) * dtEff;
  }
  float s0 = y0 >= 0.0 ? 0.5 * erfc(y0 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y0 / (sqrt(2.0) * H));
  float s1 = y1 >= 0.0 ? 0.5 * erfc(y1 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y1 / (sqrt(2.0) * H));
  return q * column * abs(s1 - s0) * (dtEff / dy);
}

// Curva Doppler C1-suave en g = 1 y exacta en el horizonte (g -> 0): acentua el contraste relativista
// y mantiene incandescente en rojo rubi/ambar el lado recesivo sin apagar sus filamentos
float effectiveRedshift(float g){
  float gc = max(g, 0.0);
  if(gc >= 1.0) return gc;
  float u = 1.0 - gc;
  return sqrt(gc * gc + 0.58 * gc * u * u);
}

// Funcion fuente S = B(g T) con estratificacion vertical de Eddington y soporte en la cola de Wien
// moderado para que las nubes frias en altura aporten sombreado volumetrico delante del nucleo
vec3 diskSource(float g, float teff, float tau){
  float gEff = effectiveRedshift(g);
  float T = gEff * teff * sqrt(sqrt(0.75 * (tau + 0.55)));
  float wienSupport = pow(max(uTPeak / max(T, 1.4), 1.0), 1.10);
  return blackbody(T) * (wienSupport * uDiskUnit);
}

// Corona magnetizada interna opticamente fina (H_cor = 3.0 H): halo relativista alrededor del ISCO y r+
float coronaColumn(float r){
  float inner = pow(uRIsco / max(r, 0.82 * uRIsco), 1.75);
  return 0.042 * inner * smoothstep(uRPlus, uRPlus + 0.10, r) * smoothstep(4.6, 1.7, r);
}
`;
