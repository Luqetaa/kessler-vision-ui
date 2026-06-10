import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Database, Radar, AlertTriangle, CheckCircle, Shield, Building2, Rocket, Trash2 } from 'lucide-react';

export default function DashboardSection() {
  // ---- Estados de Dados ----
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [frotas, setFrotas] = useState<any[]>([]);
  const [satelites, setSatelites] = useState<any[]>([]);

  // ---- Estados de Seleção Ativa ----
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | ''>('');
  const [selectedFrotaId, setSelectedFrotaId] = useState<number | ''>('');

  // ---- Estados de Formulários (Novo) ----
  const [showNovaEmpresa, setShowNovaEmpresa] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState({ nomeEmpresa: 'Kessler Corp', numeroDocumento: '00.000.000/0001-00' });
  
  const [showNovaFrota, setShowNovaFrota] = useState(false);
  const [novaFrota, setNovaFrota] = useState({ nomeFrota: 'Frota LEO Primária', proposito: 'Monitoramento Ambiental' });

  const [novoSatelite, setNovoSatelite] = useState({ nomeSatelite: '', cdNorad: '', altitudeAtual: '' });

  // ---- Estados de UI ----
  const [loadingRadarId, setLoadingRadarId] = useState<number | null>(null);
  const [radarStatus, setRadarStatus] = useState<Record<number, any>>({});
  const [globalError, setGlobalError] = useState('');

  // ---- Efeitos de Carregamento ----
  useEffect(() => {
    carregarEmpresas();
    carregarSatelites();
  }, []);

  useEffect(() => {
    if (selectedEmpresaId) {
      carregarFrotas(selectedEmpresaId as number);
    } else {
      setFrotas([]);
      setSelectedFrotaId('');
    }
  }, [selectedEmpresaId]);

  // ---- Funções de API: GET ----
  const carregarEmpresas = async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(res.data);
      if (res.data.length > 0 && !selectedEmpresaId) {
        setSelectedEmpresaId(res.data[0].idEmpresa);
      } else if (res.data.length === 0) {
        setShowNovaEmpresa(true); // Se não tem empresa, mostra o form com padrão
      }
    } catch (err: any) {
      setGlobalError('Erro ao carregar empresas. O servidor Java está rodando?');
    }
  };

  const carregarFrotas = async (empresaId: number) => {
    try {
      const res = await api.get('/frotas');
      // Filtra as frotas da empresa selecionada (o backend retorna todas no GET /frotas)
      const frotasDaEmpresa = res.data.filter((f: any) => f.empresa.idEmpresa === empresaId);
      setFrotas(frotasDaEmpresa);
      if (frotasDaEmpresa.length > 0) {
        setSelectedFrotaId(frotasDaEmpresa[0].idFrota);
      } else {
        setSelectedFrotaId('');
        setShowNovaFrota(true); // Se não tem frota, mostra form com padrão
      }
    } catch (err) {
      setGlobalError('Erro ao carregar frotas.');
    }
  };

  const carregarSatelites = async () => {
    try {
      const res = await api.get('/satelites');
      setSatelites(res.data);
    } catch (err) {
      setGlobalError('Erro ao carregar satélites.');
    }
  };

  // ---- Funções de API: POST ----
  const criarEmpresa = async () => {
    try {
      const res = await api.post('/empresas', novaEmpresa);
      await carregarEmpresas();
      setSelectedEmpresaId(res.data.idEmpresa);
      setShowNovaEmpresa(false);
      setNovaEmpresa({ nomeEmpresa: '', numeroDocumento: '' });
      setGlobalError('');
    } catch (err: any) {
      setGlobalError('Erro ao criar empresa: ' + (err.response?.data || err.message));
    }
  };

  const criarFrota = async () => {
    if (!selectedEmpresaId) return;
    try {
      const payload = { ...novaFrota, empresa: { idEmpresa: selectedEmpresaId } };
      const res = await api.post('/frotas', payload);
      await carregarFrotas(selectedEmpresaId as number);
      setSelectedFrotaId(res.data.idFrota);
      setShowNovaFrota(false);
      setNovaFrota({ nomeFrota: '', proposito: '' });
      setGlobalError('');
    } catch (err: any) {
      setGlobalError('Erro ao criar frota: ' + (err.response?.data || err.message));
    }
  };

  const criarSatelite = async () => {
    if (!selectedFrotaId || !novoSatelite.nomeSatelite || !novoSatelite.cdNorad || !novoSatelite.altitudeAtual) {
      setGlobalError('Preencha todos os campos do satélite e garanta que uma frota está selecionada.');
      return;
    }
    try {
      const payload = {
        nomeSatelite: novoSatelite.nomeSatelite,
        cdNorad: parseInt(novoSatelite.cdNorad),
        altitudeAtual: parseFloat(novoSatelite.altitudeAtual),
        frota: { idFrota: selectedFrotaId }
      };
      await api.post('/satelites', payload);
      await carregarSatelites();
      setNovoSatelite({ nomeSatelite: '', cdNorad: '', altitudeAtual: '' });
      setGlobalError('');
    } catch (err: any) {
      setGlobalError('Erro ao cadastrar satélite: ' + (err.response?.data || err.message));
    }
  };

  const deletarSatelite = async (idSatelite: number) => {
    try {
      await api.delete(`/satelites/${idSatelite}`);
      await carregarSatelites();
      setGlobalError('');
    } catch (err: any) {
      setGlobalError('Erro ao excluir satélite: ' + (err.response?.data || err.message));
    }
  };

  // ---- Função de Radar (Integração com Python) ----
  const executarVarredura = async (idSatelite: number) => {
    setLoadingRadarId(idSatelite);
    try {
      const res = await api.get(`/radar/varredura/${idSatelite}`);
      // res.data contém o JSON do Python ({ nivelAlerta: "VERMELHO", probabilidadeImpacto: 95.5 })
      setRadarStatus(prev => ({ ...prev, [idSatelite]: res.data }));
    } catch (err) {
      alert('Erro ao executar varredura no radar.');
    } finally {
      setLoadingRadarId(null);
    }
  };

  return (
    <section className="w-full bg-[#050505] text-white pt-24 pb-48 px-4 md:px-12 flex flex-col relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* HEADER DO DASHBOARD */}
        <div className="mb-12 border-b border-[#222] pb-6 flex items-end justify-between">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-4 text-white">
              <Database className="w-10 h-10 text-zinc-400" />
              Painel de Controle
            </h2>
            <p className="font-mono text-zinc-500 mt-2 uppercase tracking-widest text-sm">
              Centro de Operações PostgreSQL
            </p>
          </div>
        </div>

        {globalError && (
          <div className="bg-red-500/10 text-red-400 p-4 mb-8 font-mono text-sm uppercase flex items-center gap-3 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
            {globalError}
          </div>
        )}

        {/* ÁREA DE CADASTRO (CASCATA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* COLUNA 1: EMPRESA */}
          <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#111] transition-colors">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-zinc-500" /> 1. Empresa
                  </h3>
                </div>
              </div>
              
              {!showNovaEmpresa ? (
                <div className="space-y-4">
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white font-mono text-sm appearance-none"
                    value={selectedEmpresaId}
                    onChange={(e) => setSelectedEmpresaId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="" disabled className="text-zinc-500">Selecione uma Empresa</option>
                    {empresas.map(e => (
                      <option key={e.idEmpresa} value={e.idEmpresa}>{e.nomeEmpresa} (Doc: {e.numeroDocumento})</option>
                    ))}
                  </select>
                  <button onClick={() => setShowNovaEmpresa(true)} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 py-3 rounded-xl transition-colors font-semibold text-sm">
                    <Plus className="w-4 h-4" /> ADICIONAR NOVA
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Nome da Empresa" value={novaEmpresa.nomeEmpresa} onChange={e => setNovaEmpresa({...novaEmpresa, nomeEmpresa: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <input type="text" placeholder="Documento (CNPJ/ID)" value={novaEmpresa.numeroDocumento} onChange={e => setNovaEmpresa({...novaEmpresa, numeroDocumento: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <div className="flex gap-2 pt-2">
                    <button onClick={criarEmpresa} className="flex-1 bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">SALVAR</button>
                    {empresas.length > 0 && (
                      <button onClick={() => setShowNovaEmpresa(false)} className="flex-1 bg-white/10 text-white font-semibold py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm">CANCELAR</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA 2: FROTA */}
          <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#111] transition-colors">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-zinc-500" /> 2. Frota
                  </h3>
                </div>
              </div>
              
              {!selectedEmpresaId ? (
                <div className="text-sm font-mono text-zinc-500 p-4 border border-dashed border-[#333] rounded-xl text-center bg-[#111]">Selecione uma Empresa primeiro.</div>
              ) : !showNovaFrota ? (
                <div className="space-y-4">
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white font-mono text-sm appearance-none"
                    value={selectedFrotaId}
                    onChange={(e) => setSelectedFrotaId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="" disabled className="text-zinc-500">Selecione uma Frota</option>
                    {frotas.map(f => (
                      <option key={f.idFrota} value={f.idFrota}>{f.nomeFrota}</option>
                    ))}
                  </select>
                  <button onClick={() => setShowNovaFrota(true)} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 py-3 rounded-xl transition-colors font-semibold text-sm">
                    <Plus className="w-4 h-4" /> ADICIONAR NOVA
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Nome da Frota" value={novaFrota.nomeFrota} onChange={e => setNovaFrota({...novaFrota, nomeFrota: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <input type="text" placeholder="Propósito (Ex: LEO)" value={novaFrota.proposito} onChange={e => setNovaFrota({...novaFrota, proposito: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <div className="flex gap-2 pt-2">
                    <button onClick={criarFrota} className="flex-1 bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">SALVAR</button>
                    {frotas.length > 0 && (
                      <button onClick={() => setShowNovaFrota(false)} className="flex-1 bg-white/10 text-white font-semibold py-2.5 rounded-xl hover:bg-white/20 transition-colors text-sm">CANCELAR</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA 3: SATÉLITE */}
          <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#111] transition-colors">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1 flex items-center gap-2">
                    <Radar className="w-5 h-5 text-yellow-500" /> 3. Satélite
                  </h3>
                </div>
              </div>
              
              {!selectedFrotaId ? (
                <div className="text-sm font-mono text-zinc-500 p-4 border border-dashed border-[#333] rounded-xl text-center bg-[#111]">Selecione uma Frota primeiro.</div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="NORAD ID (Ex: 25544)" value={novoSatelite.cdNorad} onChange={e => setNovoSatelite({...novoSatelite, cdNorad: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <input type="text" placeholder="Nome (Ex: ISS)" value={novoSatelite.nomeSatelite} onChange={e => setNovoSatelite({...novoSatelite, nomeSatelite: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <input type="number" placeholder="Altitude Atual (km)" value={novoSatelite.altitudeAtual} onChange={e => setNovoSatelite({...novoSatelite, altitudeAtual: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm" />
                  <button onClick={criarSatelite} className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 py-3 rounded-xl transition-colors font-semibold text-sm mt-2">
                    <Plus className="w-4 h-4" /> REGISTRAR SATÉLITE
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* TABELA DE MONITORAMENTO */}
        <div className="mt-20">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
            <Shield className="w-6 h-6 text-zinc-500" /> 
            Monitoramento Ativo
          </h3>
          
          <div className="bg-[#0E0E0E] border border-[#222] rounded-[1.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-[#151515] text-zinc-400 text-xs tracking-widest uppercase border-b border-[#222]">
                    <th className="p-4 md:px-6">NORAD ID</th>
                    <th className="p-4 md:px-6">Nome</th>
                    <th className="p-4 md:px-6">Altitude</th>
                    <th className="p-4 md:px-6">Frota</th>
                    <th className="p-4 md:px-6 text-center">Status Radar</th>
                    <th className="p-4 md:px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {satelites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-600 font-medium uppercase tracking-widest">Nenhum satélite cadastrado no momento.</td>
                    </tr>
                  ) : (
                    satelites.map(sat => {
                      const status = radarStatus[sat.idSatelite];
                      const isLoading = loadingRadarId === sat.idSatelite;
                      
                      return (
                        <tr key={sat.idSatelite} className="border-b border-[#222] hover:bg-white/5 transition-colors">
                          <td className="p-4 md:px-6 text-zinc-300 font-medium">{sat.cdNorad}</td>
                          <td className="p-4 md:px-6 text-white">{sat.nomeSatelite}</td>
                          <td className="p-4 md:px-6 text-zinc-400">{sat.altitudeAtual} km</td>
                          <td className="p-4 md:px-6 text-zinc-500 text-xs">{sat.frota?.nomeFrota}</td>
                          <td className="p-4 md:px-6 text-center">
                            {isLoading ? (
                              <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold animate-pulse px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <Radar className="w-3 h-3 animate-spin" /> CALCULANDO
                              </span>
                            ) : status ? (
                              status.erro ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 font-bold text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20" title={status.erro}>
                                  <AlertTriangle className="w-3 h-3" /> ERRO (PYTHON OFFLINE)
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-2 px-3 py-1 font-bold text-xs rounded-lg ${
                                  status.nivelAlerta === 'VERDE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  status.nivelAlerta === 'AMARELO' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                  'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {status.nivelAlerta === 'VERDE' && <CheckCircle className="w-3 h-3" />}
                                  {status.nivelAlerta === 'AMARELO' && <AlertTriangle className="w-3 h-3" />}
                                  {status.nivelAlerta === 'VERMELHO' && <Shield className="w-3 h-3" />}
                                  {status.nivelAlerta} {status.probabilidadeImpacto ? `(${status.probabilidadeImpacto.toFixed(1)}%)` : ''}
                                </span>
                              )
                            ) : (
                              <span className="text-zinc-600 font-medium text-xs">- AGUARDANDO -</span>
                            )}
                          </td>
                          <td className="p-4 md:px-6 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => executarVarredura(sat.idSatelite)}
                              disabled={isLoading}
                              className="bg-white/10 text-white font-semibold text-xs px-4 py-2 hover:bg-white/20 transition-colors disabled:opacity-50 rounded-lg flex items-center gap-2"
                            >
                              <Radar className="w-3 h-3" /> ANALISAR
                            </button>
                            <button 
                              onClick={() => deletarSatelite(sat.idSatelite)}
                              disabled={isLoading}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs p-2 transition-colors disabled:opacity-50 rounded-lg flex items-center justify-center"
                              title="Excluir Satélite"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
