import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const ASCII_ART = `
 █████   ████                          ████                                            ███           ███                     
░░███   ███░                          ░░███                                           ░░░           ░░░                      
 ░███  ███     ██████   █████   █████  ░███   ██████  ████████            █████ █████ ████   █████  ████   ██████  ████████  
 ░███████     ███░░███ ███░░   ███░░   ░███  ███░░███░░███░░███          ░░███ ░░███ ░░███  ███░░  ░░███  ███░░███░░███░░███ 
 ░███░░███   ░███████ ░░█████ ░░█████  ░███ ░███████  ░███ ░░░            ░███  ░███  ░███ ░░█████  ░███ ░███ ░███ ░███ ░███ 
 ░███ ░░███  ░███░░░   ░░░░███ ░░░░███ ░███ ░███░░░   ░███                ░░███ ███   ░███  ░░░░███ ░███ ░███ ░███ ░███ ░███ 
 █████ ░░████░░██████  ██████  ██████  █████░░██████  █████     █████████  ░░█████    █████ ██████  █████░░██████  ████ █████
░░░░░   ░░░░  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░  ░░░░░░  ░░░░░     ░░░░░░░░░    ░░░░░    ░░░░░ ░░░░░░  ░░░░░  ░░░░░░  ░░░░ ░░░░░ 
`;

const menuOptions = [
  "[1] Iniciar Rastreamento Orbital",
  "[2] Analisar Zona de Risco (Kessler)",
  "[3] Gerar Relatório de Detritos",
  "[4] Configurações de Satélite",
  "[5] Encerrar Conexão"
];

const TerminalSection = () => {
  const [outputVisible, setOutputVisible] = useState(false);
  const [menuLines, setMenuLines] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Controle de visibilidade
  const isInView = useInView(sectionRef, { once: true, margin: "-20%" });

  // Controle de Parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"]
  });
  // Efeito muito mais forte e agressivo
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-800px", "0px"]);
  // Fundo se movendo em velocidade diferente (Parallax real)
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], ["-400px", "0px"]);
  
  const parallaxOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Iniciar a animação de terminal apenas quando a seção estiver visível
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setOutputVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Animação de digitação do menu
  useEffect(() => {
    if (outputVisible) {
      const interval = setInterval(() => {
        setMenuLines((prev) => {
          if (prev < menuOptions.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [outputVisible]);

  return (
    <section ref={sectionRef} className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center py-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      
      {/* Background decoration com Parallax */}
      <motion.div style={{ y: bgParallaxY, opacity: parallaxOpacity }} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Subtle grid with no mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Curved horizontal lines */}
        <div className="absolute top-[5%] left-[-20%] w-[140%] h-[40%] rounded-[100%] border border-[#80808015]"></div>
        <div className="absolute top-[35%] left-[-20%] w-[140%] h-[40%] rounded-[100%] border border-[#80808015]"></div>
        <div className="absolute top-[65%] left-[-20%] w-[140%] h-[40%] rounded-[100%] border border-[#80808015]"></div>
        <div className="absolute top-[95%] left-[-20%] w-[140%] h-[40%] rounded-[100%] border border-[#80808015]"></div>
      </motion.div>

      {/* Conteúdo Principal com Parallax */}
      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className="w-full max-w-[1400px] z-10 grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-12 xl:gap-20 items-start">
        
        {/* LADO ESQUERDO: Apresentação da Aplicação */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-8 text-white px-4 xl:px-0"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 w-fit px-5 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400 backdrop-blur-sm">
            Terminal de Operações
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            A interface raiz <br />
            <span className="text-white/60">do monitoramento.</span>
          </h2>
          
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Tenha acesso direto aos scripts de análise profunda. Nossa interface emula os terminais das principais agências espaciais, entregando dados brutos da órbita em tempo real, rotas preditivas de colisão e densidade de fragmentos diretamente no seu console.
          </p>

          <ul className="flex flex-col gap-4 mt-4 text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">✓</span>
              <span><strong>Análise via CLI:</strong> Execute varreduras customizadas sem sair do teclado.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white mt-1">✓</span>
              <span><strong>Relatórios em tempo real:</strong> Conexão direta com os radares de rastreamento.</span>
            </li>
          </ul>
        </motion.div>

        {/* LADO DIREITO: Terminal */}
        <div className="flex flex-col w-full shadow-[0_0_50px_rgba(255,255,255,0.03)] order-first xl:order-last xl:mt-[52px]">
          {/* Terminal Header */}
          <div className="bg-[#18181B] rounded-t-xl border border-[#27272A] border-b-0 px-6 py-3 flex items-center gap-3">
            <div className="flex gap-2 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <Terminal className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-400 text-sm font-mono">Ran command: python kessler_vision.py</span>
          </div>

          {/* Terminal Body */}
          <div className="bg-[#0A0A0A] rounded-b-xl border border-[#27272A] p-8 md:p-12 min-h-[500px] overflow-x-auto relative scrollbar-hide">
            
            <div className="font-mono text-zinc-300 whitespace-pre">
              {/* Command Line Input */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-zinc-100">python kessler_vision.py --init --verbose</span>
              </div>

              {/* ASCII Art */}
              {outputVisible && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-zinc-100 text-[6px] sm:text-[8px] md:text-[10px] leading-none mb-10"
                >
                  {ASCII_ART}
                </motion.div>
              )}

              {/* Terminal Output Messages */}
              {outputVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3 mb-10 text-sm md:text-base"
                >
                  <div className="flex gap-2"><span className="text-blue-400">[INFO]</span><span>Estabelecendo conexão com os satélites de monitoramento... OK</span></div>
                  <div className="flex gap-2"><span className="text-blue-400">[INFO]</span><span>Carregando dados da órbita terrestre baixa (LEO)... OK</span></div>
                  <div className="flex gap-2"><span className="text-blue-400">[INFO]</span><span>Módulo de IA inicializado com sucesso.</span></div>
                  <div className="flex gap-2 mt-4 text-emerald-400">{'>>'} SISTEMA PRONTO. SELECIONE UMA AÇÃO:</div>
                </motion.div>
              )}

              {/* Interactive Menu */}
              <div className="flex flex-col gap-3 text-sm md:text-base">
                {menuOptions.slice(0, menuLines).map((option, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-fit px-3 py-1.5 -ml-3 text-zinc-400"
                  >
                    {option}
                  </motion.div>
                ))}
              </div>
              
              {/* Blinking Cursor */}
              {menuLines === menuOptions.length && (
                <div className="mt-6 flex items-center gap-2 text-sm md:text-base">
                  <span className="text-emerald-400">{'>>'}</span>
                  <span className="w-2.5 h-5 bg-white animate-pulse"></span>
                </div>
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export default TerminalSection;
