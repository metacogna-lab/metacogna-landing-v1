import React, { useEffect, useRef } from 'react';

const LorenzAttractor: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    // Lorenz Parameters
    let x = 0.1;
    let y = 0;
    let z = 0;
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.01;

    let points: {x: number, y: number, z: number}[] = [];
    const maxPoints = 2000;

    const scale = 8;
    
    // Animation loop
    let animationFrameId: number;

    const render = () => {
      // Background clear with fade effect for trail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
      ctx.fillRect(0, 0, width, height);

      // Calculate next step
      const dx = (sigma * (y - x)) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;

      x += dx;
      y += dy;
      z += dz;

      points.push({ x, y, z });
      if (points.length > maxPoints) {
        points.shift();
      }

      ctx.beginPath();
      ctx.strokeStyle = '#10b981'; // Accent Green
      ctx.lineWidth = 1.5;

      const cx = width / 2;
      const cy = height / 2 + 20; // Shift down slightly

      if (points.length > 0) {
        ctx.moveTo(cx + points[0].x * scale, cy - points[0].y * scale);
        for (let i = 1; i < points.length; i++) {
            // Simple projection
            ctx.lineTo(cx + points[i].x * scale, cy - points[i].y * scale);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        if (canvas) {
            width = canvas.width = canvas.clientWidth;
            height = canvas.height = canvas.clientHeight;
        }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};

export default LorenzAttractor;