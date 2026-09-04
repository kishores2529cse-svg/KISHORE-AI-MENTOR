// @ts-nocheck
import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GlowCursor.css';

const MAX_POINTS = 64;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
#define MAX_POINTS 64

uniform vec2  uResolution;
uniform vec2  uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3  uColor;
uniform vec3  uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 pixel = vUv * uResolution;
  float denom = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float idx = float(i);
    if (idx >= uPointCount - 1.0) break;

    vec2 a = uPoints[i];
    vec2 b = uPoints[i + 1];
    vec2 ap = pixel - a;
    vec2 ab = b - a;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
    float progress = clamp((idx + t) / denom, 0.0, 1.0);

    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float w = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    float dist = length(ap - ab * t);

    float falloff = max(w * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (dist * dist + falloff * falloff));
    float core = exp(-pow(dist / max(w, 0.5), 2.0) * 2.5);

    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * min(abs(uPulseSpeed), 1.0);
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse;

    vec3 sc = mix(uColor, uSecondaryColor, progress);
    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life);
    colorSum += sc * intensity;
    colorWeight += intensity;
  }

  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.001) discard;

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.45, 1.0, strongestCore) * uHotspot * 0.35);
  float lum = clamp(strongest * uBrightness, 0.0, 1.0);

  float grain = (hash(floor(pixel) + vec2(uTime * 17.0, uTime * 31.0)) * 2.0 - 1.0);
  lum *= 1.0 + grain * uNoiseStrength * 0.4;

  gl_FragColor = vec4(color * lum, alpha);
}
`;

const hexToRgb = (hex) => {
  let v = (hex || '').replace('#', '').trim();
  if (v.length === 3) v = v.split('').map(c => c + c).join('');
  const n = parseInt(v || '000000', 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const GlowCursor = ({
  color = '#00FF88',
  secondaryColor = '#22D1EE',
  trailLength = 40,
  trailWidth = 8,
  trailTaper = 0.8,
  followSpeed = 0.16,
  glowIntensity = 1.9,
  glowSpread = 1.2,
  hotspot = 0.65,
  brightness = 1.25,
  opacity = 1,
  pulseSpeed = 1.1,
  noiseStrength = 0.035,
  idleFade = true,
  idleTimeout = 700,
  fadeDuration = 900,
  maxDevicePixelRatio = 1.5,
  enabled = true,
}) => {
  const containerRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = {
    color, secondaryColor, trailLength, trailWidth, trailTaper,
    followSpeed, glowIntensity, glowSpread, hotspot, brightness,
    opacity, pulseSpeed, noiseStrength, idleFade, idleTimeout,
    fadeDuration, maxDevicePixelRatio, enabled
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ---- dynamically create canvas ---- */
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const cfg = propsRef.current;
    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, cfg.maxDevicePixelRatio),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const pointData = new Float32Array(MAX_POINTS * 2);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution:     { value: [1, 1] },
        uPoints:         { value: pointData },
        uPointCount:     { value: cfg.trailLength },
        uColor:          { value: hexToRgb(cfg.color) },
        uSecondaryColor: { value: hexToRgb(cfg.secondaryColor) },
        uTrailWidth:     { value: cfg.trailWidth },
        uTaper:          { value: cfg.trailTaper },
        uGlowIntensity:  { value: cfg.glowIntensity },
        uGlowSpread:     { value: cfg.glowSpread },
        uHotspot:        { value: cfg.hotspot },
        uBrightness:     { value: cfg.brightness },
        uOpacity:        { value: cfg.opacity },
        uPulseSpeed:     { value: cfg.pulseSpeed },
        uNoiseStrength:  { value: cfg.noiseStrength },
        uTime:           { value: 0 },
        uFade:           { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let w = 1, h = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let lastInputTime = performance.now();
    let lastFrame = performance.now();
    let raf = 0;
    let destroyed = false;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };

    const initTrail = (x, y) => {
      target.x = x; target.y = y;
      head.x = x; head.y = y;
      for (const p of points) { p.x = x; p.y = y; }
      initialized = true;
      fade = 1;
    };

    const onPointerMove = (e) => {
      const x = e.clientX;
      const y = h - e.clientY;          // flip Y for GL coords
      if (!initialized) initTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    const render = (now) => {
      if (destroyed) return;
      const c = propsRef.current;
      const dt = Math.min((now - lastFrame) / 16.667, 3);
      lastFrame = now;

      if (initialized) {
        const headEase = 1 - Math.pow(1 - clamp(c.followSpeed, 0.01, 0.99), dt);
        const chainBase = clamp(0.28 + c.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, dt);

        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }
        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2]     = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idle = now - lastInputTime;
      const shouldFade = c.idleFade && (!pointerInside || idle > c.idleTimeout);
      const fadeStep = (16.667 * dt) / Math.max(c.fadeDuration, 16);
      const fadeTarget = initialized && c.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      const u = program.uniforms;
      u.uPointCount.value     = clamp(Math.round(c.trailLength), 2, MAX_POINTS);
      u.uColor.value          = hexToRgb(c.color);
      u.uSecondaryColor.value = hexToRgb(c.secondaryColor);
      u.uTrailWidth.value     = Math.max(c.trailWidth, 0.1);
      u.uTaper.value          = clamp(c.trailTaper, 0, 1);
      u.uGlowIntensity.value  = Math.max(c.glowIntensity, 0);
      u.uGlowSpread.value     = Math.max(c.glowSpread, 0);
      u.uHotspot.value        = clamp(c.hotspot, 0, 1);
      u.uBrightness.value     = Math.max(c.brightness, 0);
      u.uOpacity.value        = clamp(c.opacity, 0, 1);
      u.uPulseSpeed.value     = c.pulseSpeed;
      u.uNoiseStrength.value  = clamp(c.noiseStrength, 0, 1);
      u.uTime.value           = now * 0.001;
      u.uFade.value           = fade;

      renderer.render({ scene: mesh });
      if (!destroyed) raf = requestAnimationFrame(render);
    };

    /* ---- listeners ---- */
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerleave', onPointerLeave);
    resize();
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      mesh.geometry.remove();
      program.remove();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className="glow-cursor-overlay" />;
};

export default GlowCursor;
