// Espaciotiempo de Kerr: geodesicas nulas exactas en coordenadas de Kerr-Schild cartesianas.
//
// Convenios (unico sitio; src/physics/kerr.ts usa los mismos):
// - G = c = 1, M = 0.5 (r_s = 1), a = uSpin * M. Momento angular J = +a en el eje +y del shader.
//   Sentido progrado = giro a derechas alrededor de +y (de +z hacia +x): el disco gira asi.
// - Coordenadas: posicion del shader x = (x, y, z) = KS cartesianas (X, Y, Z) = (z, x, y) de la forma
//   SALIENTE de Kerr: X + iY = (r - ia) e^{i phiKS} sin(th), Z = r cos(th), con
//   dt_KS = dt_BL - (2Mr / Delta) dr y dphiKS = dphiBL - (a / Delta) dr. r de KS = r de Boyer-Lindquist.
//   Metrica g = eta + f L L, f = 2Mr^3 / (r^4 + a^2 Z^2), L_mu = (1, -m), m = dx/dr a phiKS fijo.
//   La forma saliente es regular en el horizonte pasado, al que tienden los rayos trazados hacia atras:
//   el momento covariante se mantiene O(1) en float32 hasta cruzar r+.
// - Estado del rayo: posicion x y momento espacial p = -p_i del foton fisico (apunta en el sentido del
//   trazado); p_t = uPt es la energia conservada (constante, igual para todos los pixeles). El foton
//   fisico tiene p_mu = (uPt, -p). Normalizacion: p.U = -1 para el observador estatico de la camara,
//   asi que g = (p.u)_obs / (p.u)_emit = -1 / (p.u)_emit.
export const kerr = `
float spinA(){ return 0.5 * uSpin; }

// r de Boyer-Lindquist en un punto: raiz de x^2 + z^2 + y^2 = r^2 + a^2 (1 - y^2 / r^2)
float ksRadius(vec3 x){
  float a2 = spinA() * spinA();
  float b = dot(x, x) - a2;
  return sqrt(0.5 * (b + sqrt(b * b + 4.0 * a2 * x.y * x.y)));
}

// Ecuaciones de Hamilton, H = 1/2 g^{mu nu} p_mu p_nu, del rayo trazado hacia atras:
// dx = dx/dlambda, dp = dp/dlambda (layout del shader). Devuelve r.
float geodesic(vec3 x, vec3 p, out vec3 dx, out vec3 dp){
  float a = spinA(), a2 = a * a;
  // Orden KS (X, Y, Z) = (z, x, y): las formulas quedan en su forma habitual
  vec3 q = x.zxy, k = p.zxy;
  float r = ksRadius(x), r2 = r * r;
  float iden = 1.0 / (r2 * r2 + a2 * q.z * q.z), id = 1.0 / (r2 + a2), ir = 1.0 / r;
  float f = r2 * r * iden;
  vec3 gradR = vec3(f * q.x, f * q.y, r * (r2 + a2) * q.z * iden);
  float P = q.x * k.x + q.y * k.y, Q = q.y * k.x - q.x * k.y;
  vec3 m = vec3(r * q.x - a * q.y, r * q.y + a * q.x, q.z * (r2 + a2) * ir) * id;
  // s = L^mu p_mu (con el signo del trazado)
  float mp = (r * P - a * Q) * id;
  float s = mp + q.z * k.z * ir - uPt;
  float dsdr = (P - 2.0 * r * mp) * id - q.z * k.z * ir * ir;
  vec3 ds = vec3((r * k.x + a * k.y) * id, (r * k.y - a * k.x) * id, k.z * ir) + dsdr * gradR;
  vec3 df = f * ((3.0 * ir - 4.0 * f) * gradR - vec3(0.0, 0.0, 2.0 * a2 * q.z * iden));
  dx = (k - f * s * m).yzx;
  dp = (0.5 * s * s * df + f * s * ds).yzx;
  return r;
}

// Para el disco: 4-velocidad de una orbita circular (u^t, u^phi de Boyer-Lindquist, u^r = u^theta = 0)
// en KS saliente, layout vec4(u^x, u^y, u^z, u^t). Con u^r = 0, t y phi de KS avanzan como los de BL.
// Solo emite el gas fuera del ISCO, que esta en orbita circular: el que cae no necesita esta forma
vec4 ksVelocity(vec3 x, float ut, float uphi){
  return vec4(uphi * vec3(x.z, 0.0, -x.x), ut);
}

// Corrimiento g = nu_obs / nu_emit de un emisor con 4-velocidad u (layout de ksVelocity)
float redshift(vec3 p, vec4 u){
  return -1.0 / (uPt * u.w - dot(p, u.xyz));
}
`;
