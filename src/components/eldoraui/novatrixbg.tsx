import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

// Vertex Shader
const vert = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

// Fragment Shader - Modified for dark + Shopify green gradient
const frag = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;

varying vec2 vUv;

void main() {
    float mr = min(uResolution.x, uResolution.y);
    vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
    
    // Shopify green: rgb(0, 128, 96) = #008060
    vec3 shopifyGreen = vec3(0.0, 0.5, 0.376);
    vec3 darkColor = vec3(0.05, 0.05, 0.1);
    
    float d = -uTime * 1.2;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += uTime * 1.0;
    
    // Base pattern
    vec3 pattern = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    pattern = cos(pattern * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    
    // Gradient factor based on position
    float gradientFactor = smoothstep(0.0, 1.0, (uv.x + 1.0) * 0.5);
    
    // Mix between dark color and Shopify green
    vec3 mixedColor = mix(darkColor, shopifyGreen, gradientFactor);
    
    // Apply color tinting to the pattern
    vec3 finalColor = pattern * mixedColor * 0.8 + mixedColor * 0.2;
    
    // Darken overall
    finalColor *= 0.7;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface NovatrixProps {}

export const Novatrix: React.FC<NovatrixProps> = () => {
  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctnDom.current) {
      return;
    }

    const ctn = ctnDom.current;
    const renderer = new Renderer();
    const gl = renderer.gl;

    // Set clear color to dark
    gl.clearColor(0.05, 0.05, 0.1, 1);

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
    }
    window.addEventListener("resize", resize, false);
    resize();

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0.0, 0.5, 0.376) }, // Shopify green in RGB
        uResolution: {
          value: [
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ],
        },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animateId: number;

    animateId = requestAnimationFrame(update);

    function update(t: number) {
      animateId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }

    ctn.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={ctnDom} className="gradient-canvas h-full w-full"></div>;
};

const Background = () => {
  return (
    <div className="h-screen w-screen">
      <Novatrix />
    </div>
  );
};

export default Background;
