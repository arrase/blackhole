// Fondo de cielo: estrellas puntuales y banda galactica con polvo
export const background = `
// Celdas de estrellas por lado de cada cara del cubo de direcciones: una estrella candidata por celda,
// ~10 px en el centro de cara a 1080p
const float STAR_CELLS = 256.0;
// Flujo (radiancia x sr) de la estrella candidata mas debil y del tope. Cuentas euclideas
// N(>F) ∝ F^-3/2: solo ~3 % superan el limite visible y el cielo entero tiene un punado de brillantes
const float STAR_FLUX_MIN = 3e-8;
const float STAR_FLUX_MAX = 3e-4;
// PSF de la optica en pixeles (sigma): la estrella es un punto, su imagen ocupa ~1 px
const float STAR_PSF = 0.5;
// Radiancia del centro de la banda galactica. Como en la Via Lactea (~2.7 mag/grado^2 frente a -1.5 de
// Sirio): un grado cuadrado brilla como una estrella ~4 magnitudes mas debil que la mas brillante del
// cielo (~1e-4 entre las ~200 000 candidatas)
const float GALAXY_RADIANCE = 0.0075;
// Polo galactico: la banda cruza en diagonal por detras del agujero en la vista inicial (cine)
const vec3 GALAXY_AXIS = vec3(0.8289, -0.4964, -0.258);
// Luz integrada de la poblacion no resuelta de la banda, dominada por gigantes K: cuerpo negro de
// 5 kK (B-V ~ 0.85, el color integrado de la Via Lactea)
const float GALAXY_T = 5.0;

// Radiancia observada de un cuerpo negro de temperatura T con luminancia unidad en reposo: el cielo
// llega desde el infinito (p_t = -E_inf) al observador estatico (p.U = -1) desplazado al azul
// g = -1/uPt, y g^3 I_nu(nu / g, T) = I_nu(nu, g T): color y brillo (g^4 bolometrico) en un paso
vec3 skyBlackbody(float T){
  return blackbody(-T / uPt) / dot(blackbody(T), LUMA);
}

// Estrellas puntuales con flujo conservado: la imagen de un punto es la PSF en pixeles, y su
// brillo F K / A, con A el angulo solido del cielo que cubre el pixel. La lente cambia A (A = Omega_pixel
// / mu): la magnificacion abrillanta la estrella sin estirarla, y el flujo no depende de la resolucion.
// Se evalua respecto al centro del pixel, no a la muestra con subpixel: la imagen no depende del
// frame. ddx, ddy: derivadas en pantalla de la direccion (la huella del pixel en el cielo, ya lenteada)
vec3 stars(vec3 d, vec3 ddx, vec3 ddy, float density){
  // Cara del cubo (eje mayor) y coordenadas de cara, con su jacobiano respecto a los pixeles
  vec3 a = abs(d);
  int face = a.x > a.y && a.x > a.z ? 0 : (a.y > a.z ? 1 : 2);
  vec3 m = face == 0 ? d.yzx : (face == 1 ? d.zxy : d);
  vec3 mx = face == 0 ? ddx.yzx : (face == 1 ? ddx.zxy : ddx);
  vec3 my = face == 0 ? ddy.yzx : (face == 1 ? ddy.zxy : ddy);
  vec2 uv = m.xy / m.z;
  mat2 J = mat2((mx.xy - uv * mx.z) / m.z, (my.xy - uv * my.z) / m.z);
  // Huella singular (pliegue de la lente o derivadas sin definir): ninguna estrella
  if(abs(determinant(J)) < 1e-14) return vec3(0.0);
  mat2 toPixel = inverse(J);

  vec2 cell = floor((uv * 0.5 + 0.5) * STAR_CELLS);
  uint side = uint(face) + (m.z < 0.0 ? 3u : 0u);
  vec3 sum = vec3(0.0);
  for(int j = -1; j <= 1; j++){
    for(int i = -1; i <= 1; i++){
      vec2 c = cell + vec2(i, j);
      if(any(lessThan(c, vec2(0.0))) || any(greaterThanEqual(c, vec2(STAR_CELLS)))) continue;
      vec4 h = hash4(uvec4(uvec2(c), side, 0u));
      vec2 s = (c + h.xy) / STAR_CELLS * 2.0 - 1.0;
      // Densidad uniforme por angulo solido: la celda de cara cubre (1 + u^2 + v^2)^-3/2 del centro
      float keep = density * pow(1.0 + dot(s, s), -1.5);
      if(h.z >= keep) continue;
      vec2 q = toPixel * (s - uv) + uJitter;
      float k = exp(-0.5 * dot(q, q) / (STAR_PSF * STAR_PSF));
      if(k < 1e-4) continue;
      // h.z / keep es uniforme en [0, 1): flujo de la ley de potencias y temperatura del espectro
      float F = min(STAR_FLUX_MIN * pow(max(h.z / keep, 1e-12), -2.0 / 3.0), STAR_FLUX_MAX);
      // Temperaturas de 2.5 a 25 kK, mas frecuentes las frias (mediana ~4.4 kK)
      sum += skyBlackbody(2.5 * pow(10.0, h.w * h.w)) * F * k;
    }
  }
  return sum / (2.0 * PI * STAR_PSF * STAR_PSF * length(cross(ddx, ddy)));
}

// Cielo en la direccion d: devuelve la luz difusa de las estrellas no resueltas de la banda, cortada
// por bandas de polvo, y en starLight las estrellas puntuales (mas densas en el plano galactico)
vec3 background(vec3 d, vec3 ddx, vec3 ddy, out vec3 starLight){
  // Banda gaussiana de ~10 grados de semianchura, como la Via Lactea
  float lat = dot(d, GALAXY_AXIS);
  float band = exp(-18.0 * lat * lat);
  // Huella del pixel en el cielo para el LOD del polvo (rad)
  float fp = sqrt(length(cross(ddx, ddy)));
  float dust1 = fbm(d * 3.8, fp * 3.8, 4, 0.5).x;
  float dust2 = fbm(d * 7.5 + vec3(1.7, 3.2, 0.5), fp * 7.5, 4, 0.5).x;
  float clear = 1.0 - smoothstep(-0.2, 0.9, dust1 + 0.5 * dust2) * 0.85;
  starLight = uStars * stars(d, ddx, ddy, 0.4 + 0.6 * band * clear);
  return uStars * GALAXY_RADIANCE * band * clear * skyBlackbody(GALAXY_T);
}
`;
