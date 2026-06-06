import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ApplicationSection() {
  const applications = [
    {
      title: "PREVENÇÃO DE COLISÃO",
      desc: "Evitar o efeito cascata em órbita LEO."
    },
    {
      title: "ANÁLISE DE RISCO",
      desc: "Avaliação de segurança para lançamentos."
    },
    {
      title: "MONITORAMENTO DE DETRITOS",
      desc: "Mapeamento ativo de lixo espacial."
    },
    {
      title: "PLANEJAMENTO ORBITAL",
      desc: "Otimização de alocação de constelações."
    }
  ];

  return (
    <section className="w-full bg-[#4e37ff] text-white py-32 px-4 md:px-12 flex flex-col relative z-10 border-t border-white overflow-hidden">
      
      {/* Decorative large text background */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none opacity-10 flex">
        <span className="text-[20vw] font-black whitespace-nowrap">USE CASES - USE CASES - USE CASES</span>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Title & Intro */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-[4rem] md:text-[6rem] font-black leading-[0.9] tracking-tighter uppercase mb-8">
              CASOS DE<br/>USO REAIS
            </h2>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-md border-l-4 border-white pl-6">
              A infraestrutura do Kessler Vision permite segurança ativa no ambiente orbital cada vez mais congestionado da Terra.
            </p>
          </div>
          
          {/* Image Placeholder */}
          <div className="w-full h-64 md:h-80 border-2 border-white/30 bg-black/20 my-10 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="text-center p-6 z-10">
              <span className="font-mono text-white/60 uppercase tracking-widest text-sm mb-2 block">Ilustração de Impacto</span>
              <p className="text-white/40 text-xs max-w-[250px] mx-auto">
                [Insira aqui uma imagem de detritos orbitais, constelações de satélites ou uma representação do efeito cascata]
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <button className="flex items-center gap-3 bg-black text-white px-8 py-5 text-lg font-bold uppercase tracking-wider hover:bg-white hover:text-black border-2 border-black transition-all duration-300">
              Solicitar Demonstração <ArrowUpRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side: Brutalist List */}
        <div className="lg:col-span-7 border-t-2 border-white lg:border-t-0 lg:border-l-2 lg:pl-16 flex flex-col">
          {applications.map((app, i) => (
            <div key={i} className="group border-b-2 border-white/30 hover:border-white py-8 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between cursor-pointer">
              <div className="flex items-center gap-8">
                <span className="font-mono text-xl opacity-50">0{i + 1}</span>
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">{app.title}</h3>
              </div>
              <div className="mt-4 md:mt-0 opacity-0 md:group-hover:opacity-100 md:-translate-x-4 md:group-hover:translate-x-0 transition-all duration-300 flex items-center gap-4">
                <span className="text-sm font-mono text-white/80 max-w-[200px] text-right">{app.desc}</span>
                <div className="w-12 h-12 bg-white text-[#4e37ff] flex items-center justify-center rounded-full shrink-0">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
