import { skyCubemapFragment } from "../shaders/background";
import { Program } from "./gl";

const SKY_SIZE = 512;
const SKY_MIPS = 10; // log2(512) + 1

// Hornea una sola vez al arrancar las 6 caras HDR (RGBA16F) de la Via Lactea con sus mipmaps
// para muestreo anisotropico O(1) mediante textureGrad en el raymarch
export function createSkyCubemap(gl: WebGL2RenderingContext): WebGLTexture {
  const cube = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube);
  gl.texStorage2D(gl.TEXTURE_CUBE_MAP, SKY_MIPS, gl.RGBA16F, SKY_SIZE, SKY_SIZE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const prog = new Program(gl, skyCubemapFragment);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, SKY_SIZE, SKY_SIZE);
  prog.use();
  for (let face = 0; face < 6; face++) {
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
      cube,
      0,
    );
    prog.f("uFace", face);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fbo);
  prog.dispose();

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cube);
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  return cube;
}
