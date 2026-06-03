import React, { useState, Suspense, lazy } from 'react';
import { Typewriter } from './ui/typewriter';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GridAnimation } from './ui/mouse-following-line';

const Dithering = lazy(() => 
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
)

const HeroSection = () => {
  const words = ["Kessler_ Visi0n"];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 w-full flex justify-center items-center px-4 md:px-6 bg-[#050505] min-h-screen relative overflow-hidden">
      
      {/* Background Interactive Grid Animation */}
      <div className="absolute inset-0 z-0">
        <GridAnimation className="w-full h-full opacity-50" />
      </div>

      <div 
        className="relative z-10 mx-auto w-[1100px] h-[650px] shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[48px] border border-white/20 bg-[#0a0a0a] shadow-sm w-full h-full flex flex-col items-center justify-center duration-500">
             <Suspense fallback={<div className="absolute inset-0 bg-white/5" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
              <Dithering
                colorBack="#000000" // Black
                colorFront="#FFFFFF"  // White
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            
            <div style={{ marginBottom: '3.5rem' }} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 !px-6 !py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Monitoramento Orbital Ativo
            </div>

            {/* Animated Centered Logo / Title */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              style={{ fontFamily: "'Neue Metana Mono', monospace", marginBottom: '1.5rem' }}
              className="text-4xl tracking-widest text-white md:text-6xl lg:text-7xl font-bold leading-[1.05]"
            >
              <Typewriter 
                words={words} 
                speed={80} 
                delayBetweenWords={2500} 
                cursor={true} 
                cursorChar="|" 
              />
            </motion.div>
            
            {/* Description */}
            <p style={{ marginBottom: '4rem' }} className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed">
              Acompanhamento em tempo real da infraestrutura orbital da Terra.
              Navegue pela zona de detritos e entenda o impacto da Síndrome de Kessler de forma precisa e analítica.
            </p>

            {/* Button */}
            <button className="group relative inline-flex !h-16 items-center justify-center gap-3 overflow-hidden rounded-full bg-white !px-12 text-lg font-bold text-black transition-all duration-300 hover:bg-white/90 hover:scale-105 active:scale-95 hover:ring-4 hover:ring-white/20">
              <span className="relative z-10 font-bold">Iniciar Varredura</span>
              <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
