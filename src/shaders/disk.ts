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

// Profundidad optica vertical total del disco denso: fotosfera nitida (tau = 2/3)
const float DISK_TAU = 15.0;
// Velocidad radial transonica de entrada al ISCO (~ c_s en discos magnetizados GRMHD): produce
// lenguas espirales semitransparentes visibles entre r_ISCO y el horizonte r+
const float ISCO_INFLOW = 6e-3;
// Dispersion de ln(densidad): fluctuaciones marcadas de densidad y disipacion en la turbulencia MRI
const float TURBULENCE = 0.94;
// Celdas base por vuelta: multiplo exacto de NOISE_SIZE.x (64), azimut 100 % sin costura (32..1024 octavas)
const float GAS_CELLS = 256.0;
// Densidad radial base en ln r: combinada con la cizalla espiral inclina los remolinos en brazos
// espirales logaritmicos trailing (~ -18 grados) con elongacion supersonica realista
const float GAS_RADIAL = 2.6 * GAS_CELLS / (2.0 * PI);
// Demagnificacion de Lyapunov por medio giro cerca de la esfera de fotones para el LOD de imagenes n=1,2
const float LENS_DEMAG = 11.0;
// Peso relativo de la segunda cascada (8x frecuencia -> 2048 muestras azimutales efectivas): 0.78^3
const float CASCADE_GAIN = 0.474552;

