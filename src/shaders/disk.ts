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
// la fotosfera (tau = 2/3) queda a ~1.4 H del plano
const float DISK_TAU = 10.0;
// u^r del gas al llegar al ISCO: velocidad de acrecion viscosa alpha (H/r)^2 v_phi ~ 0.1 * 0.012^2 * 0.6
const float ISCO_INFLOW = 1e-5;
// Dispersion de ln(densidad): fluctuaciones de densidad de orden unidad, como en la turbulencia MRI
const float TURBULENCE = 0.7;
// Celdas de textura por vuelta: multiplo de su periodo en x, el azimut no tiene costura
const float GAS_CELLS = 16.0;
// Celdas por unidad de ln r: las estructuras escalan con r y son 16 veces mas largas en azimut que en
// radio, la cizalla kepleriana estira los remolinos en filamentos. La octava base (celda radial
// r / GAS_RADIAL ~ 2 H, arcos de ~0.4 r) son los flujos zonales de los discos MRI, anillos de presion
// de unas H de anchura (Johansen et al. 2009; Simon et al. 2012): de canto se ven como vetas
// horizontales nitidas. Las octavas finas son la turbulencia de escala menor que H (Guan et al. 2009)
const float GAS_RADIAL = 16.0 * GAS_CELLS / (2.0 * PI);
// Cada imagen de orden superior llega demagnificada ~e^pi (exponente de Lyapunov de la orbita de
// fotones por media vuelta): el pixel cubre tanto mas disco y su ruido se filtra en consecuencia
const float LENS_DEMAG = 23.14;
// Octavas del ruido del gas: el LOD omite las mas finas que el pixel, asi que apenas cuestan
const int GAS_OCTAVES = 6;
// Amplitud relativa de cada octava: cascada de Kolmogorov, fluctuaciones δ(l) ∝ l^(1/3) -> 2^(-1/3)
const float GAS_GAIN = 0.794;

// Escala de altura de la gaussiana vertical, H/r ~ 0.01-0.013: disco de Shakura-Sunyaev delgado. La
// fotosfera queda a ~1.4 H, semiespesor visible ~0.017 r
float diskHeight(float r){
  return 0.013 * r * sqrt(max(0.0, (r - uRPlus) / r));
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

// Temperatura efectiva, T ∝ F^(1/4). Par nulo en el ISCO: T -> 0 suavemente y el gas que cae no
// disipa, asi que la region de caida no emite. El flujo local es F d, con d la disipacion turbulenta
// integrada en la columna: intermitente como el estres MRI (Hirose, Krolik y Blaes 2009), conserva el
// flujo medio de Page-Thorne (E[d] = 1) y dibuja filamentos en todo el disco
float diskTeff(float r, float d){
  return r > uRIsco ? uTPeak * sqrt(sqrt(d * pageThorneFlux(r) / uFluxPeak)) : 0.0;
}

// Profundidad optica vertical total en r: constante en el disco, cae a cero en el borde exterior
// (truncado artistico del disco finito) y en la caida por conservacion de la masa, Sigma r |u^r| = cte
float diskColumn(float r, float ur){
  float edge = smoothstep(DISK_OUT, 0.8 * DISK_OUT, r);
  return DISK_TAU * edge / (1.0 + r * abs(ur) / (uRIsco * ISCO_INFLOW));
}

// Campos del gas, lognormales de media 1 como la turbulencia MRI: x = densidad relativa (3D), y =
// disipacion relativa de la columna (2D: corte horizontal de la misma textura, lejos en z, sin
// estructura vertical). La separacion es la del transporte radiativo: la densidad decide hasta donde
// llega la mirada y la disipacion integrada, Teff. Un grumo denso alto en la atmosfera no brilla mas:
// esta mas frio que la fotosfera que tapa y se ve como una veta oscura. Coordenadas que siguen al gas:
// azimut, ln r y z / H. Mapa de flujo de dos capas: cada una se advecta con la velocidad angular
// local del gas (incluida la caida) desde su ultima siembra; fundido triangular, resiembra con peso
// nulo y varianza restaurada. La cizalla kepleriana dentro de cada capa da las espirales que se
// arrastran hacia atras. fp: huella del pixel en unidades del mundo
vec2 gasFields(vec3 x, float r, float H, float omega, float fp){
  vec3 q = vec3(atan(x.x, x.z) * GAS_CELLS / (2.0 * PI), log(r) * GAS_RADIAL, x.y / H);
  // La textura se repite cada 64 celdas de ln r (factor 4.8 en r): z inclinado rompe la repeticion
  q.z += 0.37 * q.y;
  float fpCells = fp * GAS_RADIAL / r;
  vec2 sum = vec2(0.0);
  float w2 = 0.0, kept = 0.0;
  for(int i = 0; i < 2; i++){
    float f = uLayerPhase[i];
    float w = 1.0 - abs(2.0 * f - 1.0);
    // Edad de la capa f * uFlowPeriod: el gas de phi estaba en phi - omega * edad al sembrarla.
    // Cada siembra desplaza la textura a un punto nuevo
    vec3 qi = q + hash4(uvec4(uint(uLayerEpoch[i]), uint(i), 0u, 0u)).xyz * NOISE_SIZE;
    qi.x -= omega * f * uFlowPeriod * GAS_CELLS / (2.0 * PI);
    vec2 rho = fbm(qi, fpCells, GAS_OCTAVES, GAS_GAIN);
    float diss = fbm(qi + vec3(17.3, 29.1, 23.7 - x.y / H), fpCells, GAS_OCTAVES, GAS_GAIN).x;
    sum += w * vec2(rho.x, diss);
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

// Profundidad optica vertical media desde la superficie hasta la altura y
float diskDepth(float y, float H, float column){
  return 0.5 * column * erfc(abs(y) / (sqrt(2.0) * H));
}

// Funcion fuente S = B(g T) en unidades del disco: color y beaming g^3 en un solo paso. T de una
// atmosfera gris de Eddington, T^4 = 3/4 Teff^4 (tau + 2/3), con tau la profundidad optica vertical
// media: da el oscurecimiento al limbo, y la turbulencia se ve doble: donde el gas es menos denso la
// mirada llega a capas mas profundas, y donde es mas denso disipa mas (diskTeff)
vec3 diskSource(vec3 x, vec3 p, float r, vec3 gas, float teff, float tau){
  float g = redshift(p, ksVelocity(x, gas.x, gas.z));
  return blackbody(g * teff * sqrt(sqrt(0.75 * (tau + 2.0 / 3.0)))) * uDiskUnit;
}
`;
