import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection.tsx';
import DebrisSection from './components/DebrisSection';
import TerminalCursor from './components/TerminalCursor';
import TerminalSection from './components/TerminalSection';
import PythonAgentSection from './components/PythonAgentSection.tsx';

function App() {
  // Smooth scroll com momentum — substitui scroll nativo por interpolação suave
  useEffect(() => {
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let rAF;

    const syncScroll = () => {
      // Tolerância maior para evitar matar o momentum devido a imprecisões de pixel do navegador
      if (Math.abs(window.scrollY - currentY) > 20) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    const handleWheel = (e) => {
      // Verifica se o target está dentro de um container com scroll próprio
      let el = e.target;
      while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return; // não interfere em containers scrolláveis internos
        }
        el = el.parentElement;
      }

      e.preventDefault();

      let delta = e.deltaY;
      // Normaliza pra pixels (ajuste para diferentes SOs/mouses)
      if (e.deltaMode === 1) delta *= 40;
      if (e.deltaMode === 2) delta *= window.innerHeight;

      // Multiplicador de velocidade para scroll responsivo sem clamp extremo
      delta *= 1.8;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));
    };

    const animate = () => {
      syncScroll();

      // Lerp suave — interpola entre posição atual e alvo
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        // Easing ainda mais fluido e longo (floaty momentum)
        currentY += diff * 0.04;
        window.scrollTo(0, currentY);
      } else {
        currentY = targetY;
        window.scrollTo(0, currentY);
      }

      rAF = requestAnimationFrame(animate);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    rAF = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(rAF);
    };
  }, []);

  return (
    <main>
      <TerminalCursor />
      <Navbar />
      
      <div id="home" className="relative z-10 bg-[#050505]">
        <HeroSection />
      </div>
      
      <div id="debris" className="relative z-10 bg-[#050505]">
        <DebrisSection />
      </div>
      
      <div id="terminal" className="relative z-10 bg-[#050505]">
        <TerminalSection />
      </div>
      
      <div id="python-agent" className="sticky top-0 z-10 bg-[#050505] overflow-hidden">
        <PythonAgentSection />
      </div>

      <Footer />
    </main>
  );
}

export default App;

