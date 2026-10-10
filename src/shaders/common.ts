// Cabecera comun de todos los programas: GLSL ES 3.00 (solo WebGL2). Los enteros del fragmento son
// mediump por defecto, y en algunas GPU de 16 bits: el hash entero necesita 32
export const header = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler3D;
`;

// Triangulo que cubre la pantalla generado con gl_VertexID: sin buffers ni atributos
export const fullscreenVertex = `${header}
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

// Ruido de gradiente entrelazado (Jimenez 2014): bajo ruido azul por pixel, barato y sin texturas
export const ign = `
float ign(vec2 pixel){
  return fract(52.9829189 * fract(dot(floor(pixel), vec2(0.06711056, 0.00583715))));
}
`;

// Hash entero pcg4d (Jarzynski y Olano 2020) a [0, 1)^4: sin la periodicidad visible de los hashes
// con fract/sin. 24 bits por componente, exactos en float
export const hash = `
vec4 hash4(uvec4 v){
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
  v ^= v >> 16u;
  v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
  return vec4(v >> 8u) / 16777216.0;
}
`;

// Uniformes y constantes de la escena compartidos por los trozos del raymarch
export const sceneUniforms = `
uniform vec2 uRes;
uniform vec2 uJitter;
uniform float uHistoryWeight;
uniform float uFrame;
// Camara: observador estatico. uCamFwd/Right/Up son las patas espaciales de su tetrada ortonormal
// bajadas con la metrica (componentes covariantes espaciales) y uCamU = -U_i: el rayo del pixel de
// direccion unitaria n en la tetrada tiene p = uCamU + n_i. uPt = U_t = p_t (ver kerr.ts)
uniform vec3 uCamPos;
uniform vec3 uCamFwd;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamU;
uniform float uPt;
uniform float uFov;
uniform float uStars;
uniform float uSpin;
uniform float uRPlus;
uniform float uRIsco;
uniform float uAccretionDisk;

const float PI = 3.14159265;
const int MAX_STEPS = 800;
const float DISK_OUT = 13.0;
`;
