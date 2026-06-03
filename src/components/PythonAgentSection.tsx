import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, RotateCcw, AlertTriangle, Database, Terminal, Code2 } from 'lucide-react';

export default function PythonAgentSection() {
  const [catalog, setCatalog] = useState([
    { id: 10, nome: 'Corpo do Foguete H-IIA', altitude: 800 },
    { id: 25, nome: 'Satélite Inativo Iridium 33', altitude: 789 },
    { id: 42, nome: 'Fragmento Cosmos 2251', altitude: 815 },
    { id: 88, nome: 'Ferramenta Perdida (EVA)', altitude: 400 }
  ]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), text: "[INFO] Agente Python Autônomo inicializado. Estruturas carregadas." }]);
  
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newAlt, setNewAlt] = useState('');
  
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  
  const [kesslerFrags, setKesslerFrags] = useState('');
  const [kesslerGens, setKesslerGens] = useState('');
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text }]);
  };

  const binarySearch = (arr: any[], targetId: number, start: number, end: number): number => {
    if (start > end) return -1;
    const mid = Math.floor((start + end) / 2);
    if (arr[mid].id === targetId) return mid;
    if (arr[mid].id > targetId) return binarySearch(arr, targetId, start, mid - 1);
    return binarySearch(arr, targetId, mid + 1, end);
  };

  const insertSorted = (arr: any[], item: any) => {
    const newArr = [...arr];
    if (newArr.length === 0) return [item];
    for (let i = 0; i < newArr.length; i++) {
      if (item.id < newArr[i].id) {
        newArr.splice(i, 0, item);
        return newArr;
      }
    }
    newArr.push(item);
    return newArr;
  };

  const handleAdd = () => {
    const id = parseInt(newId);
    const alt = parseInt(newAlt);
    if (isNaN(id) || !newName || isNaN(alt)) {
      addLog("[ERRO] Preencha todos os campos corretamente.");
      return;
    }
    
    const exists = binarySearch(catalog, id, 0, catalog.length - 1) !== -1;
    if (exists) {
      addLog(`[ERRO] ID ${id} já existe no catálogo.`);
      return;
    }

    const newObj = { id, nome: newName, altitude: alt };
    setCatalog(prev => insertSorted(prev, newObj));
    setUndoStack(prev => [...prev, { action: 'insert', id }]);
    addLog(`[OK] Inserção O(n): '${newName}' adicionado. (Pilha +1)`);
    setNewId(''); setNewName(''); setNewAlt('');
  };

  const handleSearch = () => {
    const id = parseInt(searchId);
    if (isNaN(id)) return;
    
    addLog(`[*] Busca Binária O(log n) pelo ID ${id}...`);
    const index = binarySearch(catalog, id, 0, catalog.length - 1);
    
    if (index !== -1) {
      setSearchResult(catalog[index]);
      addLog(`[OK] Encontrado: ${catalog[index].nome} a ${catalog[index].altitude}km`);
    } else {
      setSearchResult(null);
      addLog(`[WARN] Objeto ID ${id} não encontrado.`);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) {
      addLog(`[WARN] Pilha vazia. Nada para desfazer.`);
      return;
    }
    
    const stackCopy = [...undoStack];
    const lastAction = stackCopy.pop();
    setUndoStack(stackCopy);
    
    if (lastAction.action === 'insert') {
      const idx = binarySearch(catalog, lastAction.id, 0, catalog.length - 1);
      if (idx !== -1) {
        const newCatalog = [...catalog];
        const removed = newCatalog.splice(idx, 1)[0];
        setCatalog(newCatalog);
        addLog(`[UNDO] Ação revertida. '${removed.nome}' removido.`);
      }
    }
  };

  const simulateKessler = (frags: number, gen: number): number => {
    if (gen === 0) return frags;
    return simulateKessler(frags * 2, gen - 1);
  };

  const handleKessler = () => {
    const f = parseInt(kesslerFrags);
    const g = parseInt(kesslerGens);
    if (isNaN(f) || isNaN(g)) return;
    
    addLog(`[*] Simulação recursiva iniciada...`);
    const total = simulateKessler(f, g);
    addLog(`[ALERTA] ${g} colisões: ${f} fragmentos viraram ${total} detritos!`);
  };

  const formatLogText = (text: string) => {
    if (text.includes('[ERRO]')) return <span className="text-red-400">{text}</span>;
    if (text.includes('[OK]')) return <span className="text-emerald-400">{text}</span>;
    if (text.includes('[WARN]') || text.includes('[ALERTA]')) return <span className="text-yellow-400">{text}</span>;
    if (text.includes('[INFO]')) return <span className="text-blue-400">{text}</span>;
    return <span className="text-zinc-300">{text}</span>;
  };

  return (
    <section className="relative w-full min-h-screen bg-[#050505] py-24 overflow-hidden border-t border-white/5">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* HEADER CENTRALIZADO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Full control from your terminal.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Algoritmos O(log n), pilhas e recursão processando dados orbitais em tempo real. A infraestrutura do Agente Python, agora no seu navegador.
          </p>
        </motion.div>

        {/* GRID ASSIMÉTRICO (COMO NA REFERÊNCIA) */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 xl:gap-12 items-start">
          
          {/* LADO ESQUERDO: CARDS VERTICAIS */}
          <div className="flex flex-col gap-4">
            
            {/* CARD 1 - HIGHLIGHTED (BRANCO) */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-xl relative group">
              <div className="mb-4">
                <h3 className="font-semibold text-black text-xl mb-1">Busca Binária</h3>
                <p className="text-zinc-600 text-sm">Velocidade extrema O(log n).</p>
              </div>
              <div className="flex gap-3 w-full">
                <input 
                  type="number" 
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="ID..."
                  className="bg-black/5 border border-black/10 rounded-xl px-4 py-3 flex-1 text-black placeholder:text-zinc-500 outline-none focus:border-black/30 transition-colors font-mono text-sm w-full"
                />
                <button onClick={handleSearch} className="bg-black text-white hover:bg-black/80 px-6 py-3 rounded-xl transition-colors font-semibold text-sm whitespace-nowrap">
                  Buscar
                </button>
              </div>
              {searchResult && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-black/5 border border-black/10 rounded-xl text-sm w-full text-black">
                  <span className="font-medium">{searchResult.nome}</span>
                  <span className="text-zinc-600 font-mono ml-2">[{searchResult.altitude}km]</span>
                </motion.div>
              )}
            </div>

            {/* CARD 2 - DARK */}
            <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] relative group hover:bg-[#111] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1">Catálogo Dinâmico</h3>
                  <p className="text-zinc-500 text-sm">Inserção ordenada O(n) e UNDO.</p>
                </div>
                <button onClick={handleUndo} className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                  <RotateCcw className="w-3.5 h-3.5" /> UNDO
                </button>
              </div>
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-3 gap-3 w-full">
                  <input type="number" value={newId} onChange={e => setNewId(e.target.value)} placeholder="ID" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm col-span-1 w-full" />
                  <input type="number" value={newAlt} onChange={e => setNewAlt(e.target.value)} placeholder="Alt (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm col-span-2 w-full" />
                </div>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nomenclatura" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 text-sm w-full" />
                <button onClick={handleAdd} className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 py-3 rounded-xl transition-colors font-semibold text-sm mt-2">
                  <Plus className="w-4 h-4" /> Registrar Objeto
                </button>
              </div>
            </div>

            {/* CARD 3 - DARK */}
            <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] relative group hover:bg-[#111] transition-colors">
              <div className="mb-4">
                <h3 className="font-semibold text-white text-xl mb-1">Síndrome de Kessler</h3>
                <p className="text-zinc-500 text-sm">Simulação recursiva O(2^n).</p>
              </div>
              <div className="flex gap-3 w-full">
                <input type="number" value={kesslerFrags} onChange={e => setKesslerFrags(e.target.value)} placeholder="Frags" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 flex-1 w-20 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 text-sm" />
                <input type="number" value={kesslerGens} onChange={e => setKesslerGens(e.target.value)} placeholder="Gerações" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 flex-1 w-20 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 text-sm" />
                <button onClick={handleKessler} className="bg-white/10 border border-white/10 text-white hover:bg-white/20 px-5 py-3 rounded-xl transition-colors font-semibold text-sm whitespace-nowrap">
                  Simular
                </button>
              </div>
            </div>
            
          </div>

          {/* LADO DIREITO: JANELA DE TERMINAL GIGANTE (COMO NA REFERÊNCIA) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full bg-[#0E0E0E] border border-[#222] rounded-[1.5rem] overflow-hidden shadow-2xl flex flex-col h-full min-h-[600px]"
          >
            {/* TERMINAL HEADER */}
            <div className="bg-[#151515] px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-zinc-400 font-mono text-sm tracking-wide">AGENT_CONSOLE.py</div>
              </div>
              <div className="flex gap-2 text-xs font-mono">
                <span className="bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full">Pilha UNDO: {undoStack.length}</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">SORTED_ASC</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
              
              {/* LOGS */}
              <div className="mb-8">
                <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">Output Log</h4>
                <div className="font-mono text-[13px] sm:text-sm space-y-2.5">
                  {logs.slice(-6).map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-zinc-600">[{log.time}]</span> {formatLogText(log.text)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-[#222] mb-8"></div>

              {/* TABELA DE MEMÓRIA */}
              <div className="flex-1">
                <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">Base de Dados (Memória Local)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-xs text-zinc-500 uppercase">
                      <tr>
                        <th className="pb-4 font-medium tracking-wider">ID</th>
                        <th className="pb-4 font-medium tracking-wider">Identificação do Objeto</th>
                        <th className="pb-4 font-medium tracking-wider text-right">Altitude</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      <AnimatePresence>
                        {catalog.map(obj => (
                          <motion.tr 
                            key={obj.id} 
                            layout
                            initial={{ opacity: 0, backgroundColor: "rgba(255,255,255,0.05)" }} 
                            animate={{ opacity: 1, backgroundColor: "transparent" }} 
                            exit={{ opacity: 0 }}
                            className="hover:bg-[#151515] transition-colors group"
                          >
                            <td className="py-4 font-mono text-zinc-400 group-hover:text-white transition-colors">{String(obj.id).padStart(3, '0')}</td>
                            <td className="py-4 text-zinc-300 pr-8">{obj.nome}</td>
                            <td className="py-4 text-right font-mono text-emerald-400/80 group-hover:text-emerald-400 transition-colors">{obj.altitude} km</td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            
            {/* TERMINAL FOOTER */}
            <div className="bg-[#111] px-6 py-4 border-t border-[#222] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> O(log n) Ready
              </div>
              <div>Python Agent V1.0</div>
            </div>
            
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
