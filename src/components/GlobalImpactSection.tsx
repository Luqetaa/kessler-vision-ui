import React, { useState } from 'react';
import { Globe, Radio, Shield, DollarSign, ChevronRight } from 'lucide-react';

export default function GlobalImpactSection() {
  const nodes = [
    {
      id: "01",
      title: "Telecomunicações",
      icon: <Radio className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />,
      description: "Sem a estabilidade do Java orquestrando servidores, frotas inteiras de GPS e satélites de internet poderiam colidir, derrubando a comunicação de continentes inteiros.",
      stat: "Comunicação"
    },
    {
      id: "02",
      title: "Segurança Nacional",
      icon: <Shield className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />,
      description: "Agências espaciais confiam na arquitetura robusta do Spring Boot para processar milhões de dados por segundo sem downtime. Falhar não é uma opção.",
      stat: "Defesa"
    },
    {
      id: "03",
      title: "Economia Espacial",
      icon: <DollarSign className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />,
      description: "Transações em tempo real, cálculos de seguro de frota e contratos bilionários dependem da segurança relacional que só o ecossistema Java entrega.",
      stat: "Transações"
    }
  ];

  return (
    <section className="w-full min-h-screen bg-[#4E37FF] text-white py-24 px-4 md:px-12 flex flex-col items-center justify-center relative overflow-hidden border-t border-white/20">
      
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
            <h2 className="text-[12vw] md:text-[5vw] font-black leading-[0.85] tracking-tighter uppercase font-sans text-white">
              IMPACTO<br/>
              <span className="text-white opacity-80">MUNDO REAL</span>
            </h2>
          </div>
          <div className="max-w-md text-left md:text-right hidden md:block">
            <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
              A infraestrutura invisível que impede catástrofes globais.
            </p>
          </div>
        </div>

        {/* Network & Impact Visualization */}
        <div className="w-full h-48 md:h-64 border border-white/40 bg-white/10 backdrop-blur-md mb-16 flex items-center justify-center overflow-hidden relative group rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          {/* Pulsing rings (Impact waves) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="absolute w-[200px] h-[200px] border border-white/50 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
             <div className="absolute w-[400px] h-[400px] border border-white/30 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
             <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
          </div>

          {/* Central Core: Java Engine / Globe */}
          <div className="relative z-10 bg-white border border-white p-5 md:p-6 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)] group-hover:shadow-[0_0_80px_rgba(255,255,255,0.8)] transition-all duration-700">
             <Globe className="w-12 h-12 md:w-16 md:h-16 text-[#4E37FF] animate-[spin_12s_linear_infinite]" />
             <div className="absolute inset-0 bg-white/50 blur-xl rounded-full"></div>
          </div>

          {/* Connected Floating Nodes (Desktop only for cleaner look) */}
          <div className="hidden md:flex absolute inset-0 max-w-4xl mx-auto items-center justify-between px-16 opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
             
             {/* Left Node: Telecom */}
             <div className="flex flex-col items-center gap-3 relative top-[-20px]">
               <div className="w-14 h-14 border border-white bg-white rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                 <Radio className="w-6 h-6 text-[#4E37FF]" />
                 {/* Connection Line to center */}
                 <div className="absolute -right-[150px] top-1/2 w-[150px] h-[2px] bg-gradient-to-r from-white/30 to-white"></div>
                 {/* Moving dot on line */}
                 <div className="absolute -right-[150px] top-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] -translate-y-1/2 animate-[moveRight_2s_linear_infinite]"></div>
               </div>
               <span className="text-xs uppercase font-bold tracking-widest text-white drop-shadow-md">Telecom</span>
             </div>

             {/* Right Node: Economy */}
             <div className="flex flex-col items-center gap-3 relative top-[30px]">
               <div className="w-14 h-14 border border-white bg-white rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                 <DollarSign className="w-6 h-6 text-[#4E37FF]" />
                 {/* Connection Line to center */}
                 <div className="absolute -left-[150px] top-1/2 w-[150px] h-[2px] bg-gradient-to-l from-white/30 to-white"></div>
                 {/* Moving dot on line */}
                 <div className="absolute left-0 top-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] -translate-y-1/2 animate-[moveLeft_2s_linear_infinite]"></div>
               </div>
               <span className="text-xs uppercase font-bold tracking-widest text-white drop-shadow-md">Economia</span>
             </div>
             
          </div>

          <style>{`
            @keyframes moveRight {
              0% { left: 100%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { left: calc(100% + 150px); opacity: 0; }
            }
            @keyframes moveLeft {
              0% { right: 100%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { right: calc(100% + 150px); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <div key={node.id} className="border border-white/50 bg-transparent p-8 flex flex-col justify-between h-full group hover:border-white hover:bg-white/10 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] rounded-2xl backdrop-blur-sm">
              <div className="flex justify-between items-start mb-12">
                <span className="font-mono text-2xl font-black text-white/50 group-hover:text-white transition-colors">
                  {node.id}
                </span>
                <div className="text-white/50 group-hover:text-white transition-colors">
                  {node.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight text-white">{node.title}</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80 mb-6 text-white group-hover:opacity-100 transition-opacity">
                  {node.description}
                </p>
                <div className="inline-block border border-white/40 px-4 py-1.5 text-xs font-mono uppercase rounded-full group-hover:bg-white/20 group-hover:border-white transition-colors text-white font-bold">
                  {node.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
