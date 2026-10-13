// Disco de acrecion fino de Novikov-Thorne (cinematica, temperatura, opacidad y textura del gas),
// integrado como volumen por el raymarch (diskAbsorption + diskSource).
// Convenios de coordenadas y sentido de giro en kerr.ts; uniformes por frame en physics/disk.ts.
export const disk = `
uniform vec2 uIscoEL;     // E y L especificos de la orbita del ISCO: los conserva el gas que cae
uniform vec3 uNtRoots;    // Page-Thorne: raices x_i de x^3 - 3x + 2a
uniform vec3 uNtCoefs;    // Page-Thorne: c_i = 3 (x_i - a)^2 / (x_i (x_i - x_j)(x_i - x_k))
uniform float uFluxPeak;  // flujo maximo (mismas unidades que pageThorneFlux)
uniform float uTPeak;     // temperatura efectiva maxima, kK
uniform float uDiskUnit;  // unidades de radiancia del disco (ver physics/disk.ts)
uniform float uFlowPeriod;// ventana del mapa de flujo, r_s / c
uniform vec2 uLayerPhase; // fase de cada capa del mapa de flujo en [0, 1) (reloj en CPU, doble precision)
uniform vec2 uLayerEpoch; // numero de siembra de cada capa (entero modulo 65536)

// Profundidad optica vertical total (las dos mitades) con densidad media: disco opticamente grueso,
// la fotosfera (tau = 2/3) define una superficie nitida sin emborronamiento radial en angulo rasante
const float DISK_TAU = 15.0;
// u^r del gas al llegar al ISCO: velocidad de acrecion viscosa alpha (H/r)^2 v_phi
const float ISCO_INFLOW = 1e-5;
// Dispersion de ln(densidad): fluctuaciones marcadas de densidad y disipacion en la turbulencia MRI
const float TURBULENCE = 0.96;
// Celdas de textura por vuelta: multiplo exacto de NOISE_SIZE.x (16), el azimut no tiene costura
const float GAS_CELLS = 16.0;
// Celdas por unidad de ln r: estructuras 20 veces mas largas en azimut que en radio (flujo kepleriano
// supersonico), formando filamentos orbitales largos y anillos zonales bien definidos
const float GAS_RADIAL = 20.0 * GAS_CELLS / (2.0 * PI);
// Demagnificacion media de las imagenes secundarias del disco para el filtrado LOD del ruido
const float LENS_DEMAG = 3.5;
// Octavas del ruido del gas: el LOD omite las mas finas que el pixel
const int GAS_OCTAVES = 7;
// Amplitud relativa de cada octava: cascada de Kolmogorov, fluctuaciones δ(l) ∝ l^(1/3) -> 2^(-1/3)
const float GAS_GAIN = 0.78;

// Escala de altura de la gaussiana vertical, H/r ~ 0.0065: disco de Shakura-Sunyaev fino. Reduce el
// recorrido radial oblicuo en vistas casi de canto (~82.5 grados), logrando filamentos igual de
// nitidos en el frente que en el arco gravitatorio superior
float diskHeight(float r){
  return 0.0065 * r * sqrt(max(0.0, (r - uRPlus) / r));
}

// 4-velocidad del gas (u^t, u^r, u^phi) en Boyer-Lindquist. Fuera del ISCO, orbita circular prograda
// exacta; dentro, la geodesica que cae desde el ISCO con su E y L: (u^r)^2 = (1 - E^2)(r_isco/r - 1)^3.
// Continua en el ISCO, donde u^r = 0
vec3 gasVelocity(float r){
  float a = spinA(), sm = sqrt(0.5);
  if(r >= uRIsco){
    float r32 = r * sqrt(r);
    float ut = (r32 + a * sm) / sqrt(r32 * (r32 - 1.5 * sqrt(r) + 2.0 * a * sm));
    return vec3(ut, 0.0, sm / (r32 + a * sm) * ut);
  }
  float E = uIscoEL.x, L = uIscoEL.y, delta = r * r - r + a * a;
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

// Temperatura efectiva, T ∝ F^(1/4) con suave compresion del gradiente radial exterior (exponente 0.21)
// para evitar que el borde exterior caiga en el abismo infrarrojo de Wien al escalar T al visible.
// Justo dentro del ISCO conserva una tenue cola termica advectada por el plasma en caida libre
float diskTeff(float r, float d){
  if(r > uRIsco) return uTPeak * pow(d * pageThorneFlux(r) / uFluxPeak, 0.21);
  float plunge = exp(-4.5 * (uRIsco - r) / max(uRIsco - uRPlus, 0.1)) * smoothstep(uRPlus, uRIsco, r);
  return 0.24 * uTPeak * pow(d, 0.21) * plunge;
}

// Profundidad optica vertical total en r: constante en el disco, cae a cero en el borde exterior
// (truncado artistico del disco finito) y en la caida por conservacion de la masa, Sigma r |u^r| = cte
float diskColumn(float r, float ur){
  float edge = smoothstep(DISK_OUT, 0.78 * DISK_OUT, r);
  return DISK_TAU * edge / (1.0 + r * abs(ur) / (uRIsco * ISCO_INFLOW));
}

// Campos del gas, lognormales de media 1 como la turbulencia MRI: x = densidad relativa (3D), y =
// disipacion relativa de la columna. Donde los grumos densos (rho > 0) suben a la atmosfera alta,
// amortiguan la temperatura aparente (-0.30 * rho.x en g.y), mientras las hojas de corriente MHD
// (ridge) y los anillos zonales calientan los filamentos: esto produce surcos oscuros nitidos y vetas
// incandescentes de alto contraste en todo el disco
vec2 gasFields(vec3 x, float r, float H, float omega, float fp){
  vec3 q = vec3(atan(x.x, x.z) * GAS_CELLS / (2.0 * PI), log(r) * GAS_RADIAL, 0.20 * x.y / H);
  // Espiral kepleriana estacionaria (~1.4 grados de paso) que trenza las bandas en espiral logaritmica
  q.x -= 0.042 * q.y;
  // Huella efectiva en celdas radiales: resuelve los filamentos finos y filtra antes del limite de Nyquist
  float fpCells = 0.70 * fp * GAS_RADIAL / r;
  // Flujos zonales cuasi-axisimetricos (anillos de presion MRI en ln r, Johansen et al. 2009)
  float zonalRing = fbm(vec3(0.0, q.y, 3.7), fpCells, 6, 0.78).x;
  vec2 sum = vec2(0.0);
  float w2 = 0.0, kept = 0.0;
  for(int i = 0; i < 2; i++){
    float f = uLayerPhase[i];
    float w = 1.0 - abs(2.0 * f - 1.0);
    // Adveccion centrada en f = 0.5: velocidad angular exacta omega(r) con cizalla equilibrada en todo r
    vec3 qi = q + hash4(uvec4(uint(uLayerEpoch[i]), uint(i), 0u, 0u)).xyz * NOISE_SIZE;
    qi.x -= (f - 0.5) * omega * uFlowPeriod * GAS_CELLS / (2.0 * PI);
    // Remolinos MRI estirados en azimut: trenzan las vetas keplerianas sin trocearlas en manchas cortas
    vec2 warp = vec2(
      noise(qi * vec3(1.0, 0.16, 0.25) + vec3(0.0, 11.3, 5.7), fpCells * 0.4),
      noise(qi * vec3(1.0, 0.16, 0.25) + vec3(8.0, 4.1, 19.3), fpCells * 0.4)
    ) - 0.5;
    vec3 qw = qi + vec3(warp.x * 0.38, warp.y * 0.045, 0.0);
    vec2 rho = fbm(qw, fpCells, GAS_OCTAVES, GAS_GAIN);
    float diss = fbm(qw * vec3(1.0, 1.15, 0.5) + vec3(17.3, 29.1, 23.7), fpCells * 1.15, GAS_OCTAVES, GAS_GAIN).x;
    // Filamentos de hojas de corriente MHD (crestas agudas 1 - |g| con huella x1.75 por doblado de frecuencia)
    float ridge = (0.798 - abs(fbm(qw * vec3(1.0, 1.15, 0.5) + vec3(5.2, 7.9, 13.4), fpCells * 1.75, 6, 0.76).x)) / 0.603;
    vec2 g = vec2(
      0.74 * rho.x - 0.40 * ridge + 0.54 * zonalRing,
      0.54 * diss + 0.66 * ridge + 0.54 * zonalRing - 0.30 * rho.x
    );
    sum += w * g;
    w2 += w * w;
    kept = rho.y;
  }
  // Media 1 aunque el LOD filtre octavas: E[exp(s g)] = exp(s^2 var / 2)
  return exp(TURBULENCE * sum * inversesqrt(w2) - 0.5 * TURBULENCE * TURBULENCE * kept);
}

// erfc(x), x >= 0 (Abramowitz-Stegun 7.1.27, error < 5e-4)
float erfc(float x){
  float d = 1.0 + x * (0.278393 + x * (0.230389 + x * (0.000972 + x * 0.078108)));
  d *= d;
  return 1.0 / (d * d);
}

// Coeficiente de absorcion kappa rho (por unidad de longitud): columna gaussiana en z modulada
// por la densidad del gas q
float diskAbsorption(float y, float H, float column, float q){
  return q * column * exp(-0.5 * y * y / (H * H)) / (sqrt(2.0 * PI) * H);
}

// Profundidad optica vertical media desde la superficie mas cercana hasta la altura y
float diskDepth(float y, float H, float column){
  return 0.5 * column * erfc(abs(y) / (sqrt(2.0) * H));
}

// Integral analitica exacta del perfil gaussiano vertical entre y0 e y1 a lo largo de un tramo dt:
// elimina el ruido de muestreo puntual al cruzar el plano medio delgado
float diskSlabTau(float y0, float y1, float H, float column, float q, float dt){
  float dy = abs(y1 - y0);
  if(dy < 1e-4 * H) return diskAbsorption(0.5 * (y0 + y1), H, column, q) * dt;
  float s0 = y0 >= 0.0 ? 0.5 * erfc(y0 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y0 / (sqrt(2.0) * H));
  float s1 = y1 >= 0.0 ? 0.5 * erfc(y1 / (sqrt(2.0) * H)) : 1.0 - 0.5 * erfc(-y1 / (sqrt(2.0) * H));
  return q * column * abs(s1 - s0) * (dt / dy);
}

// Funcion fuente S = B(g T) en unidades del disco: color y beaming en un solo paso. En el lado
// recesivo (g < 1) suaviza el desplome exponencial de Wien (James et al. 2015, DNGR) para que los
// filamentos turbulentos del lado que se aleja conserven su color rojo-ambar sin apagarse a negro
vec3 diskSource(vec3 x, vec3 p, float r, vec3 gas, float teff, float tau){
  float g = redshift(p, ksVelocity(x, gas.x, gas.z));
  float gEff = g < 1.0 ? pow(max(g, 0.05), 0.62) : g;
  return blackbody(gEff * teff * sqrt(sqrt(0.75 * (tau + 0.14)))) * uDiskUnit;
}
`;
