import { color } from "./color";
import { hash, header } from "./common";

// Shader de horneado unico al inicio para el cubemap HDR de la Via Lactea (512x512x6 RGBA16F).
// Separa en 2 capas el transporte radiativo del polvo interestelar (enrojecimiento selectivo CCM89
// sobre el bulbo de fondo + velo estelar cercano en primer plano) e incluye regiones H II (H-alfa /
// [O III]) y nebulosas de reflexion OB. El canal alfa guarda la densidad estelar modulada por polvo.
export const skyCubemapFragment = `${header}
uniform float uFace;
in vec2 vUv;
out vec4 fragColor;
${hash}
${color}

const float GALAXY_RADIANCE = 0.025;
const vec3 GALAXY_AXIS = vec3(0.8289, -0.4964, -0.258);
const vec3 GALAXY_X = vec3(-0.2966, 0.0, -0.955);
const vec3 GALAXY_Z = vec3(0.4738, 0.8681, -0.147);
const float GALAXY_T = 5.8;

vec3 restTint(float T){
  vec3 bb = blackbody(T) / dot(blackbody(T), LUMA);
  return mix(vec3(1.0), bb, 0.78);
}

float hashNoise(vec3 p){
  vec3 i = floor(p);
  vec3 f = p - i;
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  uvec3 b = uvec3(ivec3(i) + 32768);
  float c000 = hash4(uvec4(b, 1u)).x;
  float c100 = hash4(uvec4(b + uvec3(1u, 0u, 0u), 1u)).x;
  float c010 = hash4(uvec4(b + uvec3(0u, 1u, 0u), 1u)).x;
  float c110 = hash4(uvec4(b + uvec3(1u, 1u, 0u), 1u)).x;
  float c001 = hash4(uvec4(b + uvec3(0u, 0u, 1u), 1u)).x;
  float c101 = hash4(uvec4(b + uvec3(1u, 0u, 1u), 1u)).x;
  float c011 = hash4(uvec4(b + uvec3(0u, 1u, 1u), 1u)).x;
  float c111 = hash4(uvec4(b + uvec3(1u, 1u, 1u), 1u)).x;
  float c00 = mix(c000, c100, u.x), c10 = mix(c010, c110, u.x);
  float c01 = mix(c001, c101, u.x), c11 = mix(c011, c111, u.x);
  return mix(mix(c00, c10, u.y), mix(c01, c11, u.y), u.z);
}

float skyFbm(vec3 p, int octaves, float gain){
  float v = 0.0, total = 0.0, a = 1.0;
  for(int i = 0; i < octaves; i++){
    v += a * (hashNoise(p) - 0.5);
    total += a * a;
    p = p * 2.03 + vec3(1.7, 2.3, 1.1);
    a *= gain;
  }
  return v * inversesqrt(total) / 0.235;
}

vec3 cubeDir(int face, vec2 uv){
  if(face == 0) return normalize(vec3(1.0, -uv.y, -uv.x));
  if(face == 1) return normalize(vec3(-1.0, -uv.y, uv.x));
  if(face == 2) return normalize(vec3(uv.x, 1.0, uv.y));
  if(face == 3) return normalize(vec3(uv.x, -1.0, -uv.y));
  if(face == 4) return normalize(vec3(uv.x, -uv.y, 1.0));
  return normalize(vec3(-uv.x, -uv.y, -1.0));
}

void main(){
  vec3 d = cubeDir(int(uFace + 0.5), vUv * 2.0 - 1.0);
  float lat = dot(d, GALAXY_AXIS);
  float lon = atan(dot(d, GALAXY_Z), dot(d, GALAXY_X));
  float center = max(dot(d, GALAXY_X), 0.0);

  // Geometria galactica: bulbo central calido, disco fino estelar y halo difuso
  float bulge = 1.20 * exp(-2.5 * (1.0 - center) - 6.5 * lat * lat);
  float thinDisk = exp(-15.0 * lat * lat);
  float thickDisk = 0.36 * exp(-3.0 * lat * lat);
  float band = thinDisk + thickDisk;
  float corePlane = exp(-54.0 * lat * lat);

  // Nubes estelares no resueltas y brazos espirales granulados
  float clouds = 0.60 + 0.44 * smoothstep(-1.2, 1.3, skyFbm(d * 7.5 + vec3(0.4, 1.3, 2.1), 7, 0.58));
  float fineStars = 0.78 + 0.32 * smoothstep(-0.9, 1.2, skyFbm(d * 24.0 + vec3(5.2, 1.9, 3.4), 5, 0.55));

  // Grietas fractales de polvo molecular con extincion selectiva CCM89 (enrojecimiento en los bordes)
  float dust1 = skyFbm(d * 8.2, 7, 0.57);
  float dust2 = skyFbm(d * 19.5 + vec3(1.7, 3.2, 0.5), 6, 0.54);
  float ridgeDust = 1.0 - abs(skyFbm(d * 13.0 + vec3(3.1, 0.7, 4.8), 5, 0.56));
  float dustTau = (0.14 + 1.35 * corePlane + 0.32 * thinDisk)
    * smoothstep(-0.28, 0.92, 0.75 * dust1 + 0.42 * dust2 + 0.35 * (ridgeDust - 0.65));
  vec3 extinction = exp(-dustTau * vec3(0.68, 0.98, 1.36));
  vec3 nearVeil = exp(-0.24 * dustTau * vec3(0.74, 0.98, 1.28));
  float clear = dot(extinction, LUMA);

  // Capa lejana (bulbo ambar-marfil + brazos azulados extinguida por polvo) + capa cercana en primer plano
  vec3 farLight = (bulge * restTint(4.7) + band * clouds * restTint(GALAXY_T)) * fineStars * extinction;
  vec3 armBlue = 0.24 * thinDisk * smoothstep(0.1, 1.1, clouds * fineStars - 0.35) * extinction * restTint(11.5);
  vec3 nearLight = 0.20 * (0.65 * thinDisk + thickDisk) * fineStars * nearVeil * restTint(6.4);

  // Regiones H II ionizadas (emision Balmer H-alfa/H-beta + [O III]) y nebulosas de reflexion OB
  float h2Knots = corePlane * smoothstep(0.36, 0.92, skyFbm(d * 15.0 + vec3(4.1, 0.8, 2.9), 6, 0.56));
  float o3Mix = smoothstep(-0.3, 0.6, skyFbm(d * 22.0 + vec3(8.3, 2.4, 6.1), 4, 0.55));
  vec3 hAlpha = mix(vec3(1.0, 0.24, 0.38), vec3(0.22, 0.76, 0.90), 0.35 * o3Mix);
  vec3 emissionNeb = 0.28 * h2Knots * mix(nearVeil, extinction, 0.55) * hAlpha;

  float reflField = thinDisk * smoothstep(0.20, 0.88, skyFbm(d * 10.5 + vec3(2.2, 6.4, 1.5), 5, 0.55));
  vec3 reflectionNeb = 0.18 * reflField * (0.5 + 0.5 * sin(lon * 2.0 + dust1)) * nearVeil * restTint(16.5);

  vec3 radiance = GALAXY_RADIANCE * (farLight + armBlue + nearLight + emissionNeb + reflectionNeb);
  float starBoost = clamp((band + 0.45 * bulge) * (0.28 + 0.72 * clear), 0.0, 1.6);
  fragColor = vec4(max(radiance, 0.0), starBoost);
}
`;

