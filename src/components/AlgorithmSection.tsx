import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function AlgorithmSection() {
  const steps = [
    {
      id: "01",
      title: "INGESTÃO DE DADOS",
      description: "Coleta contínua de TLEs (Two-Line Elements) e feed de telemetria bruta dos satélites.",
      stat: "28k+ Objetos",
    },
    {
      id: "02",
      title: "PROPAGAÇÃO ORBITAL",
      description: "Cálculo vetorial e interpolação de trajetórias usando modelos de física SGP4.",
      stat: "Real-time",
    },
    {
      id: "03",
      title: "PREDIÇÃO DE COLISÃO",
      description: "Mapeamento de interseção de órbitas e cálculo de probabilidade de impacto (PoC).",
      stat: "< 1km Margem",
    },
    {
      id: "04",
      title: "ALERTA E RELATÓRIO",
      description: "Disparo de alertas automatizados e geração de manobras evasivas recomendadas.",
      stat: "Autônomo",
    }
  ];

  return (
    <section className="w-full min-h-screen bg-[#050505] text-white py-24 px-4 md:px-12 flex flex-col items-center justify-center relative overflow-hidden border-t border-white/20">
      
      {/* Background brutalist grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      ></div>

      <div className="w-full max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/40 pb-8">
          <div>
            <h2 className="text-[12vw] md:text-[6vw] font-black leading-[0.85] tracking-tighter uppercase font-sans">
              ALGORITMO<br/>
              <span className="text-white/40">KESSLER</span>
            </h2>
          </div>
          <div className="max-w-xs text-right hidden md:block">
            <p className="text-white/60 font-mono text-sm uppercase tracking-widest">
              Arquitetura de processamento de dados e detecção de anomalias espaciais
            </p>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="w-full aspect-video border border-white/20 bg-[#0a0a0a] mb-12 flex items-center justify-center group overflow-hidden relative">
          <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors duration-500"></div>
          <div className="text-center p-8 z-10">
            <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-2 block">Diagrama de Arquitetura Orbital</span>
            <p className="text-white/20 text-xs max-w-md mx-auto">
              [Insira aqui uma imagem de alta resolução ilustrando o fluxo de dados dos satélites até a predição de colisão]
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="border border-white/20 bg-[#0a0a0a] p-8 flex flex-col justify-between aspect-square group hover:bg-white hover:text-black transition-colors duration-300">
              <div className="flex justify-between items-start mb-12">
                <span className="font-mono text-2xl font-black text-white/50 group-hover:text-black/50 transition-colors">
                  {step.id}
                </span>
                <ArrowRight className="w-8 h-8 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm font-light leading-relaxed opacity-70 mb-6 group-hover:opacity-100">
                  {step.description}
                </p>
                <div className="inline-block border border-white/20 px-4 py-1.5 text-xs font-mono uppercase rounded-full group-hover:border-black/20 group-hover:bg-black/5 transition-colors">
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
