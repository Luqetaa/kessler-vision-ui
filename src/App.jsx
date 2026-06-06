import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection.tsx';
import DebrisSection from './components/DebrisSection';
import TerminalCursor from './components/TerminalCursor';
import PythonAgentSection from './components/PythonAgentSection.tsx';
import AlgorithmSection from './components/AlgorithmSection.tsx';
import ApplicationSection from './components/ApplicationSection.tsx';

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

    const onCustomScrollTo = (e) => {
      targetY = e.detail;
    };
    window.addEventListener('customScrollTo', onCustomScrollTo);

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
      
      const width = window.innerWidth;
      let lerpFactor = 0.02; // 4k+ default (máximo smooth)
      if (width < 768) {
        lerpFactor = 0.15; // Mobile (menos smooth, mais instantâneo)
      } else if (width < 2560) {
        lerpFactor = 0.08; // Telas menores que 2k (smoothness reduzido)
      }

      if (Math.abs(diff) > 0.5) {
        // Easing dinâmico baseado na resolução
        currentY += diff * lerpFactor;
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
      window.removeEventListener('customScrollTo', onCustomScrollTo);
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
      
      <div id="algorithm" className="relative z-10 bg-[#050505]">
        <AlgorithmSection />
      </div>

      <div id="applications" className="relative z-10 bg-[#050505]">
        <ApplicationSection />
      </div>
      
      <div id="python-agent-wrapper" className="relative z-10 bg-[#050505]">
        <PythonAgentSection />
      </div>

      <Footer />
    </main>
  );
}

export default App;

