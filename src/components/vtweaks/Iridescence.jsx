// React Bits Iridescence, adapted from the source supplied by the user.
// Original shader; capped resolution and frame rate, hidden-tab pause, static reduced motion.
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import { useMotion } from './motion';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;
void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Iridescence({ color = [.88, .87, .94], speed = .12, amplitude = .03, mouseReact = false }) {
  const ref = useRef(null);
  const { enabled } = useMotion();
  const [red, green, blue] = color;
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (!enabled) return; // The local CSS atmosphere is the reduced-motion fallback.
    let renderer, geometry, program;
    try {
      renderer = new Renderer({ dpr: 1, alpha: false, antialias: false, powerPreference: 'low-power' });
      const gl = renderer.gl;
      if (!gl) return;
      geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex: vertexShader, fragment: fragmentShader,
        uniforms: {
          uTime: { value: 12 }, uColor: { value: new Color(red, green, blue) },
          uResolution: { value: new Color(1, 1, 1) },
          uMouse: { value: new Float32Array([.5, .5]) },
          uAmplitude: { value: amplitude }, uSpeed: { value: speed },
        },
      });
    } catch {
      geometry?.remove(); program?.remove();
      renderer?.gl?.getExtension('WEBGL_lose_context')?.loseContext();
      return; // The CSS background remains available when WebGL is unavailable.
    }

    const gl = renderer.gl, mesh = new Mesh(gl, { geometry, program });
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, last = 0, elapsed = 12, lost = false, visible = false;
    let focused = document.hasFocus();
    const targetMouse = [.5, .5];
    const render = () => {
      if (lost || document.hidden || !visible) return;
      program.uniforms.uTime.value = elapsed;
      renderer.render({ scene: mesh });
    };
    const resize = () => {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
      const scale = Math.min(1, 1024 / width, 768 / height);
      renderer.setSize(Math.round(width * scale), Math.round(height * scale));
      gl.canvas.style.width = '100%'; gl.canvas.style.height = '100%';
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
      render();
    };
    const update = now => {
      frame = 0;
      if (document.hidden || !enabled || lost || !visible || !focused) return;
      if (!last) last = now;
      const delta = now - last;
      if (delta >= 1000 / 24) {
        elapsed += Math.min(delta / 1000, .1); last = now;
        for (let i = 0; i < 2; i++) program.uniforms.uMouse.value[i] += (targetMouse[i] - program.uniforms.uMouse.value[i]) * .08;
        render();
      }
      frame = requestAnimationFrame(update);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (document.hidden || lost || !visible) return;
      render();
      if (enabled && focused) frame = requestAnimationFrame(update);
    };
    const move = event => {
      if (!mouseReact || !pointer.matches || !enabled) return;
      const rect = container.getBoundingClientRect();
      targetMouse[0] = (event.clientX - rect.left) / rect.width;
      targetMouse[1] = 1 - (event.clientY - rect.top) / rect.height;
    };
    const contextLost = () => { lost = true; cancelAnimationFrame(frame); frame = 0; gl.canvas.style.opacity = '0'; };
    container.appendChild(gl.canvas);
    const observer = new ResizeObserver(resize); observer.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    });
    intersection.observe(container);
    const focus = () => { focused = true; sync(); };
    const blur = () => { focused = false; sync(); };
    resize(); sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    if (mouseReact) document.addEventListener('pointermove', move, { passive: true });
    gl.canvas.addEventListener('webglcontextlost', contextLost);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', focus);
      window.removeEventListener('blur', blur);
      if (mouseReact) document.removeEventListener('pointermove', move);
      gl.canvas.removeEventListener('webglcontextlost', contextLost);
      geometry.remove(); program.remove(); gl.canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [red, green, blue, speed, amplitude, mouseReact, enabled]);
  return <div ref={ref} className="iridescence-container" aria-hidden="true"/>;
}