// Escala de altura con flaring concavo de Shakura-Sunyaev (H/r ~ r^(1/8)): geometria 3D realista
// en el borde exterior y adelgazamiento relativista limpio hacia el horizonte
float diskHeight(float r){
  float flare = pow(max(r / uRIsco, 1.0), 0.125);
  return 0.0068 * r * flare * sqrt(max(0.0, (r - uRPlus) / r));
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
// Agol y Krolik (2000) que evita el hueco negro artificial en r_ISCO+ y enlaza sin salto con el
// enfriamiento adiumatico de las lenguas de plasma que caen hacia r+
float diskTeff(float r, float d){
  if(r >= uRIsco){
    float fNorm = pageThorneFlux(r) / uFluxPeak + 0.065 * pow(uRIsco / r, 3.2);
    return uTPeak * pow(d * fNorm, 0.21) * 0.986;
  }
  float u = clamp((r - uRPlus) / max(uRIsco - uRPlus, 1e-3), 0.0, 1.0);
  float plunge = u * u * (3.0 - 2.0 * u) * exp(-1.55 * (1.0 - u));
  return uTPeak * pow(d * 0.065, 0.21) * 0.986 * plunge;
}

// Profundidad optica vertical total en r: conserva el flujo masico Sigma r |u^r| = cte en la caida
float diskColumn(float r, float ur){
  float edge = smoothstep(DISK_OUT, 0.78 * DISK_OUT, r);
  return DISK_TAU * edge / (1.0 + r * abs(ur) / (uRIsco * ISCO_INFLOW));
}

// Flujos zonales cuasi-axisimetricos (anillos de presion MRI en ln r, evaluados 1 vez por macro-paso)
float diskZonalRing(float r, float fp){
  float qy = log(r) * GAS_RADIAL;
  float fpCells = 0.70 * fp * GAS_RADIAL / r;
  return fbm(vec3(0.0, qy * 0.08, 3.7), fpCells * 0.16, 4, 0.78).x;
}

// Turbulencia MRI en 2 cascadas (32..128 -> 256..1024 remolinos azimutales efectivos) con
// solo 4 a 6 lecturas 3D por sub-paso en lugar de 50:
// - Espiral logaritmica trailing (+1.15 * q.y) + adveccion sesgada hacia delante (f - 0.18)
// - Torsión de lineas de corriente en caida libre dentro del ISCO
vec2 gasFields(vec3 x, float r, float H, float omega, float fp, float zonalRing){
  vec3 q = vec3(atan(x.x, x.z) * GAS_CELLS / (2.0 * PI), log(r) * GAS_RADIAL, 2.2 * x.y / H);
  // Espiral kepleriana trailing: el gas interior va adelantado en +phi respecto al exterior
  q.x += 1.15 * q.y;
  if(r < uRIsco){
    float u = (uRIsco - r) / max(uRIsco - uRPlus, 0.08);
    float deltaPhi = 2.1 * (u * u) / (u + 0.16);
    q.x -= deltaPhi * GAS_CELLS / (2.0 * PI);
  }

  float fp0 = 0.85 * fp * GAS_RADIAL / r;
  float fp1 = 8.0 * fp0;
  float w1 = 1.0 - smoothstep(3.5, 9.0, fp1);
  float normCasc = inversesqrt(1.0 + CASCADE_GAIN * CASCADE_GAIN);
  float v0 = 1.0 / (1.0 + 0.06 * fp0 * fp0);
  float v1 = (w1 * w1) / (1.0 + 0.06 * fp1 * fp1);
  float kept = (v0 + CASCADE_GAIN * CASCADE_GAIN * v1) / (1.0 + CASCADE_GAIN * CASCADE_GAIN);

  vec2 sum = vec2(0.0);
  float w2 = 0.0;
  float flowSpan = 2.0 * uFlowPeriod * GAS_CELLS / (2.0 * PI);

  for(int i = 0; i < 2; i++){
    float f = uLayerPhase[i];
    float w = 1.0 - abs(2.0 * f - 1.0);
    vec3 seed = hash4(uvec4(uint(uLayerEpoch[i]), uint(i), 0u, 0u)).xyz * NOISE_SIZE;
    vec3 qi = q + vec3(floor(seed.x), seed.yz);
    // Adveccion sesgada hacia delante (f - 0.18): nace ya trailing y se enrolla con la cizalla real
    qi.x -= (f - 0.18) * omega * flowSpan;

    float warpA = turbulence(qi * vec3(1.0, 0.28, 0.35), fp0 * 0.5).w;
    float warpB = turbulence(qi * vec3(1.0, 0.28, 0.35) + vec3(16.0, 31.0, 9.0), fp0 * 0.5).w;
    vec3 qw = qi + vec3(warpA * 2.4, warpB * 1.0, 0.0);

    vec3 c0 = turbulence(qw, fp0).xyz;
    if(w1 > 0.0){
      vec3 c1 = turbulence(qw * 8.0 + vec3(0.0, 19.3, 7.1), fp1).xyz;
      c0 += (CASCADE_GAIN * w1) * c1;
    }
    c0 *= normCasc;

    // c0.x = rho, c0.y = diss, c0.z = ridge (hojas de corriente MHD brillantes y huecos filamentosos)
    vec2 g = vec2(
      0.74 * c0.x - 0.42 * c0.z + 0.48 * zonalRing,
      0.55 * c0.y + 0.68 * c0.z + 0.48 * zonalRing - 0.28 * c0.x
    );
    sum += w * g;
    w2 += w * w;
  }
  float totalVar = min(kept + 0.23, 1.15);
  return exp(TURBULENCE * sum * inversesqrt(w2) - 0.5 * TURBULENCE * TURBULENCE * totalVar);
}

// erfc(x), x >= 0 (Abramowitz-Stegun 7.1.27, error < 5e-4)
float erfc(float x){
  float d = 1.0 + x * (0.278393 + x * (0.230389 + x * (0.000972 + x * 0.078108)));
  d *= d;
  return 1.0 / (d * d);
}

// Profundidad optica vertical media desde la superficie mas cercana hasta la altura y
float diskDepth(float y, float H, float column){
  return 0.5 * column * erfc(abs(y) / (sqrt(2.0) * H));
}

// Integral analitica exacta del perfil gaussiano vertical entre y0 e y1 en el marco comovil del plasma:
// invGSpeed = 1 / (g * |dx|) introduce la aberracion relativista covariante dtau = (-p.u) chi dlambda
float diskSlabTau(float y0, float y1, float H, float column, float q, float dtComoving){
  float dy = abs(y1 - y0);
  if(dy < 1e-4 * H){
    float ym = 0.5 * (y0 + y1);
    return q * column * exp(-0.5 * ym * ym / (H * H)) / (sqrt(2.0 * PI) * H) * dtComoving;
  }
  float s0 = y0 >= 0.0 ? 0.5 * erfc(y0 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y0 / (sqrt(2.0) * H));
  float s1 = y1 >= 0.0 ? 0.5 * erfc(y1 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y1 / (sqrt(2.0) * H));
  return q * column * abs(s1 - s0) * (dtComoving / dy);
}

// Curva Doppler C1-suave en g = 1 y exacta en el horizonte (g -> 0): acentua el contraste relativista
// y el rojo carmesi profundo del lado recesivo sin apagar los filamentos turbulentos antes del horizonte
float effectiveRedshift(float g){
  float gc = max(g, 0.0);
  if(gc >= 1.0) return gc;
  float u = 1.0 - gc;
  return sqrt(gc * gc + 0.46 * gc * u * u);
}

// Funcion fuente S = B(g T) con atmosfera gris de Eddington (tau + 0.45): color y beaming en un paso
vec3 diskSource(float g, float teff, float tau){
  float gEff = effectiveRedshift(g);
  return blackbody(gEff * teff * sqrt(sqrt(0.75 * (tau + 0.45)))) * uDiskUnit;
}

// Corona magnetizada interna opticamente fina (H_cor = 3.0 H): brillo de limbo 3D curvado por Kerr
float coronaColumn(float r){
  float inner = pow(uRIsco / max(r, 0.85 * uRIsco), 1.6);
  return 0.024 * inner * smoothstep(uRPlus, uRPlus + 0.14, r) * smoothstep(4.2, 1.8, r);
}
`;
