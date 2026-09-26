export const vertexShader = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const fragmentShader = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 uCamFwd;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform float uFov;
uniform float uIntensity;
uniform float uDiskSpeed;
uniform float uSteps;
uniform float uStars;
uniform float uGlow;

const int MAX_STEPS = 600;
const float DISK_IN = 2.6;
const float DISK_OUT = 13.0;

float hash(vec3 p){
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
vec3 hash3(vec3 p){
  return vec3(hash(p), hash(p + 17.13), hash(p + 41.7));
}
float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return v;
}

vec3 starLayer(vec3 d, float scale, float threshold){
  vec3 p = d * scale;
  vec3 id = floor(p);
  vec3 f = fract(p) - 0.5;
  float h = hash(id);
  if(h < threshold) return vec3(0.0);
  vec3 off = (hash3(id) - 0.5) * 0.6;
  float dist = length(f - off);
  float b = pow(max(0.0, 1.0 - dist * 6.0), 6.0);
  float t = hash(id + 3.3);
  vec3 tint = mix(vec3(1.0, 0.75, 0.55), vec3(0.65, 0.8, 1.0), t);
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + t * 3.0) + h * 40.0);
  return tint * b * (h - threshold) / (1.0 - threshold) * 3.0 * tw;
}

vec3 background(vec3 d){
  vec3 c = vec3(0.0);
  c += starLayer(d, 120.0, 0.92);
  c += starLayer(d, 260.0, 0.95) * 0.7;
  c += starLayer(d, 500.0, 0.96) * 0.5;
  // Banda galactica tenue
  vec3 gAxis = normalize(vec3(0.3, 1.0, 0.45));
  float band = exp(-pow(dot(d, gAxis) * 3.2, 2.0));
  float neb = fbm(d * 4.0) * fbm(d * 9.0 + 3.0);
  c += band * neb * vec3(0.35, 0.3, 0.45) * 0.9;
  c += band * starLayer(d, 700.0, 0.9) * 0.6;
  return c * uStars;
}

vec4 diskSample(vec3 p, vec3 vel){
  float r = length(p.xz);
  if(r < DISK_IN || r > DISK_OUT) return vec4(0.0);
  float phi = atan(p.z, p.x);
  float omega = 1.0 / pow(r, 1.5);
  float a = phi + uTime * omega * uDiskSpeed;

  // Estructura turbulenta estirada en direccion angular (anillos / filamentos)
  vec3 q = vec3(r * 3.2, cos(a) * 2.2, sin(a) * 2.2);
  float n = fbm(q);
  float n2 = fbm(vec3(r * 9.0, cos(a) * 6.0, sin(a) * 6.0));
  float streaks = 0.45 + 0.9 * n * (0.6 + 0.8 * n2);

  // Perfil de temperatura (Shakura-Sunyaev simplificado)
  float x = DISK_IN / r;
  float temp = pow(x, 0.75) * pow(max(1.0 - sqrt(x) * 0.93, 0.0), 0.25);
  float bright = temp * 3.2;

  float edgeIn = smoothstep(DISK_IN, DISK_IN + 0.5, r);
  float edgeOut = 1.0 - smoothstep(DISK_OUT * 0.55, DISK_OUT, r);
  bright *= edgeIn * edgeOut * streaks;

  // Doppler relativista + corrimiento gravitacional
  vec3 vDir = normalize(vec3(-p.z, 0.0, p.x));
  float beta = sqrt(0.5 / max(r - 1.0, 0.5));
  beta = min(beta, 0.7);
  float gamma = 1.0 / sqrt(1.0 - beta * beta);
  float cosT = dot(vDir, -normalize(vel));
  float D = 1.0 / (gamma * (1.0 - beta * cosT));
  float g = sqrt(max(1.0 - 1.0 / r, 0.0));
  float shift = D * g;
  float boost = pow(D, 3.0) * g;

  vec3 hot = vec3(1.0, 0.93, 0.82);
  vec3 warm = vec3(1.0, 0.55, 0.2);
  vec3 cold = vec3(0.7, 0.18, 0.04);
  float tc = clamp(temp * 1.6 * shift, 0.0, 1.5);
  vec3 col = tc < 0.5 ? mix(cold, warm, tc * 2.0) : mix(warm, hot, clamp((tc - 0.5) * 1.5, 0.0, 1.0));
  if(shift > 1.0) col = mix(col, vec3(0.8, 0.88, 1.0), clamp((shift - 1.0) * 0.8, 0.0, 0.6));

  vec3 emit = col * bright * boost * uIntensity * 2.2;
  float alpha = clamp(bright * 1.4, 0.0, 1.0) * 0.95;
  return vec4(emit, alpha);
}

vec3 aces(vec3 x){
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 dir = normalize(uCamFwd * uFov + uCamRight * uv.x + uCamUp * uv.y);

  vec3 pos = uCamPos;
  vec3 vel = dir;
  vec3 h = cross(pos, vel);
  float h2 = dot(h, h);

  vec3 col = vec3(0.0);
  float tr = 1.0;
  bool captured = false;
  float glow = 0.0;

  for(int i = 0; i < MAX_STEPS; i++){
    if(float(i) >= uSteps) break;
    float r = length(pos);
    if(r < 1.0){ captured = true; break; }
    if(r > 60.0 && dot(pos, vel) > 0.0) break;

    float dt = clamp(0.06 * r * r / (r + 2.0), 0.015, 1.5);
    // Paso mas fino cerca del plano del disco
    if(abs(pos.y) < 1.0 && r < DISK_OUT + 2.0) dt = min(dt, 0.12 + abs(pos.y) * 0.3);

    vec3 prev = pos;
    vec3 acc = -1.5 * h2 * pos / pow(r, 5.0);
    vel += acc * dt;
    pos += vel * dt;

    // Resplandor alrededor del anillo de fotones
    float pr = abs(length(pos) - 1.5);
    glow += exp(-pr * 6.0) * dt * 0.02;

    if(prev.y * pos.y < 0.0){
      float t = prev.y / (prev.y - pos.y);
      vec3 p = mix(prev, pos, t);
      vec4 d = diskSample(p, vel);
      col += tr * d.rgb * d.a;
      tr *= 1.0 - d.a;
      if(tr < 0.01) break;
    }
  }

  if(!captured) col += tr * background(normalize(vel));
  col += glow * vec3(1.0, 0.6, 0.3) * uGlow * uIntensity;

  col = aces(col * 1.1);
  col = pow(col, vec3(1.0 / 2.2));
  // Vineta
  vec2 q = gl_FragCoord.xy / uRes;
  col *= 0.55 + 0.45 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.2);
  gl_FragColor = vec4(col, 1.0);
}
`;
