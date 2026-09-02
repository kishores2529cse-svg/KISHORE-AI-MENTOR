import React, { useEffect, useRef } from 'react';
import './Galaxy.css';

export interface GalaxyProps {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  size: number;
  baseAlpha: number;
  twinkleOffset: number;
  twinkleSpeed: number;
  color: string;
  repelX: number;
  repelY: number;
}

export const Galaxy: React.FC<GalaxyProps> = ({
  starSpeed = 0.1,
  density = 2.1,
  hueShift = 130,
  speed = 0.2,
  glowIntensity = 0.35,
  saturation = 0.1,
  mouseRepulsion = true,
  repulsionStrength = 0.5,
  twinkleIntensity = 0.35,
  rotationSpeed = 0.1,
  transparent = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    // Calculate star count based on density
    const count = Math.floor((width * height * density) / 4500);
    const stars: Star[] = [];

    const getStarColor = (hueBase: number, sat: number) => {
      const hue = (hueBase + (Math.random() - 0.5) * 60 + 360) % 360;
      const s = Math.min(100, Math.max(0, sat * 100));
      return `hsla(${hue}, ${s}%, 85%, `;
    };

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.6) * Math.max(width, height) * 0.75;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.random() * 800 + 50;

      stars.push({
        x,
        y,
        z,
        ox: x,
        oy: y,
        size: Math.random() * 1.8 + 0.5,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2 + 1,
        color: getStarColor(hueShift, saturation),
        repelX: 0,
        repelY: 0
      });
    }

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left - width / 2,
        y: e.clientY - rect.top - height / 2,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.016 * speed;

      ctx.clearRect(0, 0, width, height);

      if (!transparent) {
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Render Central Galactic Ambient Glow
      if (glowIntensity > 0) {
        const glowRadius = Math.min(width, height) * 0.45;
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          glowRadius
        );
        const glowHue = (hueShift + 360) % 360;
        gradient.addColorStop(0, `hsla(${glowHue}, 70%, 50%, ${glowIntensity * 0.18})`);
        gradient.addColorStop(0.4, `hsla(${(glowHue + 40) % 360}, 60%, 40%, ${glowIntensity * 0.08})`);
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render Swirling Stars & Rays
      const rot = time * rotationSpeed;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move star forward
        star.z -= starSpeed * 2.5;
        if (star.z <= 0) {
          star.z = 800;
        }

        // Base 2D rotation around center
        const rx = star.ox * cosR - star.oy * sinR;
        const ry = star.ox * sinR + star.oy * cosR;

        // Mouse repulsion
        if (mouseRepulsion && mouseRef.current.active) {
          const dx = rx + star.repelX - mouseRef.current.x;
          const dy = ry + star.repelY - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 220;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * repulsionStrength * 12;
            star.repelX += (dx / dist) * force;
            star.repelY += (dy / dist) * force;
          }
        }

        // Dampen repulsion smoothly back to orbit
        star.repelX *= 0.92;
        star.repelY *= 0.92;

        const finalX = centerX + rx + star.repelX;
        const finalY = centerY + ry + star.repelY;

        // Depth perspective projection
        const depthFactor = 800 / (star.z + 200);
        const radius = Math.max(0.4, star.size * depthFactor * 0.7);

        // Twinkle calculation
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * twinkleIntensity;
        const alpha = Math.max(0, Math.min(1, star.baseAlpha + twinkle));

        // Draw star with soft ray glow
        ctx.beginPath();
        ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${alpha})`;
        ctx.fill();

        // Extra twinkle flare on bright foreground stars
        if (alpha > 0.75 && radius > 1.2) {
          ctx.beginPath();
          ctx.arc(finalX, finalY, radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color}${alpha * 0.25})`;
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [starSpeed, density, hueShift, speed, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity, rotationSpeed, transparent]);

  return (
    <div ref={containerRef} className={`galaxy-container ${className}`}>
      <canvas ref={canvasRef} className="galaxy-canvas" />
    </div>
  );
};

export default Galaxy;
