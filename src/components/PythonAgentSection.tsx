/**
 * PythonAgentSection — Simulador Tático Kessler Vision v2.0
 *
 * Seção web interativa que implementa algoritmos de monitoramento de lixo espacial.
 * Consome dados reais da API CelesTrak (Cosmos 2251 Debris) e implementa:
 *  - Busca Binária O(log n) para radar de zonas de altitude
 *  - Pilha (Stack) LIFO para manobras evasivas (CAM)
 *  - Recursão para simulação da Síndrome de Kessler
 *  - Documentação Big-O (estilo Google) em todas as funções críticas
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Shield, Zap, RotateCcw, ArrowUp, ArrowDown,
  Activity, Radar, Layers, Database
} from 'lucide-react';

// ====================================================================
// TIPOS E INTERFACES
// ====================================================================

interface DebrisObject {
  noradId: number;
  name: string;
  objectId: string;
  altitude: number;
  inclination: number;
  eccentricity: number;
}

interface LogEntry {
  time: string;
  text: string;
  type: 'info' | 'ok' | 'warn' | 'error' | 'boot' | 'system';
}

interface CascadeGenResult {
  generation: number;
  impactAltitude: number;
  objectsHit: number;
  objectNames: string[];
  fragmentsGenerated: number;
}

interface SafetyResult {
  status: 'green' | 'yellow' | 'red';
  threats: number;
  nearest: number | null;
}

interface CatalogStats {
  total: number;
  altMin: number;
  altMax: number;
  leoLow: number;
  leoMid: number;
  leoHigh: number;
}

// ====================================================================
// CONSTANTES ORBITAIS
// ====================================================================

/** Parâmetro gravitacional padrão da Terra (km³/s²) */
const MU_EARTH = 398600.4418;
/** Raio equatorial médio da Terra (km) */
const R_EARTH = 6378.137;
/** Endpoint da API CelesTrak para detritos do Cosmos 2251 */
const CELESTRAK_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=JSON';

/**
 * Dados de fallback (formato bruto CelesTrak) para uso quando a API está indisponível.
 * Selecionados manualmente a partir do catálogo real para cobrir a faixa de altitudes.
 */
const FALLBACK_RAW = [
  { OBJECT_NAME: "COSMOS 2251", NORAD_CAT_ID: 22675, OBJECT_ID: "1993-036A", MEAN_MOTION: 14.33253459, INCLINATION: 74.04, ECCENTRICITY: 0.00240798 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33757, OBJECT_ID: "1993-036E", MEAN_MOTION: 14.32623198, INCLINATION: 74.04, ECCENTRICITY: 0.00150992 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33758, OBJECT_ID: "1993-036F", MEAN_MOTION: 14.52788917, INCLINATION: 74.03, ECCENTRICITY: 0.00168817 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33765, OBJECT_ID: "1993-036N", MEAN_MOTION: 15.2306418, INCLINATION: 74.0, ECCENTRICITY: 0.0054993 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33768, OBJECT_ID: "1993-036R", MEAN_MOTION: 13.58616372, INCLINATION: 74.07, ECCENTRICITY: 0.03671204 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33779, OBJECT_ID: "1993-036U", MEAN_MOTION: 14.74407417, INCLINATION: 74.04, ECCENTRICITY: 0.00134846 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33789, OBJECT_ID: "1993-036AE", MEAN_MOTION: 13.8902994, INCLINATION: 74.06, ECCENTRICITY: 0.02407166 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33792, OBJECT_ID: "1993-036AH", MEAN_MOTION: 13.46135641, INCLINATION: 73.9, ECCENTRICITY: 0.04298013 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33795, OBJECT_ID: "1993-036AL", MEAN_MOTION: 15.14345352, INCLINATION: 74.04, ECCENTRICITY: 0.00304059 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33799, OBJECT_ID: "1993-036AQ", MEAN_MOTION: 14.84536664, INCLINATION: 74.03, ECCENTRICITY: 0.00233351 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33818, OBJECT_ID: "1993-036BK", MEAN_MOTION: 15.32475396, INCLINATION: 74.07, ECCENTRICITY: 0.00048374 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33822, OBJECT_ID: "1993-036BP", MEAN_MOTION: 14.14093665, INCLINATION: 74.07, ECCENTRICITY: 0.01503496 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33823, OBJECT_ID: "1993-036BQ", MEAN_MOTION: 13.99347168, INCLINATION: 73.81, ECCENTRICITY: 0.0209337 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33894, OBJECT_ID: "1993-036CX", MEAN_MOTION: 13.21730987, INCLINATION: 73.77, ECCENTRICITY: 0.05698551 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33901, OBJECT_ID: "1993-036DE", MEAN_MOTION: 15.46576241, INCLINATION: 73.76, ECCENTRICITY: 0.0030138 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33914, OBJECT_ID: "1993-036DT", MEAN_MOTION: 13.72207983, INCLINATION: 74.09, ECCENTRICITY: 0.03036213 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 33999, OBJECT_ID: "1993-036GJ", MEAN_MOTION: 14.87569104, INCLINATION: 73.92, ECCENTRICITY: 0.00410879 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 34026, OBJECT_ID: "1993-036HM", MEAN_MOTION: 13.65631845, INCLINATION: 73.77, ECCENTRICITY: 0.03470184 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 34028, OBJECT_ID: "1993-036HP", MEAN_MOTION: 13.2078264, INCLINATION: 73.88, ECCENTRICITY: 0.05462555 },
  { OBJECT_NAME: "COSMOS 2251 DEB", NORAD_CAT_ID: 34036, OBJECT_ID: "1993-036HX", MEAN_MOTION: 15.12971906, INCLINATION: 74.01, ECCENTRICITY: 0.00096422 },
];

