import React from 'react';
import { Typewriter } from './ui/typewriter';
import { motion } from 'framer-motion';
import { DitherWave } from './ui/DitherWave';

const HeroSection = () => {
  const words = ["Kessler_ Visi0n"];

  return (
    <section className="w-full flex justify-center items-start pt-[38vh] px-4 md:px-6 bg-black min-h-screen relative overflow-hidden">
      <div className="relative z-30 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Animated Centered Logo / Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ fontFamily: "'Neue Metana Mono', monospace" }}
          className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide sm:tracking-widest text-white font-bold leading-[1.05] whitespace-nowrap"
        >
          <Typewriter 
            words={words} 
            speed={80} 
            delayBetweenWords={2500} 
            cursor={true} 
            cursorChar="|" 
          />
        </motion.div>
      </div>

      {/* Dithered Wave Transition at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[650px] z-20 pointer-events-none">
        <DitherWave />
      </div>
    </section>
  );
};

export default HeroSection;

