import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const [debrisCount, setDebrisCount] = useState(28402);
  const [ping, setPing] = useState(14);
  const footerRef = useRef<HTMLElement>(null);

  // Simula atualizações leves de telemetria
  useEffect(() => {
    const interval = setInterval(() => {
      setDebrisCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setPing(prev => Math.max(8, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="w-full min-h-screen bg-[#4e37ff] text-white pt-24 pb-8 px-6 md:px-12 overflow-hidden flex flex-col justify-between sticky bottom-0 z-0"
    >
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-left 30s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 30s linear infinite;
        }
      `}</style>

      {/* TOP MARQUEE BANDS (TILTED) */}
      <div 
        className="w-[120%] -ml-[10%] overflow-hidden py-8 border-y-2 border-white/30 bg-[#4e37ff] flex flex-col gap-6"
        style={{ transform: 'rotate(-2.5deg) scale(1.02) translateY(-20px)' }}
      >
        {/* Row 1: Scrolling Left */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-left whitespace-nowrap flex items-center gap-12 text-[5vw] font-black tracking-tighter uppercase">
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

        {/* Row 2: Scrolling Right */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-right whitespace-nowrap flex items-center gap-12 text-[5vw] font-black tracking-tighter uppercase text-white/95">
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
      <div className="w-full border-t border-white/25 pt-12 pb-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left font-sans">
          {/* Column 1: Scan */}
          <div className="flex flex-col justify-between min-h-[160px] border-r-0 md:border-r border-white/15 pr-0 md:pr-12">
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
          <div className="flex flex-col justify-between min-h-[160px] border-r-0 md:border-r border-white/15 px-0 md:px-6">
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
      <div className="w-full border-t border-white/20 pt-6 mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 font-sans gap-4">
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Cookies Preferences</a>
        </div>
        <div>
          <span>Designed by Kessler Vision</span>
        </div>
      </div>
    </footer>
  );
}