// ====================================================================
// FUNÇÕES DE MECÂNICA ORBITAL (DOCUMENTAÇÃO BIG-O)
// ====================================================================

/**
 * Calcula a altitude orbital a partir do Mean Motion (revoluções/dia).
 *
 * Utiliza a Terceira Lei de Kepler para derivar o semi-eixo maior (a)
 * e subtrai o raio da Terra para obter a altitude acima da superfície.
 *
 * Fórmula: a = (μ / (2π × n/86400)²)^(1/3); altitude = a − R_terra
 *
 * Complexidade Temporal: O(1)
 *   Operações matemáticas constantes (exponenciação, divisão, subtração).
 *   Não depende do tamanho da entrada.
 * Complexidade Espacial: O(1)
 *   Nenhuma estrutura auxiliar alocada — apenas variáveis escalares.
 *
 * @param meanMotion - Revoluções por dia do objeto orbital (dado da API CelesTrak)
 * @returns Altitude em quilômetros acima da superfície terrestre, arredondada a 2 casas
 */
function calcularAltitude(meanMotion: number): number {
  const n = meanMotion * 2 * Math.PI / 86400; // rad/s
  const a = Math.pow(MU_EARTH / (n * n), 1 / 3); // semi-eixo maior (km)
  return Math.round((a - R_EARTH) * 100) / 100;
}

/**
 * Busca Binária — Limite Inferior (Lower Bound / bisect_left).
 *
 * Encontra o PRIMEIRO índice no catálogo ordenado cuja altitude é ≥ altitudeMin.
 * Implementação iterativa equivalente ao bisect_left do módulo bisect do Python.
 *
 * PRÉ-CONDIÇÃO: O catálogo DEVE estar ordenado por altitude em ordem crescente.
 * Esta pré-condição é garantida durante o boot do sistema (sorted — O(n log n)).
 *
 * Complexidade Temporal: O(log n)
 *   A cada iteração do loop, o espaço de busca [lo, hi) é reduzido pela metade.
 *   Para n = 1500 objetos, no máximo ceil(log₂(1500)) = 11 comparações.
 * Complexidade Espacial: O(1)
 *   Apenas variáveis de controle (lo, hi, mid) são utilizadas.
 *
 * @param catalog - Lista de detritos ordenada por altitude (crescente)
 * @param altitudeMin - Altitude mínima da faixa de busca (km)
 * @returns Índice do primeiro elemento com altitude ≥ altitudeMin
 */
function buscarLimiteInferior(catalog: DebrisObject[], altitudeMin: number): number {
  let lo = 0;
  let hi = catalog.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (catalog[mid].altitude < altitudeMin) {
      lo = mid + 1; // descarta metade inferior
    } else {
      hi = mid; // mantém metade superior (inclusive mid)
    }
  }
  return lo;
}

/**
 * Busca Binária — Limite Superior (Upper Bound / bisect_right − 1).
 *
 * Encontra o ÚLTIMO índice no catálogo ordenado cuja altitude é ≤ altitudeMax.
 * Implementação iterativa equivalente ao bisect_right(arr, val) − 1 do Python.
 *
 * PRÉ-CONDIÇÃO: Catálogo ordenado por altitude crescente (garantido no boot).
 *
 * Complexidade Temporal: O(log n)
 *   Mesma lógica de bisecção — espaço de busca dividido pela metade a cada passo.
 * Complexidade Espacial: O(1)
 *   Variáveis escalares apenas.
 *
 * @param catalog - Lista de detritos ordenada por altitude (crescente)
 * @param altitudeMax - Altitude máxima da faixa de busca (km)
 * @returns Índice do último elemento com altitude ≤ altitudeMax, ou −1 se nenhum
 */
function buscarLimiteSuperior(catalog: DebrisObject[], altitudeMax: number): number {
  let lo = 0;
  let hi = catalog.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (catalog[mid].altitude <= altitudeMax) {
      lo = mid + 1; // descarta metade inferior (inclusive mid)
    } else {
      hi = mid; // mantém metade superior
    }
  }
  return lo - 1;
}

/**
 * Radar de Zonas Críticas — Busca por faixa de altitude.
 *
 * Combina duas Buscas Binárias (limite inferior e superior) para localizar
 * todos os detritos dentro de uma faixa específica de altitude [altMin, altMax].
 * Retorna um slice eficiente do catálogo ordenado.
 *
 * Complexidade Temporal: O(log n + k)
 *   Onde k é o número de detritos encontrados na faixa.
 *   As duas buscas binárias custam O(log n) cada → O(2 log n) = O(log n).
 *   O slice para extrair os resultados custa O(k).
 * Complexidade Espacial: O(k)
 *   Cria uma nova lista contendo os k resultados encontrados.
 *
 * @param catalog - Lista de detritos ordenada por altitude
 * @param altMin - Limite inferior da faixa de altitude (km)
 * @param altMax - Limite superior da faixa de altitude (km)
 * @returns Lista de detritos com altitude no intervalo [altMin, altMax]
 */
