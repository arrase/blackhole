import { header, ign } from "./common";

// Niveles de la piramide de bloom (cada uno a mitad de resolucion del anterior)
export const BLOOM_LEVELS = 6;

// Reduccion de 13 muestras (Jimenez, CoD:AW): pesos que suman 1, conserva la energia y no
// produce el parpadeo de un filtro de caja 2x2. En el nivel 0 incorpora tambien la capa de estrellas
// para que astros brillantes y arcos de Einstein reciban dispersion optica real 1/theta^2
export const bloomDownFragment = `${header}
uniform sampler2D uSrc;
uniform sampler2D uStarSrc;
uniform float uStarScale;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

vec3 tap(float x, float y){
  vec2 uv = vUv + uTexel * vec2(x, y);
  vec3 c = texture(uSrc, uv).rgb;
  if(uStarScale > 0.0) c += uStarScale * texture(uStarSrc, uv).rgb;
  return c;
}

void main(){
  vec3 c = tap(0.0, 0.0) * 0.125;
  c += (tap(-2.0, 2.0) + tap(2.0, 2.0) + tap(-2.0, -2.0) + tap(2.0, -2.0)) * 0.03125;
  c += (tap(0.0, 2.0) + tap(-2.0, 0.0) + tap(2.0, 0.0) + tap(0.0, -2.0)) * 0.0625;
  c += (tap(-1.0, 1.0) + tap(1.0, 1.0) + tap(-1.0, -1.0) + tap(1.0, -1.0)) * 0.125;
  fragColor = vec4(c, 1.0);
}
`;

// Filtro tienda 3x3 compartido por la subida de la piramide y el composite
const tent = `
vec3 tent(sampler2D src, vec2 uv, vec2 texel){
  vec3 c = texture(src, uv).rgb * 4.0;
  c += (texture(src, uv + vec2(texel.x, 0.0)).rgb + texture(src, uv - vec2(texel.x, 0.0)).rgb
      + texture(src, uv + vec2(0.0, texel.y)).rgb + texture(src, uv - vec2(0.0, texel.y)).rgb) * 2.0;
  c += texture(src, uv + texel).rgb + texture(src, uv - texel).rgb
     + texture(src, uv + vec2(texel.x, -texel.y)).rgb + texture(src, uv + vec2(-texel.x, texel.y)).rgb;
  return c / 16.0;
}
`;

// Subida: el nivel inferior ampliado se suma (mezcla aditiva) al nivel actual. Cada nivel
// entra con el mismo peso: suma de gaussianas de anchura doble con igual energia ~ PSF 1/theta^2
export const bloomUpFragment = `${header}
uniform sampler2D uSrc;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;
${tent}
void main(){
  fragColor = vec4(tent(uSrc, vUv, uTexel), 1.0);
}
`;

// Revelado final: dispersion optica, exposicion, vineteo natural, AgX, sRGB y dither
export const compositeFragment = `${header}
uniform sampler2D uScene;
uniform sampler2D uStarLayer;
uniform sampler2D uBloom;
uniform vec2 uBloomTexel;
uniform float uStarScale;
uniform float uScatter;
uniform float uExposure;
uniform float uFov;
uniform float uAspect;
uniform float uFrame;
in vec2 vUv;
out vec4 fragColor;
${tent}
${ign}

// AgX minimo (Troy Sobotka; ajuste polinomico de B. Wrensch): desatura las altas luces hacia
// el blanco en vez de saturarlas por canal como ACES
const mat3 AGX_IN = mat3(
  0.842479062253094, 0.0423282422610123, 0.0423756549057051,
  0.0784335999999992, 0.878468636469772, 0.0784336,
  0.0792237451477643, 0.0791661274605434, 0.879142973793104);
const mat3 AGX_OUT = mat3(
  1.19687900512017, -0.0528968517574562, -0.0529716355144438,
  -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
  -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
const float AGX_MIN_EV = -12.47393;
const float AGX_MAX_EV = 4.026069;
// Saturacion y contraste del look tras el revelado: al aplicar AGX_OUT en lineal (donde es la
// inversa exacta de AGX_IN) se elimina la contaminacion cruzada marron en sombras y medios tonos,
// manteniendo la desaturacion suave hacia blanco puro en el nucleo con beaming Doppler
const float AGX_CONTRAST = 1.15;
const float AGX_SATURATION = 1.42;

// Devuelve sRGB lineal en [0, 1]
vec3 agx(vec3 c){
  // Compresion suave de hombro por luminancia antes de AGX_IN: preserva intacta la cromaticidad
  // del cuerpo negro y evita recortar a blanco plano el anillo de fotones y el pico Doppler
  float y = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-10);
  c *= (1.0 + y / 65.0) / (1.0 + y / 15.0);
  c = AGX_IN * c;
  c = clamp(log2(max(c, 1e-10)), AGX_MIN_EV, AGX_MAX_EV);
  c = (c - AGX_MIN_EV) / (AGX_MAX_EV - AGX_MIN_EV);
  vec3 c2 = c * c;
  vec3 c4 = c2 * c2;
  c = 15.5 * c4 * c2 - 40.14 * c4 * c + 31.96 * c4 - 6.868 * c2 * c + 0.4298 * c2 + 0.1191 * c - 0.00232;
  c = pow(max(c, 0.0), vec3(AGX_CONTRAST * 2.2));
  c = clamp(AGX_OUT * c, 0.0, 1.0);
  // Compensacion psicovisual de Bezold-Brucke en tonos calidos (R > G): evita que el amarillo
  // oscuro se perciba como marron-oliva en el lado recesivo, virandolo a ambar/naranja/rubi ardiente
  // sin alterar las altas luces blancas (c -> 1) ni las estrellas azules (B >= R)
  float warm = clamp((c.r - c.b) / max(c.r, 1e-4), 0.0, 1.0);
  c = mix(c, pow(c, vec3(1.0, 1.16, 1.32)), 0.75 * warm);
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return max(l + AGX_SATURATION * (c - l), 0.0);
}

vec3 srgbEncode(vec3 c){
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main(){
  vec3 scene = texture(uScene, vUv).rgb;
  vec3 bloom = tent(uBloom, vUv, uBloomTexel) / ${BLOOM_LEVELS.toFixed(1)};
  vec3 stars = uStarScale * texture(uStarLayer, vUv).rgb;
  // Conservacion exacta de energia: el porcentaje dispersado (uScatter) de escena y estrellas viene en bloom
  vec3 c = mix(scene + stars, bloom, uScatter);

  // Vineteo natural cos^4 del angulo real de cada rayo (mismo mapeo que el raymarch), en lineal
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float cos2 = uFov * uFov / (uFov * uFov + dot(p, p));
  c *= uExposure * cos2 * cos2;

  c = srgbEncode(clamp(agx(c), 0.0, 1.0));
  // Dither de +-0.5 LSB: rompe el bandeado de 8 bits en los degradados oscuros del cielo
  c += (ign(gl_FragCoord.xy + 5.588238 * uFrame) - 0.5) / 255.0;
  fragColor = vec4(c, 1.0);
}
`;
