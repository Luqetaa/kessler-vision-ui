import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const [debrisCount, setDebrisCount] = useState(28402);
  const [ping, setPing] = useState(14);
  const footerRef = useRef<HTMLElement>(null);
  const band1Ref = useRef<HTMLDivElement>(null);
  const band2Ref = useRef<HTMLDivElement>(null);

  // Simula atualizações leves de telemetria
  useEffect(() => {
    const interval = setInterval(() => {
      setDebrisCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setPing(prev => Math.max(8, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Marquee 100% controlado via JS — sem CSS animation
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    let scrollVelocity = 0;
    let rAF: number;
    let prevTimestamp = 0;

    // Posição acumulada (em pixels) de cada banda
    let pos1 = 0;
    let pos2 = 0;

    // Velocidade base em px/s (lento, equivalente a ~180s pra percorrer a largura)
    const baseSpeed = 50;

    const handleScroll = () => {
      const now = Date.now();
      const currentScrollY = window.scrollY;
      const dt = Math.max(1, now - lastTime);
      const dy = Math.abs(currentScrollY - lastScrollY);
      const instVelocity = dy / dt; // px/ms

      // Acumula velocidade com limite
      scrollVelocity = Math.min(10, scrollVelocity + instVelocity * 2);

      lastScrollY = currentScrollY;
      lastTime = now;
    };

    const animate = (timestamp: number) => {
      if (!prevTimestamp) prevTimestamp = timestamp;
      const dt = Math.min(50, timestamp - prevTimestamp); // cap delta pra evitar saltos grandes
      prevTimestamp = timestamp;

      // Desaceleração suave
      scrollVelocity *= 0.94;
      if (scrollVelocity < 0.01) scrollVelocity = 0;

      // Multiplicador de velocidade: 1x (parado) até ~19x (scrollando rápido com momentum)
      const speedMultiplier = 1 + scrollVelocity;
      const currentSpeed = baseSpeed * speedMultiplier;
      const delta = (currentSpeed * dt) / 1000; // px neste frame

      // Band 1 vai pra esquerda
      if (band1Ref.current) {
        const halfWidth = band1Ref.current.scrollWidth / 2;
        pos1 = (pos1 + delta) % halfWidth;
        band1Ref.current.style.transform = `translate3d(${-pos1}px, 0, 0)`;
      }

      // Band 2 vai pra direita
      if (band2Ref.current) {
        const halfWidth = band2Ref.current.scrollWidth / 2;
        pos2 = (pos2 + delta) % halfWidth;
        band2Ref.current.style.transform = `translate3d(${-(halfWidth - pos2)}px, 0, 0)`;
      }

      rAF = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rAF = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rAF);
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="w-full min-h-screen text-white pt-24 pb-0 px-0 overflow-hidden flex flex-col justify-between relative z-20 bg-[#050505]"
    >
      <style>{`
        .marquee-strip {
          display: flex;
          width: max-content;
          will-change: transform;
        }
      `}</style>

      {/* TOP MARQUEE AREA (TILTED & OVERLAPPING) */}
      <div className="relative w-full h-[260px] select-none pointer-events-none z-10 overflow-visible mt-4">
        {/* Band 1 (Back) */}
        <div 
          className="absolute left-[-5%] w-[110%] py-6 bg-[#4e37ff] border-y border-white"
          style={{ 
            transform: 'rotate(-2.5deg)', 
            top: '-15px',
            zIndex: 1 
          }}
        >
          <div className="overflow-hidden flex">
            <div ref={band1Ref} className="marquee-strip whitespace-nowrap flex items-center gap-12 text-[5vw] font-black tracking-tighter uppercase">
              {Array(4).fill(null).map((_, i) => (
                <span key={i} className="flex items-center gap-12">
                  <span>Kessler Vision</span>
                  <span className="border-4 border-white px-5 py-1 rounded-[1rem] inline-block transform rotate-[-1deg] text-[4.5vw] text-white">ORBITAL TRACKING</span>
                  <span>LEO Radar Sweep</span>
                  <span>Kessler Vision® System</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Band 2 (Front) */}
        <div 
          className="absolute left-[-5%] w-[110%] py-6 bg-[#4e37ff] border-y border-white shadow-[0_-5px_12px_rgba(0,0,0,0.15)]"
          style={{ 
            transform: 'none', 
            top: '90px',
            zIndex: 2 
          }}
        >
          <div className="overflow-hidden flex">
            <div ref={band2Ref} className="marquee-strip whitespace-nowrap flex items-center gap-12 text-[5vw] font-black tracking-tighter uppercase text-white/95">
              {Array(4).fill(null).map((_, i) => (
                <span key={i} className="flex items-center gap-12">
                  <span>Space Debris</span>
                  <span className="border-4 border-white px-5 py-1 rounded-[1rem] inline-block transform rotate-[1.5deg] text-[4.5vw] text-white">KESSLER SYNDROME</span>
                  <span>Collision Prediction</span>
                  <span>Satellite Downlink</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT WITH BLUE BACKGROUND */}
      <div className="bg-[#4e37ff] w-full px-6 md:px-12 pt-20 pb-8 flex-grow flex flex-col justify-between -mt-20 relative z-0">
        {/* MIDDLE INFO SECTION (Ground Stations) */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-left my-16 font-sans items-center">
          <div className="col-span-1 md:col-span-6 flex flex-col gap-2">
            {/* Logo or subtle branding */}
            <div className="text-white/40 font-mono text-sm tracking-wider uppercase">Telemetry Downlinks Active</div>
            <div className="text-white/20 font-black text-[3vw] leading-none select-none">KV-01</div>
          </div>
          
          {/* Svalbard Station */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">Svalbard</h4>
            <p className="text-white/70 text-sm leading-relaxed font-light font-sans">
              Platåberget, 9170<br />
              Longyearbyen, Norway
            </p>
            <div className="text-white/90 text-sm font-medium mt-1 font-sans">LEO Debris: {debrisCount.toLocaleString()}</div>
          </div>

          {/* McMurdo Station */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">McMurdo</h4>
            <p className="text-white/70 text-sm leading-relaxed font-light font-sans">
              Ross Island<br />
              Antarctica
            </p>
            <div className="text-white/90 text-sm font-medium mt-1 font-sans">Radar Ping: {ping}ms</div>
          </div>
        </div>

        {/* BOTTOM GRID SECTION */}
        <div className="w-full border-t border-white/60 pt-12 pb-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left font-sans">
            {/* Column 1: Scan */}
            <div className="flex flex-col justify-between min-h-[160px] border-r-0 md:border-r border-white/60 pr-0 md:pr-12">
              <div>
                <h5 className="text-lg font-bold mb-2">Scan.</h5>
                <p className="text-white/70 text-sm leading-relaxed font-light max-w-xs">
                  Initiate active radar sweep. Scan the LEO orbit.
                </p>
              </div>
              <button className="w-fit flex items-center justify-between gap-3 border border-white rounded-full px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300 cursor-pointer mt-6">
                Start orbital scan <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Column 2: Access */}
            <div className="flex flex-col justify-between min-h-[160px] border-r-0 md:border-r border-white/60 px-0 md:px-6">
              <div>
                <h5 className="text-lg font-bold mb-2">Access.</h5>
                <p className="text-white/70 text-sm leading-relaxed font-light max-w-xs">
                  Request direct telemetry feeds and API credentials.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="flex items-center gap-1.5 border border-white/40 hover:border-white rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300 cursor-pointer">
                  API Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1.5 border border-white/40 hover:border-white rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300 cursor-pointer">
                  Radar Docs <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 3: Social */}
            <div className="flex flex-col justify-between min-h-[160px] pl-0 md:pl-12">
              <div>
                <h5 className="text-lg font-bold mb-2">Social.</h5>
                <p className="text-white/70 text-sm leading-relaxed font-light max-w-xs">
                  Follow real-time satellite downlinks.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-white/40 hover:border-white flex items-center justify-center text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300">
                  Gh
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-white/40 hover:border-white flex items-center justify-center text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300">
                  X
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-white/40 hover:border-white flex items-center justify-center text-sm font-semibold text-white hover:bg-white hover:text-[#4e37ff] transition-all duration-300">
                  Li
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-FOOTER */}
        <div className="w-full border-t border-white/60 pt-6 mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 font-sans gap-4">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies Preferences</a>
          </div>
          <div>
            <span>Designed by Kessler Vision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