// Fondo de cielo en el raymarch:
// 1. Estrellas EWA (Elliptical Weighted Average) proyectadas en el plano tangente celeste 3D sobre
//    una malla octaedrica sin costuras en 2 niveles (IMF realista). Conserva exactamente el flujo
//    bajo lente gravitacional (magnificacion mu = |det J_Omega|^-1), forma arcos tangenciales y
//    anillos de Einstein completos al cruzar causticas sin singularidades, y resuelve imagenes
//    relativistas secundarias (n = 1) junto al anillo de fotones.
// 2. Via Lactea HDR precalculada muestreada en 1 sola lectura anisotropica textureGrad(uSkyCube).
export const background = `
uniform samplerCube uSkyCube;

// Anchura de la PSF del sensor en pixeles (>= 0.60 cumple Nyquist sin parpadeo en rotacion) y escala
// angular efectiva de regularizacion de caustica en radianes (forma arcos finos de Einstein en det J -> 0)
const float STAR_PSF = 0.60;
const float STAR_CAUSTIC = 4.2e-5;

const int STAR_TIER0_CELLS = 32;
const int STAR_TIER1_CELLS = 340;
const float STAR_FLUX_SPLIT = 1.5e-6;
const float STAR_FLUX_MIN = 8.5e-9;
const float STAR_FLUX_MAX = 4.8e-4;
const float GALAXY_BASE_T = 5.8;

// Corrimiento al azul gravitatorio del observador estatico (g = -1/uPt): conserva intacta la ganancia
// bolometrica relativista dot(bb, LUMA) ~ g^4 al ajustar la pureza cromatica para AgX
vec3 skyBlackbody(float T){
  vec3 bb = blackbody(-T / uPt) / dot(blackbody(T), LUMA);
  float luma = dot(bb, LUMA);
  return mix(vec3(luma), bb, 0.78);
}

vec2 octEncode(vec3 d){
  d /= abs(d.x) + abs(d.y) + abs(d.z);
  return d.z >= 0.0 ? d.xy : (1.0 - abs(d.yx)) * vec2(d.x >= 0.0 ? 1.0 : -1.0, d.y >= 0.0 ? 1.0 : -1.0);
}

vec3 octDecode(vec2 e, out float jacobian){
  vec3 v = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  if(v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
  // Jacobiano exacto de angulo solido del octaedro proyectado a S^2, normalizado a <= 1 en el centro de cara
  jacobian = 0.19245 * pow(dot(v, v), -1.5);
  return normalize(v);
}

// Envoltura por reflexion especular en los pliegues del octaedro (N par): continuidad 100 % sin costuras
ivec2 octWrap(ivec2 c, int n){
  if(c.x < 0){ c.x = -1 - c.x; c.y = n - 1 - c.y; }
  else if(c.x >= n){ c.x = 2 * n - 1 - c.x; c.y = n - 1 - c.y; }
  if(c.y < 0){ c.y = -1 - c.y; c.x = n - 1 - c.x; }
  else if(c.y >= n){ c.y = 2 * n - 1 - c.y; c.x = n - 1 - c.x; }
  return clamp(c, ivec2(0), ivec2(n - 1));
}

// Evalua un nivel jerarquico de estrellas mediante convolucion eliptica EWA en el plano tangente (e1, e2)
vec3 starTier(
  vec3 d0,
  vec3 e1,
  vec3 e2,
  vec2 r1,
  vec2 r2,
  vec3 cov,
  float detCov,
  float sMax,
  int nCells,
  uint tier,
  float density
){
  float fade = 1.0 - smoothstep(0.65, 1.30, sMax * float(nCells));
  if(fade <= 0.0) return vec3(0.0);

  float nf = float(nCells);
  ivec2 baseCell = ivec2(floor((octEncode(d0) * 0.5 + 0.5) * nf));
  float invTwoPiSqrtD = fade / (2.0 * PI * sqrt(detCov));
  float psf2 = STAR_PSF * STAR_PSF;
  vec3 sum = vec3(0.0);

  for(int j = -1; j <= 1; j++){
    for(int i = -1; i <= 1; i++){
      ivec2 cw = octWrap(baseCell + ivec2(i, j), nCells);
      vec4 h = hash4(uvec4(uvec2(cw), tier, 7u));
      float octJ;
      vec3 sDir = octDecode((vec2(cw) + h.xy) / nf * 2.0 - 1.0, octJ);
      float keep = min(0.96, density * octJ);
      if(h.z >= keep || dot(sDir, d0) < 0.85) continue;

      // Desplazamiento angular verdadero en radianes sobre el plano tangente ortogonal a d0
      vec2 delta = vec2(dot(sDir, e1), dot(sDir, e2));
      vec2 invS = vec2(cov.z * delta.x - cov.y * delta.y, cov.x * delta.y - cov.y * delta.x) / detCov;
      float d2 = dot(delta, invS);
      if(d2 > 52.0 && tier == 1u) continue;

      float u = max(h.z / keep, 1e-12);
      float F = tier == 0u
        ? min(STAR_FLUX_SPLIT * pow(u, -0.78), STAR_FLUX_MAX)
        : min(STAR_FLUX_MIN * pow(u, -0.74), STAR_FLUX_SPLIT);

      float core = exp(-0.5 * d2);
      float halo = 0.0;
      if(tier == 0u){
        // Coordenada de pantalla regularizada (exacta fuera de caustica y acotada en det J = 0)
        vec2 qPx = psf2 * (r1 * invS.x + r2 * invS.y);
        float rPx = length(qPx);
        if(rPx > 16.0 && d2 > 44.0) continue;
        float bright = smoothstep(2.2e-6, 3.5e-5, F);
        float spike = exp(-abs(qPx.x) * 1.75 - abs(qPx.y) * 0.28) + exp(-abs(qPx.y) * 1.75 - abs(qPx.x) * 0.28);
        halo = 0.055 * exp(-0.95 * sqrt(d2 * psf2)) + bright * 0.048 * spike;
      }

      float k = core + halo;
      if(k < 1e-4) continue;

      // Distribucion espectral HR realista:
      // - Nivel 0 (brillantes): bimodal entre gigantes K/M ambar-rojas (3.2-4.8 kK) y OB/A azules (8.5-27 kK)
      // - Nivel 1 (campo): secuencia principal ponderada por IMF de Kroupa (enanas calidas 2.9-10.5 kK)
      float T = tier == 0u
        ? (h.w < 0.34 ? 3.2 + 1.6 * (h.w / 0.34) : 8.2 * pow(3.3, pow((h.w - 0.34) / 0.66, 0.85)))
        : 2.9 * pow(3.8, pow(h.w, 1.35));
      vec3 tint = skyBlackbody(T);
      float whiteCore = tier == 0u ? 0.55 * smoothstep(4.0e-6, 6.0e-5, F) * core : 0.0;
      sum += mix(tint, vec3(dot(tint, LUMA)), whiteCore) * (F * k);
    }
  }
  return sum * invTwoPiSqrtD;
}

vec3 stars(vec3 d, vec3 ddx, vec3 ddy, float galBoost){
  // Centro exacto del pixel sin el desplazamiento subpixel de Halton: evita vibracion en reposo
  vec3 d0 = normalize(d - ddx * uJitter.x - ddy * uJitter.y);
  vec3 up = abs(d0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 e1 = normalize(cross(up, d0));
  vec3 e2 = cross(d0, e1);

  // Jacobiano celeste J_Omega del pixel en radianes sobre el plano tangente: |det J_Omega| = Omega_sky
  vec2 r1 = vec2(dot(e1, ddx), dot(e1, ddy));
  vec2 r2 = vec2(dot(e2, ddx), dot(e2, ddy));
  float psf2 = STAR_PSF * STAR_PSF;
  float src2 = STAR_CAUSTIC * STAR_CAUSTIC;

  // Matriz de covarianza EWA Sigma_sky = sigma_src^2 I + sigma_psf^2 J_Omega J_Omega^T
  vec3 cov = vec3(
    src2 + psf2 * dot(r1, r1),
    psf2 * dot(r1, r2),
    src2 + psf2 * dot(r2, r2)
  );
  float detCov = max(cov.x * cov.z - cov.y * cov.y, 1e-26);
  float sMax = max(length(r1), length(r2));

  vec3 s0 = starTier(d0, e1, e2, r1, r2, cov, detCov, sMax, STAR_TIER0_CELLS, 0u, 0.52 + 0.58 * galBoost);
  vec3 s1 = starTier(d0, e1, e2, r1, r2, cov, detCov, sMax, STAR_TIER1_CELLS, 1u, 1.05 + 1.15 * galBoost);
  return s0 + s1;
}

vec3 background(vec3 d, vec3 ddx, vec3 ddy, out vec3 starLight){
  // 1 sola lectura anisotropica hardware: filtra sin aliasing la Via Lactea incluso en los subanillos n=1,2
  vec4 sky = textureGrad(uSkyCube, d, ddx, ddy);
  vec3 restGal = mix(vec3(1.0), blackbody(GALAXY_BASE_T) / dot(blackbody(GALAXY_BASE_T), LUMA), 0.78);
  vec3 blueShift = skyBlackbody(GALAXY_BASE_T) / max(restGal, vec3(1e-4));

  starLight = uStars * stars(d, ddx, ddy, sky.a);
  return uStars * sky.rgb * blueShift;
}
`;
