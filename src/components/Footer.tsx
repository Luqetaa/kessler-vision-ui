import React, { useEffect, useRef } from 'react';

const BizuLogo = () => (
  <svg viewBox="0 0 120 40" className="h-[9vw] min-h-[45px] max-h-[85px] w-auto inline-block align-middle fill-current text-white" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="0" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="4" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="26" cy="20" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="2.2" transform="rotate(-30 26 20)" />
    <ellipse cx="26" cy="20" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="2.2" transform="rotate(30 26 20)" />
    <text x="45" y="27" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700" letterSpacing="1px" fill="currentColor">BIZU</text>
  </svg>
);

const VisionaLogo = () => (
  <svg viewBox="0 0 170 42" className="h-[9vw] min-h-[45px] max-h-[85px] w-auto inline-block align-middle fill-current text-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M 20 5 A 16 16 0 0 0 20 37 A 9 16 0 0 1 20 5 Z" fill="currentColor" />
    <path d="M 23 5 A 16 16 0 0 1 23 37 A 12 16 0 0 0 23 5 Z" fill="currentColor" opacity="0.85" />
    <path d="M 27 6.5 A 16 16 0 0 1 27 35.5 A 14 16 0 0 0 27 6.5 Z" fill="currentColor" opacity="0.7" />
    <path d="M 31 9.5 A 16 16 0 0 1 31 32.5 A 15 16 0 0 0 31 9.5 Z" fill="currentColor" opacity="0.5" />
    <text x="45" y="22" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="400" letterSpacing="3.5px" fill="currentColor">VISIONΛ</text>
    <text x="46" y="35" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8" fontWeight="300" letterSpacing="0.8px" fill="currentColor" opacity="0.8">Tecnologia Espacial</text>
  </svg>
);

const SpaceTerraLogo = () => (
  <svg viewBox="0 0 160 40" className="h-[9vw] min-h-[45px] max-h-[85px] w-auto inline-block align-middle fill-current text-white" xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      <path d="M 17 17 C 7 17, 2 12, 2 2 C 12 2, 17 7, 17 17 Z" />
      <path d="M 23 17 C 33 17, 38 12, 38 2 C 28 2, 23 7, 23 17 Z" />
      <path d="M 17 23 C 7 23, 2 28, 2 38 C 12 38, 17 33, 17 23 Z" />
      <path d="M 23 23 C 33 23, 38 28, 38 38 C 28 38, 23 33, 23 23 Z" />
    </g>
    <text x="46" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.8px" fill="currentColor">SPACE</text>
    <text x="46" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" fontWeight="800" letterSpacing="0.8px" fill="currentColor">TERRA</text>
  </svg>
);

const FiapLogo = () => (
  <svg viewBox="0 0 190 50" className="h-[9vw] min-h-[45px] max-h-[85px] w-auto inline-block align-middle fill-current text-white" xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      {/* F */}
      <path d="M 15 5 H 55 V 9 H 19 V 22 H 42 V 26 H 19 V 45 H 15 Z" />
      {/* I */}
      <path d="M 70 5 H 74 V 45 H 70 Z" />
      {/* A (Perna esquerda e topo) */}
      <path d="M 112 5 L 90 45 H 94.5 L 112 13.18 L 117.95 24 H 122.45 Z" />
      {/* A (Perna direita inferior) */}
      <path d="M 122.35 32 H 126.85 L 134 45 H 129.5 Z" />
      {/* P (Haste e curva externa) */}
      <path d="M 148 5 H 166 A 10 10 0 0 1 166 25 H 152 V 45 H 148 Z M 152 21 H 166 A 6 6 0 0 0 166 9 H 152 Z" fillRule="evenodd" />
    </g>
  </svg>
);


