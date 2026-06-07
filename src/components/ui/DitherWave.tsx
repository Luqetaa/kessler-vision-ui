import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  // Bayer Matrix 4x4
  float bayer4x4(vec2 uv) {
    ivec2 p = ivec2(mod(uv, 4.0));
    int index = p.x + p.y * 4;
    if (index == 0) return 0.0;
    if (index == 1) return 8.0 / 16.0;
    if (index == 2) return 2.0 / 16.0;
    if (index == 3) return 10.0 / 16.0;
    if (index == 4) return 12.0 / 16.0;
    if (index == 5) return 4.0 / 16.0;
    if (index == 6) return 14.0 / 16.0;
    if (index == 7) return 6.0 / 16.0;
    if (index == 8) return 3.0 / 16.0;
    if (index == 9) return 11.0 / 16.0;
    if (index == 10) return 1.0 / 16.0;
    if (index == 11) return 9.0 / 16.0;
    if (index == 12) return 15.0 / 16.0;
    if (index == 13) return 7.0 / 16.0;
    if (index == 14) return 13.0 / 16.0;
    return 5.0 / 16.0;
  }

  void main() {
    vec2 uv = vUv;
    
    // Wave formula using sine/cosine relative to UV coordinates
    float wave = 0.38 
      + 0.10 * sin(uv.x * 5.0 + uTime * 1.2) 
      + 0.05 * cos(uv.x * 10.0 - uTime * 1.8)
      + 0.02 * sin(uv.x * 20.0 + uTime * 2.5);

    // Distance from current pixel UV.y to the wave surface
    float dist = uv.y - wave;
    
    // Transition width for the wave boundary (defines the dither/blur area size)
    float transition = 0.32;
    
    // Factor from 0.0 (above wave transition) to 1.0 (below wave transition)
    float factor = clamp(0.5 - dist / transition, 0.0, 1.0);
    
    // Ordered dithering lookup on screen coordinates (scaled by 3.0 to make pattern larger)
    float threshold = bayer4x4(floor(gl_FragCoord.xy / 3.0));
    
    // Define the three colors
    vec3 colorBlack = vec3(0.0, 0.0, 0.0);
    vec3 colorBlue = vec3(0.48627, 0.43137, 0.90588);     // #7c6ee7
    vec3 colorGrey = vec3(0.9176, 0.9176, 0.9176);     // #eaeaea
    
    vec3 finalColor;
    if (factor < 0.5) {
      // Dither between Black (top) and Blue (mid-transition)
      float subFactor = factor / 0.5;
      finalColor = subFactor > threshold ? colorBlue : colorBlack;
    } else {
      // Dither between Blue (mid-transition) and Grey (bottom)
      float subFactor = (factor - 0.5) / 0.5;
      finalColor = subFactor > threshold ? colorGrey : colorBlue;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function DitherWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Compile Shader Helper
    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad Geometry (two triangles spanning the entire screen)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Get Uniforms
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');

    let animationFrameId: number;
    let startTime = performance.now();

    // Resize Canvas and Viewport
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Render loop
    const render = () => {
      const time = (performance.now() - startTime) / 1000.0;
      gl.useProgram(program);

      // Set uniforms
      gl.uniform1f(uTimeLoc, time);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block pointer-events-none"
      style={{ display: 'block' }}
    />
  );
}
