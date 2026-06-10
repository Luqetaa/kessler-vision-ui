import React from 'react';
import { ArrowRight, Server, Database, Activity, ShieldCheck } from 'lucide-react';

export default function JavaSection() {
  const steps = [
    {
      id: "01",
      title: "ORQUESTRAÇÃO CENTRAL",
      description: "O Java age como o maestro do sistema, recebendo todas as requisições da interface e direcionando para os módulos corretos.",
      stat: "API REST",
      icon: <Server className="w-8 h-8 text-white/50 group-hover:text-black/50 transition-colors" />
    },
    {
      id: "02",
      title: "ARMAZENAMENTO SEGURO",
      description: "As informações de empresas, frotas e satélites são estruturadas e salvas de forma confiável e com alta disponibilidade.",
      stat: "PostgreSQL / H2",
      icon: <Database className="w-8 h-8 text-white/50 group-hover:text-black/50 transition-colors" />
    },
    {
      id: "03",
      title: "A PONTE COM O PYTHON",
      description: "O sistema em Java delega cálculos complexos para o Python de forma assíncrona, garantindo que o front-end nunca trave.",
      stat: "Microsserviços",
      icon: <Activity className="w-8 h-8 text-white/50 group-hover:text-black/50 transition-colors" />
    },
    {
      id: "04",
      title: "ROBUSTEZ E ESCALA",
      description: "Arquitetura pronta para gerenciar milhares de satélites e usuários simultaneamente sem perder o fôlego.",
      stat: "Spring Boot",
      icon: <ShieldCheck className="w-8 h-8 text-white/50 group-hover:text-black/50 transition-colors" />
    }
  ];

  return (
    <section className="w-full min-h-screen bg-[#050505] text-white py-24 px-4 md:px-12 flex flex-col items-center justify-center relative overflow-hidden border-t border-white/20">
      
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      ></div>

      <div className="w-full max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/40 pb-8">
          <div>
            <h2 className="text-[12vw] md:text-[5vw] font-black leading-[0.85] tracking-tighter uppercase font-sans">
              O MOTOR<br/>
              <span className="text-white/40">JAVA</span>
            </h2>
          </div>
          <div className="max-w-md text-left md:text-right hidden md:block">
            <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
              Como o Spring Boot sustenta e orquestra todo o fluxo de dados.
            </p>
          </div>
        </div>

        {/* Abstract Backend Visualization */}
        <div className="w-full aspect-[21/9] md:aspect-[3/1] border border-white/20 bg-[#0a0a0a] mb-16 flex items-center justify-center group overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-700">
            {/* Simple CSS animation to represent data flow */}
            <div className="flex items-start justify-center gap-2 md:gap-8 w-full px-4 pt-4 md:pt-0">
              
              {/* Left: Input */}
              <div className="flex flex-col items-center gap-4 w-28 md:w-32">
                <div className="w-16 h-16 md:w-24 md:h-24 border border-white/40 border-dashed rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                   <div className="w-8 h-8 md:w-12 md:h-12 bg-white/80 rounded-full animate-pulse"></div>
                </div>
                <span className="font-mono text-[10px] md:text-xs text-white/50 tracking-widest text-center uppercase">Interface Web</span>
              </div>
              
              {/* Middle: Network */}
              <div className="flex flex-col items-center justify-center gap-4 w-20 md:w-32 pt-6 md:pt-10">
                <div className="flex gap-2 md:gap-3">
                   <div className="w-2 h-2 md:w-3 md:h-3 bg-white/50 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                   <div className="w-2 h-2 md:w-3 md:h-3 bg-white/50 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                   <div className="w-2 h-2 md:w-3 md:h-3 bg-white/50 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                </div>
                <span className="font-mono text-[9px] md:text-[10px] text-white/30 tracking-widest text-center uppercase">Tempo Real</span>
              </div>
              
              {/* Right: Server */}
              <div className="flex flex-col items-center gap-4 w-28 md:w-32">
                <div className="w-16 h-16 md:w-24 md:h-24 border border-white/40 flex items-center justify-center bg-white/5 rounded-2xl">
                   <Server className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
                </div>
                <span className="font-mono text-[10px] md:text-xs text-white/50 tracking-widest text-center uppercase">Orquestrador Java</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 pointer-events-none z-10">
            <span className="font-mono text-black font-bold uppercase tracking-widest text-xs block bg-white px-3 py-1">
              Status: Operacional
            </span>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="border border-white/20 bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between h-full group hover:bg-white/10 hover:border-white/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-2xl">
              <div className="flex justify-between items-start mb-12">
                <span className="font-mono text-2xl font-black text-white/50 group-hover:text-white transition-colors">
                  {step.id}
                </span>
                <div className="text-white/50 group-hover:text-white transition-colors">
                  {step.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight text-white group-hover:text-white/90">{step.title}</h3>
                <p className="text-sm font-light leading-relaxed opacity-70 mb-6 group-hover:opacity-100 text-white/90">
                  {step.description}
                </p>
                <div className="inline-block border border-white/20 px-4 py-1.5 text-xs font-mono uppercase rounded-full group-hover:border-white/50 group-hover:bg-white/10 transition-colors text-white">
                  {step.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
