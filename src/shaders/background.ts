// Fondo de cielo: campo estelar de alta definicion con conservacion de flujo (teorema de Liouville)
// y Via Lactea sutil de alta frecuencia con grietas de polvo molecular
export const background = `
// Celdas de estrellas por lado de cada cara del cubo de direcciones (~540 000 celdas en el cielo)
const float STAR_CELLS = 300.0;
// Flujo de las estrellas y anchura angular base de la PSF (en pixeles equivalentes)
const float STAR_FLUX_MIN = 6.8e-9;
const float STAR_FLUX_MAX = 4.2e-4;
const float STAR_PSF = 0.41;
// Radiancia de la banda galactica: velo cosmico de alta definicion que enmarca el disco
const float GALAXY_RADIANCE = 0.012;
// Ejes galacticos ortonormales: la banda cruza en diagonal por detras del agujero en la vista inicial
const vec3 GALAXY_AXIS = vec3(0.8289, -0.4964, -0.258);
const vec3 GALAXY_X = vec3(-0.2966, 0.0, -0.955);
const vec3 GALAXY_Z = vec3(0.4738, 0.8681, -0.147);
// Luz integrada de la poblacion estelar de la banda (5.8 kK, blanco-marfil estelar)
const float GALAXY_T = 5.8;

// Radiancia observada de un cuerpo negro de temperatura T con luminancia unidad en reposo: el cielo
// llega desde el infinito (p_t = -E_inf) al observador estatico (p.U = -1) desplazado al azul
// g = -1/uPt, y g^3 I_nu(nu / g, T) = I_nu(nu, g T). Ajusta la saturacion base para que tras
// AGX_SATURATION las estrellas luzcan colores astronomicos puros (azul zafiro, blanco diamante, ambar)
vec3 skyBlackbody(float T){
  vec3 bb = blackbody(-T / uPt) / dot(blackbody(T), LUMA);
  return mix(vec3(1.0), bb, 0.72);
}

// Estrellas puntuales con flujo conservado: tanto el nucleo gaussiano como la corona optica de los
// astros brillantes se evaluan en espacio de pantalla (toPixel = inverse(J)) y van a la capa sin
// acumulacion temporal (starLight), evitando estelas en rotacion o arcos estirados
vec3 stars(vec3 d, vec3 ddx, vec3 ddy, float density){
  vec3 a = abs(d);
  int face = a.x > a.y && a.x > a.z ? 0 : (a.y > a.z ? 1 : 2);
  vec3 m = face == 0 ? d.yzx : (face == 1 ? d.zxy : d);
  vec3 mx = face == 0 ? ddx.yzx : (face == 1 ? ddx.zxy : ddx);
  vec3 my = face == 0 ? ddy.yzx : (face == 1 ? ddy.zxy : ddy);
  vec2 uv = m.xy / m.z;
  mat2 J = mat2((mx.xy - uv * mx.z) / m.z, (my.xy - uv * my.z) / m.z);
  float det = abs(determinant(J));
  if(det < 1e-14) return vec3(0.0);
  float sMax = max(length(J[0]), length(J[1]));
  float sMin = max(min(length(J[0]), length(J[1])), 1e-7);
  float resolve = (1.0 - smoothstep(0.32, 0.65, sMax * STAR_CELLS)) * (1.0 - smoothstep(2.4, 4.8, sMax / sMin));
  if(resolve <= 0.0) return vec3(0.0);
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
      float keep = min(0.92, density * pow(1.0 + dot(s, s), -1.5));
      if(h.z >= keep) continue;
      vec2 q = toPixel * (s - uv) + uJitter;
      float r2 = dot(q, q);
      if(r2 > 24.0) continue;
      float core = exp(-0.5 * r2 / (STAR_PSF * STAR_PSF));
      float F = min(STAR_FLUX_MIN * pow(max(h.z / keep, 1e-12), -0.76), STAR_FLUX_MAX);
      // Corona optica suave y cruz de difraccion en los astros mas brillantes, con nucleo blanco diamante
      float bright = smoothstep(5.5e-8, 3.2e-7, F);
      float halo = 0.0;
      if(bright > 0.0){
        float rPx = sqrt(r2);
        float spike = exp(-abs(q.x) * 2.0 - abs(q.y) * 0.36) + exp(-abs(q.y) * 2.0 - abs(q.x) * 0.36);
        halo = bright * (0.065 * exp(-rPx * 1.05) + 0.045 * spike);
      }
      float k = core + halo;
      if(k < 1e-4) continue;
      // Temperaturas de 3.1 a 26 kK: gigantes ambar, estrellas blancas y supergigantes azules OB
      vec3 tint = skyBlackbody(3.1 * pow(8.5, pow(h.w, 0.78)));
      sum += mix(tint, vec3(1.0), 0.65 * bright * core) * F * k;
    }
  }
  float omega0 = 0.45 / (uRes.y * uRes.y * uFov * uFov);
  float omegaSky = max(length(cross(ddx, ddy)), omega0);
  return sum * resolve / (2.0 * PI * STAR_PSF * STAR_PSF * omegaSky);
}

// Cielo en la direccion d: Via Lactea de alta resolucion con grietas de polvo y rico campo estelar
vec3 background(vec3 d, vec3 ddx, vec3 ddy, out vec3 starLight){
  float lat = dot(d, GALAXY_AXIS);
  float lon = dot(d, GALAXY_Z);
  float bulge = 0.55 + 0.60 * exp(-1.5 * (1.0 - abs(dot(d, GALAXY_X))) - 4.5 * lat * lat);
  float band = exp(-14.0 * lat * lat) + 0.22 * exp(-3.2 * lat * lat);
  float corePlane = exp(-65.0 * lat * lat);

  float fp = max(min(length(ddx), length(ddy)), 1.0 / (uRes.y * uFov));
  // 7 octavas de alta frecuencia: granulacion estelar fina y filamentos de polvo sin manchas borrosas
  float clouds = 0.62 + 0.38 * smoothstep(-1.1, 1.1, fbm(d * 8.0 + vec3(0.4, 1.3, 2.1), fp * 8.0, 7, 0.58).x);
  float dust1 = fbm(d * 8.5, fp * 8.5, 7, 0.56).x;
  float dust2 = fbm(d * 18.0 + vec3(1.7, 3.2, 0.5), fp * 18.0, 6, 0.54).x;
  float dustTau = (0.18 + 0.92 * corePlane) * smoothstep(-0.35, 0.95, dust1 + 0.5 * dust2) * 1.10;
  vec3 extinction = exp(-dustTau * vec3(0.75, 0.94, 1.18));
  float clear = dot(extinction, LUMA);

  float nebField = smoothstep(0.15, 0.85, fbm(d * 10.0 + vec3(4.1, 0.8, 2.9), fp * 10.0, 6, 0.55).x);
  vec3 nebula = band * nebField * extinction * (
    0.16 * smoothstep(-0.1, 0.7, sin(lon * 3.5 + dust1)) * skyBlackbody(3.8) +
    0.20 * smoothstep(-0.1, 0.7, -sin(lon * 3.5 + dust1)) * skyBlackbody(16.0)
  );

  starLight = uStars * stars(d, ddx, ddy, 0.72 + 0.85 * band * clear);
  return uStars * GALAXY_RADIANCE * (band * bulge * clouds * extinction * skyBlackbody(GALAXY_T) + nebula);
}
`;