export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const band1Ref = useRef<HTMLDivElement>(null);
  const band2Ref = useRef<HTMLDivElement>(null);

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
      <div className="relative w-full h-[480px] select-none pointer-events-none z-10 overflow-visible mt-24">
        {/* Band 1 (Back) */}
        <div 
          className="absolute left-[-5%] w-[110%] py-12 bg-[#4e37ff] border-y border-white"
          style={{ 
            transform: 'rotate(-2.5deg)', 
            top: '140px',
            zIndex: 1 
          }}
        >
          <div className="overflow-hidden flex">
            <div ref={band1Ref} className="marquee-strip whitespace-nowrap flex items-center gap-24">
              {Array(8).fill(null).map((_, i) => (
                <span key={i} className="flex items-center gap-24">
                  <BizuLogo />
                  <VisionaLogo />
                  <SpaceTerraLogo />
                  <FiapLogo />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Band 2 (Front) */}
        <div 
          className="absolute left-[-5%] w-[110%] py-12 bg-[#4e37ff] border-y border-white shadow-[0_-5px_12px_rgba(0,0,0,0.15)]"
          style={{ 
            transform: 'none', 
            top: '250px',
            zIndex: 2 
          }}
        >
          <div className="overflow-hidden flex">
            <div ref={band2Ref} className="marquee-strip whitespace-nowrap flex items-center gap-24">
              {Array(8).fill(null).map((_, i) => (
                <span key={i} className="flex items-center gap-24">
                  <SpaceTerraLogo />
                  <FiapLogo />
                  <BizuLogo />
                  <VisionaLogo />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT WITH BLUE BACKGROUND */}
      <div className="bg-[#4e37ff] w-full px-6 md:px-12 pt-20 pb-8 flex-grow flex flex-col justify-between -mt-44 relative z-0">
        {/* MIDDLE INFO SECTION (Academic Details & Team) */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-left my-16 font-sans items-start">
          <div className="col-span-1 md:col-span-6 flex flex-col gap-4">
            <div className="text-white/50 font-mono text-sm tracking-wider uppercase">Projeto Acadêmico</div>
            <h3 className="text-3xl font-black text-white leading-none">Kessler Vision</h3>
            <p className="text-white/80 text-base leading-relaxed font-light max-w-xl">
              Uma plataforma acadêmica inteligente projetada para o monitoramento e mitigação de lixo espacial. 
              O sistema ingere dados telemétricos de órbitas baixas (LEO), calcula probabilidade de colisões (Pc) em tempo real e emite alertas visando a segurança de ativos orbitais.
            </p>
          </div>
          
          {/* Team / Equipe */}
          <div className="col-span-1 md:col-span-6 flex flex-col gap-4">
            <div className="text-white/50 font-mono text-sm tracking-wider uppercase">Equipe de Desenvolvimento</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm">
              <div className="flex flex-col">
                <span className="text-white font-bold">Lucas Cavalcante</span>
                <span className="text-white/60 text-xs">RM 562857</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold">Caio N. Battista</span>
                <span className="text-white/60 text-xs">RM 561383</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold">Matheus Rodrigues</span>
                <span className="text-white/60 text-xs">RM 561689</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold">Manoah Leão</span>
                <span className="text-white/60 text-xs">RM 563713</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold">Jean Pierre</span>
                <span className="text-white/60 text-xs">RM 566534</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID SECTION (Technical Stack) */}
        <div className="w-full border-t border-white/40 pt-12 pb-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left font-sans">
            {/* Column 1: Core Engine */}
            <div className="flex flex-col min-h-[160px] border-r-0 md:border-r border-white/40 pr-0 md:pr-12">
              <h5 className="text-sm font-mono uppercase tracking-wider text-white/60 mb-3">Core & Backend</h5>
              <h4 className="text-xl font-bold mb-2 text-white">Java DDD</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">
                O motor principal da aplicação foi estruturado em Java seguindo os conceitos de Domain-Driven Design (DDD), contendo as regras de negócio de frotas de satélites e cálculo preciso de manobras de evasão (CAM).
              </p>
            </div>

            {/* Column 2: Autonomy & Ingestion */}
            <div className="flex flex-col min-h-[160px] border-r-0 md:border-r border-white/40 px-0 md:px-6">
              <h5 className="text-sm font-mono uppercase tracking-wider text-white/60 mb-3">Autonomia & Ingestão</h5>
              <h4 className="text-xl font-bold mb-2 text-white">Agentes Python</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">
                Algoritmos em Python atuam como agentes autônomos para ingestão contínua de dados telemétricos brutos (TLE), monitorando conjunções orbitais críticas dentro de um raio de 60km (Warning Box).
              </p>
            </div>

            {/* Column 3: Data & Communication */}
            <div className="flex flex-col min-h-[160px] pl-0 md:pl-12">
              <h5 className="text-sm font-mono uppercase tracking-wider text-white/60 mb-3">Dados & Comunicação</h5>
              <h4 className="text-xl font-bold mb-2 text-white">PostGIS & Message Broker</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">
                Armazenamento geolocalizado relacional via PostgreSQL e extensão PostGIS. A integração assíncrona entre o core em Java e os agentes Python é gerenciada por meio de Message Broker.
              </p>
            </div>
          </div>
        </div>

        {/* SUB-FOOTER */}
        <div className="w-full border-t border-white/40 pt-6 mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 font-sans gap-4">
          <div>
            <span>FIAP - Engenharia de Software</span>
          </div>
          <div>
            <span>© 2026 Kessler Vision.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
