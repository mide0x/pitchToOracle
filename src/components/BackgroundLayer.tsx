import { useEffect, useRef } from "react";

export const BackgroundLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const starCount = 200;

      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5;
        const opacity = Math.random() * 0.8 + 0.2;
        // Warm white/gold tones
        const hue = 45; // Gold
        const sat = Math.random() * 20 + 80;
        const light = 90;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${opacity})`;
        ctx.fill();
      }
    };

    // Initial draw
    render();

    const handleResize = () => {
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020204]">
      {/* Deep Base Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_#1a0b2e_0%,_#000000_100%)] opacity-80" />

      {/* Top "God Ray" */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(ellipse_at_center,_rgba(88,70,140,0.4)_0%,_transparent_70%)] blur-3xl mix-blend-screen pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_rgba(150,130,200,0.15)_0%,_transparent_70%)] blur-2xl mix-blend-overlay pointer-events-none" />

      {/* Center Glow */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(42,31,78,0.4)_0%,_transparent_60%)] mix-blend-screen pointer-events-none" />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Stars Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80 mix-blend-screen"
      />
    </div>
  );
};