function radarZonaCritica(catalog: DebrisObject[], altMin: number, altMax: number): DebrisObject[] {
  const lower = buscarLimiteInferior(catalog, altMin);
  const upper = buscarLimiteSuperior(catalog, altMax);
  if (lower > upper || lower >= catalog.length) return [];
  return catalog.slice(lower, upper + 1);
}

/**
 * Verificação de Segurança Orbital para Manobra Evasiva (CAM).
 *
 * Avalia o risco de colisão em uma altitude específica verificando
 * a presença de detritos dentro de um raio de segurança configurável.
 *
 * Níveis de risco:
 *   🟢 VERDE:    Nenhum detrito no raio de segurança
 *   🟡 AMARELO:  Detritos detectados, porém a >5km de distância
 *   🔴 VERMELHO: Detritos a <5km — risco crítico de colisão iminente
 *
 * Complexidade Temporal: O(log n + k)
 *   Herda da função radarZonaCritica (2× busca binária + iteração sobre k resultados).
 *   O cálculo de Math.min sobre k elementos adiciona O(k).
 * Complexidade Espacial: O(k)
 *   Armazena os k detritos encontrados no raio para análise.
 *
 * @param catalog - Lista de detritos ordenada por altitude
 * @param altitude - Altitude da posição orbital a verificar (km)
 * @param raio - Raio de segurança em km (padrão: 10 km)
 * @returns Objeto com status (green/yellow/red), número de ameaças e distância mínima
 */
function verificarSeguranca(catalog: DebrisObject[], altitude: number, raio: number = 10): SafetyResult {
  const nearby = radarZonaCritica(catalog, altitude - raio, altitude + raio);
  if (nearby.length === 0) return { status: 'green', threats: 0, nearest: null };

  const nearestDist = Math.min(...nearby.map(d => Math.abs(d.altitude - altitude)));
  if (nearestDist < 5) return { status: 'red', threats: nearby.length, nearest: Math.round(nearestDist * 100) / 100 };
  return { status: 'yellow', threats: nearby.length, nearest: Math.round(nearestDist * 100) / 100 };
}

/**
 * Simulação Recursiva da Síndrome de Kessler (Cascata de Colisões).
 *
 * Simula o efeito em cadeia catastrófico de uma colisão orbital:
 *   1. Busca detritos na zona de impacto (via busca binária)
 *   2. Cada detrito atingido gera 3 novos fragmentos
 *   3. Fragmentos expandem a zona de destruição
 *   4. CHAMA A SI MESMA recursivamente para a próxima geração de impactos
 *   5. Condições de parada: max_geracoes atingido OU nenhum novo detrito atingido
 *
 * Complexidade Temporal: O(g × (log n + k))
 *   Onde g = número de gerações (profundidade máxima da recursão, limitado por maxGen)
 *   e k = número médio de detritos atingidos por geração.
 *   Cada chamada recursiva executa uma busca binária O(log n) + iteração O(k).
 *   No pior caso, g chamadas recursivas são feitas → O(g × (log n + k)).
 * Complexidade Espacial: O(g + total_hits)
 *   A pilha de recursão tem profundidade máxima g.
 *   O Set de IDs atingidos cresce até O(total_hits) ao longo de todas as gerações.
 *   O array de resultados cresce em O(g) (um registro por geração).
 *
 * @param catalog - Lista de detritos ordenada por altitude
 * @param impactAltitude - Altitude do ponto de impacto (km)
 * @param blastRadius - Raio de destruição/explosão (km)
 * @param currentGen - Geração atual da cascata (inicia em 0)
 * @param maxGen - Limite máximo de gerações a simular
 * @param hitIds - Set de NORAD IDs já atingidos (evita contagem dupla entre gerações)
 * @param results - Array acumulador de resultados por geração (passado na recursão)
 * @returns Array com detalhes de cada geração da cascata
 */
function simularCascataKessler(
  catalog: DebrisObject[],
  impactAltitude: number,
  blastRadius: number,
  currentGen: number,
  maxGen: number,
  hitIds: Set<number>,
  results: CascadeGenResult[]
): CascadeGenResult[] {
  // CASO BASE 1: limite de gerações atingido
  if (currentGen > maxGen) return results;

  // Busca detritos na zona de impacto usando busca binária
  const altMin = impactAltitude - blastRadius;
  const altMax = impactAltitude + blastRadius;
  const lower = buscarLimiteInferior(catalog, altMin);
  const upper = buscarLimiteSuperior(catalog, altMax);

  // Filtra objetos já destruídos em gerações anteriores
  const newHits: DebrisObject[] = [];
  for (let i = lower; i <= upper && i < catalog.length; i++) {
    if (!hitIds.has(catalog[i].noradId)) {
      newHits.push(catalog[i]);
      hitIds.add(catalog[i].noradId);
    }
  }

  // CASO BASE 2: nenhum novo detrito atingido — cadeia de colisão interrompida
  if (newHits.length === 0) return results;

  const FRAGMENTS_PER_HIT = 3;
  results.push({
    generation: currentGen,
    impactAltitude: Math.round(impactAltitude * 100) / 100,
    objectsHit: newHits.length,
    objectNames: newHits.slice(0, 5).map(d => d.name),
    fragmentsGenerated: newHits.length * FRAGMENTS_PER_HIT,
  });

  // PASSO RECURSIVO: fragmentos geram novos impactos na próxima geração
  // Novo centro = média ponderada das altitudes atingidas
  // Novo raio = raio anterior × 0.7 (fragmentos menores) + compensação por volume
  const avgAlt = newHits.reduce((sum, h) => sum + h.altitude, 0) / newHits.length;
  const newRadius = blastRadius * 0.7 + newHits.length * 0.3;

  return simularCascataKessler(catalog, avgAlt, newRadius, currentGen + 1, maxGen, hitIds, results);
}

