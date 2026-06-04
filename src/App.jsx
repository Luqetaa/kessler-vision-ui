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

    // Sincroniza se o usuário scrollar de outro jeito (scrollbar, touch, etc.)
    const syncScroll = () => {
      // Se a diferença entre o real e o esperado for grande, alguém scrollou por fora
      if (Math.abs(window.scrollY - currentY) > 2) {
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
      // Normaliza pra pixels
      if (e.deltaMode === 1) delta *= 20;
      if (e.deltaMode === 2) delta *= window.innerHeight;

      // Normaliza o delta — limita cada tick a no máximo 60px de distância-alvo
      // Isso garante que qualquer mouse/OS tem o mesmo comportamento
      delta = Math.max(-60, Math.min(60, delta * 0.5));

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));
    };

    const animate = () => {
      syncScroll();

      // Lerp suave — interpola entre posição atual e alvo
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        // Easing: move 12% da distância restante por frame (~60fps)
        // Isso cria um efeito de desaceleração natural (ease-out)
        currentY += diff * 0.12;
        window.scrollTo(0, currentY);
      } else {
        currentY = targetY;
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