// ====================================================================
// PROCESSAMENTO DE DADOS DA API
// ====================================================================

function processarDadosBrutos(rawData: any[]): DebrisObject[] {
  return rawData
    .filter((obj: any) => obj.MEAN_MOTION && obj.MEAN_MOTION > 0)
    .map((obj: any) => ({
      noradId: obj.NORAD_CAT_ID,
      name: obj.OBJECT_NAME,
      objectId: obj.OBJECT_ID,
      altitude: calcularAltitude(obj.MEAN_MOTION),
      inclination: obj.INCLINATION,
      eccentricity: obj.ECCENTRICITY,
    }))
    .sort((a: DebrisObject, b: DebrisObject) => a.altitude - b.altitude); // O(n log n) — TimSort
}

function calcularEstatisticas(catalog: DebrisObject[]): CatalogStats {
  if (catalog.length === 0) return { total: 0, altMin: 0, altMax: 0, leoLow: 0, leoMid: 0, leoHigh: 0 };
  return {
    total: catalog.length,
    altMin: catalog[0].altitude,
    altMax: catalog[catalog.length - 1].altitude,
    leoLow: catalog.filter(d => d.altitude < 400).length,
    leoMid: catalog.filter(d => d.altitude >= 400 && d.altitude <= 800).length,
    leoHigh: catalog.filter(d => d.altitude > 800).length,
  };
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export default function PythonAgentSection() {
  // ---- Estado: Dados ----
  const [catalog, setCatalog] = useState<DebrisObject[]>([]);
  const [stats, setStats] = useState<CatalogStats>({ total: 0, altMin: 0, altMax: 0, leoLow: 0, leoMid: 0, leoHigh: 0 });
  const [isBooting, setIsBooting] = useState(true);

  // ---- Estado: Logs do Terminal ----
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // ---- Estado: Radar de Zonas (Card 2) ----
  const [radarMin, setRadarMin] = useState('');
  const [radarMax, setRadarMax] = useState('');

  // ---- Estado: Manobra Evasiva CAM (Card 3) ----
  const [maneuverStack, setManeuverStack] = useState<{ altitude: number; safety: SafetyResult }[]>([]);
  const [proposedAlt, setProposedAlt] = useState('');

  // ---- Estado: Síndrome de Kessler (Card 4) ----
  const [kesslerAlt, setKesslerAlt] = useState('');
  const [kesslerRadius, setKesslerRadius] = useState('15');
  const [kesslerMaxGen, setKesslerMaxGen] = useState('3');

  // ---- Estado: Dados exibidos no terminal ----
  const [terminalView, setTerminalView] = useState<'none' | 'status' | 'radar' | 'cam' | 'kessler'>('none');
  const [terminalTableData, setTerminalTableData] = useState<any>(null);

  // ---- Refs ----
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll dos logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // ---- Funções auxiliares ----
  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
  };

  // ==============================
  // BOOT DO SISTEMA (FASE 1)
  // ==============================
  useEffect(() => {
    let ignore = false;

    const boot = async () => {
      // Limpa logs anteriores em caso de remount do React StrictMode
      if (!ignore) {
        setLogs([{ time: new Date().toLocaleTimeString(), text: '[BOOT] Inicializando Kessler Vision v2.0...', type: 'boot' }]);
      }

      let rawData: any[] | null = null;
      let usedFallback = false;

      if (!ignore) {
        setTimeout(() => {
          if (!ignore) addLog('[BOOT] Conectando à base CelesTrak (Cosmos 2251 DEB)...', 'boot');
        }, 400);
      }

      try {
        await new Promise(r => setTimeout(r, 600));
        const response = await fetch(CELESTRAK_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('json')) throw new Error('Resposta não é JSON');
        rawData = await response.json();
        if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('Dados vazios');
      } catch {
        usedFallback = true;
        rawData = FALLBACK_RAW;
      }

      if (ignore) return;

      const processed = processarDadosBrutos(rawData!);
      const catalogStats = calcularEstatisticas(processed);

      const baseDelay = 1000;
      
      setTimeout(() => {
        if (ignore) return;
        if (usedFallback) {
          addLog('[WARN] API indisponível. Usando cache local de demonstração.', 'warn');
        } else {
          addLog(`[BOOT] ${processed.length} objetos recebidos via API`, 'boot');
        }
      }, baseDelay);

      setTimeout(() => {
        if (ignore) return;
        addLog('[BOOT] Calculando altitudes via fórmula Kepleriana — O(1) por objeto', 'boot');
      }, baseDelay + 400);

      setTimeout(() => {
        if (ignore) return;
        addLog(`[BOOT] Catálogo ordenado por altitude — O(n log n) TimSort`, 'boot');
      }, baseDelay + 800);

      setTimeout(() => {
        if (ignore) return;
        addLog(`[BOOT] Faixa: ${catalogStats.altMin} km — ${catalogStats.altMax} km`, 'boot');
      }, baseDelay + 1200);

      setTimeout(() => {
        if (ignore) return;
        addLog('[SYS] Sistema operacional. Aguardando comandos do operador.', 'system');
      }, baseDelay + 1600);

      setTimeout(() => {
        if (ignore) return;
        setCatalog(processed);
        setStats(catalogStats);
        setIsBooting(false);
      }, baseDelay + 1800);
    };

    boot();

    return () => {
      ignore = true;
    };
  }, []);

  // ==============================
  // HANDLERS DOS CARDS
  // ==============================

  const handleShowStatus = () => {
    if (catalog.length === 0) return;
    addLog(`[STATUS] Catálogo: ${stats.total} objetos | ${stats.altMin}km — ${stats.altMax}km`, 'ok');
    addLog(`[STATUS] LEO Baixo (<400km): ${stats.leoLow} | Médio (400–800km): ${stats.leoMid} | Alto (>800km): ${stats.leoHigh}`, 'info');
    setTerminalView('status');
    setTerminalTableData(stats);
  };

  const handleRadarScan = () => {
    const min = parseFloat(radarMin);
    const max = parseFloat(radarMax);
    if (isNaN(min) || isNaN(max) || min >= max) {
      addLog('[ERRO] Faixa de altitude inválida. Min deve ser < Max.', 'error');
      return;
    }
    addLog(`[RADAR] Escaneando zona ${min}km — ${max}km (Busca Binária O(log n))...`, 'info');
    const results = radarZonaCritica(catalog, min, max);
    if (results.length === 0) {
      addLog(`[RADAR] Zona limpa. Nenhum detrito detectado na faixa.`, 'ok');
    } else {
      addLog(`[RADAR] ⚠ ${results.length} detritos detectados na zona de risco!`, 'warn');
    }
    setTerminalView('radar');
    setTerminalTableData(results);
  };

  const handleCamPush = () => {
    const alt = parseFloat(proposedAlt);
    if (isNaN(alt) || alt <= 0) {
      addLog('[ERRO] Altitude inválida para manobra.', 'error');
      return;
    }
    const safety = verificarSeguranca(catalog, alt);
    const newEntry = { altitude: alt, safety };
    setManeuverStack(prev => [...prev, newEntry]);
    setProposedAlt('');

    const statusLabel = safety.status === 'green' ? '🟢 SEGURO' : safety.status === 'yellow' ? '🟡 ATENÇÃO' : '🔴 PERIGO';
    addLog(`[CAM] PUSH → ${alt} km | Status: ${statusLabel} | Ameaças: ${safety.threats}`, safety.status === 'red' ? 'warn' : 'ok');

    if (safety.nearest !== null) {
      addLog(`[CAM] Detrito mais próximo a ${safety.nearest} km de distância`, 'info');
    }

    setTerminalView('cam');
    setTerminalTableData([...maneuverStack, newEntry]);
  };

  const handleCamPop = () => {
    if (maneuverStack.length === 0) {
      addLog('[WARN] Pilha CAM vazia. Nenhuma manobra para desfazer.', 'warn');
      return;
    }
    const removed = maneuverStack[maneuverStack.length - 1];
    const newStack = maneuverStack.slice(0, -1);
    setManeuverStack(newStack);

    addLog(`[UNDO] POP ← ${removed.altitude} km removido da pilha. Manobra desfeita.`, 'ok');
    if (newStack.length > 0) {
      const current = newStack[newStack.length - 1];
      addLog(`[CAM] Posição restaurada: ${current.altitude} km`, 'info');
    } else {
      addLog('[CAM] Pilha vazia. Nenhuma posição ativa.', 'info');
    }

    setTerminalView('cam');
    setTerminalTableData(newStack);
  };

  const handleKesslerSimulation = () => {
    const alt = parseFloat(kesslerAlt);
    const radius = parseFloat(kesslerRadius);
    const maxGen = parseInt(kesslerMaxGen);
    if (isNaN(alt) || isNaN(radius) || isNaN(maxGen) || radius <= 0 || maxGen <= 0) {
      addLog('[ERRO] Parâmetros inválidos para simulação.', 'error');
      return;
    }

    addLog(`[KESSLER] Simulação recursiva iniciada — Alt: ${alt}km, Raio: ${radius}km, Max Gen: ${maxGen}`, 'warn');

    const hitIds = new Set<number>();
    const results: CascadeGenResult[] = [];
    simularCascataKessler(catalog, alt, radius, 0, maxGen - 1, hitIds, results);

    if (results.length === 0) {
      addLog('[KESSLER] Nenhum detrito na zona de impacto. Cascata não iniciada.', 'ok');
    } else {
      const totalHits = results.reduce((s, r) => s + r.objectsHit, 0);
      const totalFrags = results.reduce((s, r) => s + r.fragmentsGenerated, 0);
      addLog(`[ALERTA] Cascata de ${results.length} gerações: ${totalHits} objetos destruídos → ${totalFrags} novos fragmentos!`, 'error');
    }

    setTerminalView('kessler');
    setTerminalTableData(results);
  };

  // ==============================
  // FORMATAÇÃO DE LOGS
  // ==============================
  const formatLogText = (entry: LogEntry) => {
    const colorMap: Record<string, string> = {
      boot: 'text-blue-400',
      system: 'text-emerald-400',
      ok: 'text-emerald-400',
      warn: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-zinc-300',
    };
    return <span className={colorMap[entry.type] || 'text-zinc-300'}>{entry.text}</span>;
  };

  // ==============================
  // RENDER
  // ==============================
  const safetyColors: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const currentCamTop = maneuverStack.length > 0 ? maneuverStack[maneuverStack.length - 1] : null;

  return (
    <section id="python-agent" className="relative w-full bg-[#050505] pt-24 pb-48 border-t border-white/5 z-10">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Controle total pelo seu terminal.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Algoritmos O(log n), pilhas e recursão processando dados orbitais reais da CelesTrak. Monitoramento de colisões na Órbita Terrestre Baixa, direto no seu navegador.
          </p>
        </motion.div>

        {/* GRID ASSIMÉTRICO */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 xl:gap-12 items-start">

          {/* ================================ */}
          {/* LADO ESQUERDO: 4 CARDS VERTICAIS */}
          {/* ================================ */}
          <div className="flex flex-col gap-4">

            {/* CARD 1 — STATUS DO CATÁLOGO (BRANCO) */}
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-xl relative group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-black text-xl mb-1">Status do Catálogo</h3>
                  <p className="text-zinc-600 text-sm">Dados orbitais CelesTrak em tempo real.</p>
                </div>
                <Database className="w-5 h-5 text-zinc-400" />
              </div>
              {isBooting ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span className="text-sm text-zinc-500">Carregando dados orbitais...</span>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-black font-mono">{stats.total.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-1">{stats.altMin} km — {stats.altMax} km</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'LEO Baixo (<400km)', count: stats.leoLow, color: 'bg-emerald-500' },
                      { label: 'LEO Médio (400–800km)', count: stats.leoMid, color: 'bg-yellow-500' },
                      { label: 'LEO Alto (>800km)', count: stats.leoHigh, color: 'bg-red-500' },
                    ].map(b => (
                      <div key={b.label}>
                        <div className="flex justify-between text-xs text-zinc-600 mb-1">
                          <span>{b.label}</span>
                          <span className="font-mono">{b.count}</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div className={`h-full ${b.color} rounded-full transition-all duration-1000`} style={{ width: `${(b.count / stats.total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleShowStatus} className="w-full bg-black/5 hover:bg-black/10 text-black py-2.5 rounded-xl transition-colors text-sm font-medium">
                    Ver detalhes no terminal
                  </button>
                </>
              )}
            </div>

            {/* CARD 2 — RADAR DE ZONAS (DARK) */}
            <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] relative group hover:bg-[#111] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1">Radar de Zonas</h3>
                  <p className="text-zinc-500 text-sm">Busca Binária O(log n + k)</p>
                </div>
                <Radar className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-2 gap-3 w-full">
                  <input type="number" value={radarMin} onChange={e => setRadarMin(e.target.value)} placeholder="Alt. mín (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                  <input type="number" value={radarMax} onChange={e => setRadarMax(e.target.value)} placeholder="Alt. máx (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                </div>
                <button onClick={handleRadarScan} disabled={isBooting} className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-40 py-3 rounded-xl transition-colors font-semibold text-sm">
                  <Search className="w-4 h-4" /> Escanear Zona
                </button>
              </div>
            </div>

            {/* CARD 3 — MANOBRA EVASIVA CAM (DARK) */}
            <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] relative group hover:bg-[#111] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1">Manobra Evasiva</h3>
                  <p className="text-zinc-500 text-sm">Pilha CAM — LIFO O(1)</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentCamTop && (
                    <span className={`w-2.5 h-2.5 rounded-full ${safetyColors[currentCamTop.safety.status]} animate-pulse`} />
                  )}
                  <span className="bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-1 rounded-full text-xs font-mono">{maneuverStack.length}</span>
                </div>
              </div>
              <div className="space-y-3 w-full">
                <input type="number" value={proposedAlt} onChange={e => setProposedAlt(e.target.value)} placeholder="Altitude proposta (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleCamPush} disabled={isBooting} className="flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-40 py-3 rounded-xl transition-colors font-semibold text-sm">
                    <ArrowUp className="w-4 h-4" /> PUSH
                  </button>
                  <button onClick={handleCamPop} disabled={isBooting || maneuverStack.length === 0} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-40 py-3 rounded-xl transition-colors font-semibold text-sm">
                    <ArrowDown className="w-4 h-4" /> POP
                  </button>
                </div>
                {currentCamTop && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${
                    currentCamTop.safety.status === 'green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    currentCamTop.safety.status === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${safetyColors[currentCamTop.safety.status]}`} />
                    {currentCamTop.safety.status === 'green' ? 'SEGURO' : currentCamTop.safety.status === 'yellow' ? 'ATENÇÃO' : 'PERIGO'}
                    {currentCamTop.safety.threats > 0 && <span className="ml-auto">{currentCamTop.safety.threats} ameaças | {currentCamTop.safety.nearest}km</span>}
                  </div>
                )}
              </div>
            </div>

            {/* CARD 4 — SÍNDROME DE KESSLER (DARK) */}
            <div className="bg-[#0A0A0A] border border-[#222] p-6 md:p-8 rounded-[1.5rem] relative group hover:bg-[#111] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-xl mb-1">Síndrome de Kessler</h3>
                  <p className="text-zinc-500 text-sm">Simulação recursiva O(g × (log n + k))</p>
                </div>
                <Zap className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="space-y-3 w-full">
                <input type="number" value={kesslerAlt} onChange={e => setKesslerAlt(e.target.value)} placeholder="Alt. impacto (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                <div className="grid grid-cols-2 gap-3 w-full">
                  <input type="number" value={kesslerRadius} onChange={e => setKesslerRadius(e.target.value)} placeholder="Raio (km)" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                  <input type="number" value={kesslerMaxGen} onChange={e => setKesslerMaxGen(e.target.value)} placeholder="Gerações" className="bg-[#111] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-white/20 text-white placeholder:text-zinc-600 font-mono text-sm w-full" disabled={isBooting} />
                </div>
                <button onClick={handleKesslerSimulation} disabled={isBooting} className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-white/20 disabled:opacity-40 py-3 rounded-xl transition-colors font-semibold text-sm">
                  <Zap className="w-4 h-4" /> Simular Cascata
                </button>
              </div>
            </div>

          </div>

          {/* ======================================= */}
          {/* LADO DIREITO: JANELA DE TERMINAL GIGANTE */}
          {/* ======================================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full bg-[#0E0E0E] border border-[#222] rounded-[1.5rem] overflow-hidden shadow-2xl flex flex-col sticky top-8 h-[calc(100vh-4rem)] min-h-[600px]"
          >
            {/* TERMINAL HEADER */}
            <div className="bg-[#151515] px-6 py-4 border-b border-[#222] flex items-center justify-between flex-wrap gap-2">
              <div className="text-zinc-400 font-mono text-sm tracking-wide">KESSLER_VISION.py</div>
              <div className="flex gap-2 text-xs font-mono flex-wrap">
                <span className="bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full">Catálogo: {stats.total}</span>
                <span className="bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full">Pilha CAM: {maneuverStack.length}</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">SORTED_ALT</span>
              </div>
            </div>

            <div ref={logContainerRef} className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">

              {/* LOGS */}
              <div className="mb-8">
                <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">Output Log</h4>
                <div className="font-mono text-[13px] sm:text-sm space-y-2.5">
                  {logs.slice(-10).map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      <span className="text-zinc-600">[{log.time}]</span> {formatLogText(log)}
                    </div>
                  ))}
                  {isBooting && (
                    <div className="leading-relaxed">
                      <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-blue-400 animate-pulse"> █</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-[#222] mb-8" />

              {/* ÁREA DE RESULTADOS CONTEXTUAIS */}
              <div className="flex-1">

                {/* STATUS */}
                {terminalView === 'status' && terminalTableData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">Resumo do Catálogo</h4>
                    <div className="font-mono text-sm space-y-3 text-zinc-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151515] p-4 rounded-xl border border-[#222]">
                          <div className="text-xs text-zinc-500 mb-1">Total de Objetos</div>
                          <div className="text-2xl font-bold text-white">{(terminalTableData as CatalogStats).total.toLocaleString()}</div>
                        </div>
                        <div className="bg-[#151515] p-4 rounded-xl border border-[#222]">
                          <div className="text-xs text-zinc-500 mb-1">Faixa de Altitude</div>
                          <div className="text-lg font-bold text-white">{(terminalTableData as CatalogStats).altMin} — {(terminalTableData as CatalogStats).altMax} <span className="text-xs text-zinc-500">km</span></div>
                        </div>
                      </div>
                      <div className="bg-[#151515] p-4 rounded-xl border border-[#222] space-y-2">
                        <div className="text-xs text-zinc-500 mb-2">Distribuição por Faixa</div>
                        <div className="flex justify-between"><span className="text-emerald-400">LEO Baixo (&lt;400km)</span><span>{(terminalTableData as CatalogStats).leoLow}</span></div>
                        <div className="flex justify-between"><span className="text-yellow-400">LEO Médio (400–800km)</span><span>{(terminalTableData as CatalogStats).leoMid}</span></div>
                        <div className="flex justify-between"><span className="text-red-400">LEO Alto (&gt;800km)</span><span>{(terminalTableData as CatalogStats).leoHigh}</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* RADAR RESULTS */}
                {terminalView === 'radar' && terminalTableData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">
                      Detritos Detectados ({(terminalTableData as DebrisObject[]).length})
                    </h4>
                    {(terminalTableData as DebrisObject[]).length === 0 ? (
                      <div className="text-emerald-400 font-mono text-sm py-8 text-center">✓ Zona limpa — nenhum detrito encontrado</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="text-xs text-zinc-500 uppercase">
                            <tr>
                              <th className="pb-4 font-medium tracking-wider">NORAD ID</th>
                              <th className="pb-4 font-medium tracking-wider">Identificação</th>
                              <th className="pb-4 font-medium tracking-wider text-right">Altitude</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#222]">
                            <AnimatePresence>
                              {(terminalTableData as DebrisObject[]).slice(0, 30).map(obj => (
                                <motion.tr
                                  key={obj.noradId}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="hover:bg-[#151515] transition-colors group"
                                >
                                  <td className="py-3 font-mono text-zinc-400 group-hover:text-white transition-colors">{obj.noradId}</td>
                                  <td className="py-3 text-zinc-300 pr-8">{obj.name}</td>
                                  <td className="py-3 text-right font-mono text-emerald-400/80 group-hover:text-emerald-400 transition-colors">{obj.altitude} km</td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                        {(terminalTableData as DebrisObject[]).length > 30 && (
                          <div className="text-xs text-zinc-600 font-mono mt-3 text-center">... e mais {(terminalTableData as DebrisObject[]).length - 30} objetos</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* CAM STACK */}
                {terminalView === 'cam' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">
                      Pilha de Manobras — LIFO ({(terminalTableData as any[] || []).length})
                    </h4>
                    {(!terminalTableData || (terminalTableData as any[]).length === 0) ? (
                      <div className="text-zinc-500 font-mono text-sm py-8 text-center">Pilha vazia — nenhuma manobra registrada</div>
                    ) : (
                      <div className="space-y-2 font-mono text-sm">
                        {[...(terminalTableData as any[])].reverse().map((entry, i) => (
                          <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                            i === 0 ? 'border-white/10 bg-white/5' : 'border-[#222] bg-[#111]'
                          }`}>
                            <div className="flex items-center gap-3">
                              {i === 0 && <span className="text-xs text-zinc-500 uppercase">▶ TOPO</span>}
                              {i > 0 && i === (terminalTableData as any[]).length - 1 && <span className="text-xs text-zinc-600 uppercase">  BASE</span>}
                              {i > 0 && i < (terminalTableData as any[]).length - 1 && <span className="text-xs text-zinc-700 uppercase">      </span>}
                              <span className="text-white">{entry.altitude} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${safetyColors[entry.safety.status]}`} />
                              <span className={
                                entry.safety.status === 'green' ? 'text-emerald-400' :
                                entry.safety.status === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                              }>
                                {entry.safety.status === 'green' ? 'SAFE' : entry.safety.status === 'yellow' ? 'WARN' : 'RISK'}
                              </span>
                              <span className="text-zinc-600">{entry.safety.threats} threats</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* KESSLER CASCADE */}
                {terminalView === 'kessler' && terminalTableData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h4 className="text-zinc-600 text-xs font-bold uppercase tracking-widest mb-4">
                      Relatório de Cascata Kessler
                    </h4>
                    {(terminalTableData as CascadeGenResult[]).length === 0 ? (
                      <div className="text-emerald-400 font-mono text-sm py-8 text-center">✓ Nenhuma cascata — zona de impacto limpa</div>
                    ) : (
                      <>
                        <div className="space-y-3 font-mono text-sm mb-6">
                          {(terminalTableData as CascadeGenResult[]).map(gen => (
                            <div key={gen.generation} className="bg-[#151515] border border-[#222] rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-yellow-400 font-bold">Geração {gen.generation}</span>
                                <span className="text-zinc-500 text-xs">Alt: {gen.impactAltitude} km</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-zinc-500">Objetos atingidos:</span>
                                  <span className="text-red-400 ml-2 font-bold">{gen.objectsHit}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Fragmentos gerados:</span>
                                  <span className="text-yellow-400 ml-2 font-bold">{gen.fragmentsGenerated}</span>
                                </div>
                              </div>
                              {gen.objectNames.length > 0 && (
                                <div className="mt-2 text-xs text-zinc-600 truncate">
                                  {gen.objectNames.join(', ')}{gen.objectsHit > 5 ? ` (+${gen.objectsHit - 5})` : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Sumário da cascata */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 font-mono text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-bold uppercase">Resultado da Cascata</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-zinc-500">Gerações</div>
                              <div className="text-white text-lg font-bold">{(terminalTableData as CascadeGenResult[]).length}</div>
                            </div>
                            <div>
                              <div className="text-zinc-500">Destruídos</div>
                              <div className="text-red-400 text-lg font-bold">{(terminalTableData as CascadeGenResult[]).reduce((s, r) => s + r.objectsHit, 0)}</div>
                            </div>
                            <div>
                              <div className="text-zinc-500">Novos Fragmentos</div>
                              <div className="text-yellow-400 text-lg font-bold">{(terminalTableData as CascadeGenResult[]).reduce((s, r) => s + r.fragmentsGenerated, 0)}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ESTADO INICIAL */}
                {terminalView === 'none' && !isBooting && (
                  <div className="text-zinc-600 font-mono text-sm py-12 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                    Aguardando comando do operador...
                    <div className="text-xs mt-2 text-zinc-700">Use os painéis à esquerda para interagir com o catálogo</div>
                  </div>
                )}
              </div>
            </div>

            {/* TERMINAL FOOTER */}
            <div className="bg-[#111] px-6 py-4 border-t border-[#222] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isBooting ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                {isBooting ? 'Inicializando...' : 'O(log n) Ready'}
              </div>
              <div>Kessler Vision v2.0</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
