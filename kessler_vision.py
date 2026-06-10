#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Kessler Vision v2.0 — Simulador Tático de Monitoramento de Lixo Espacial (LEO)

Referência acadêmica: este arquivo espelha a lógica implementada no componente
web React (PythonAgentSection.tsx). Pode ser executado standalone via CLI.

Estruturas obrigatórias implementadas:
  - Busca Binária (O(log n)) — Radar de Zonas de Altitude
  - Pilhas / Stacks (LIFO) — Manobras Evasivas (CAM)
  - Recursão — Simulação da Síndrome de Kessler (cascata de colisões)
  - Documentação Big-O — Docstrings estilo Google em 6+ funções

Fonte de dados: API pública CelesTrak (Cosmos 2251 Debris)
  Endpoint: https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=JSON
"""

import math
import json
from fastapi import FastAPI  
import uvicorn               

try:
    import requests
    _HAS_REQUESTS = True
except ImportError:
    import urllib.request
    _HAS_REQUESTS = False


# ====================================================================
# CONSTANTES ORBITAIS
# ====================================================================

MU_EARTH = 398600.4418   # km³/s² — Parâmetro gravitacional padrão da Terra
R_EARTH = 6378.137       # km — Raio equatorial médio da Terra
CELESTRAK_URL = (
    "https://celestrak.org/NORAD/elements/gp.php"
    "?GROUP=cosmos-2251-debris&FORMAT=JSON"
)

# Dados de fallback quando a API está indisponível (20 objetos representativos)
FALLBACK_RAW = [
    {"OBJECT_NAME": "COSMOS 2251", "NORAD_CAT_ID": 22675, "OBJECT_ID": "1993-036A", "MEAN_MOTION": 14.33253459, "INCLINATION": 74.04, "ECCENTRICITY": 0.00240798},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33757, "OBJECT_ID": "1993-036E", "MEAN_MOTION": 14.32623198, "INCLINATION": 74.04, "ECCENTRICITY": 0.00150992},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33758, "OBJECT_ID": "1993-036F", "MEAN_MOTION": 14.52788917, "INCLINATION": 74.03, "ECCENTRICITY": 0.00168817},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33765, "OBJECT_ID": "1993-036N", "MEAN_MOTION": 15.2306418, "INCLINATION": 74.0, "ECCENTRICITY": 0.0054993},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33768, "OBJECT_ID": "1993-036R", "MEAN_MOTION": 13.58616372, "INCLINATION": 74.07, "ECCENTRICITY": 0.03671204},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33779, "OBJECT_ID": "1993-036U", "MEAN_MOTION": 14.74407417, "INCLINATION": 74.04, "ECCENTRICITY": 0.00134846},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33789, "OBJECT_ID": "1993-036AE", "MEAN_MOTION": 13.8902994, "INCLINATION": 74.06, "ECCENTRICITY": 0.02407166},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33792, "OBJECT_ID": "1993-036AH", "MEAN_MOTION": 13.46135641, "INCLINATION": 73.9, "ECCENTRICITY": 0.04298013},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33795, "OBJECT_ID": "1993-036AL", "MEAN_MOTION": 15.14345352, "INCLINATION": 74.04, "ECCENTRICITY": 0.00304059},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33799, "OBJECT_ID": "1993-036AQ", "MEAN_MOTION": 14.84536664, "INCLINATION": 74.03, "ECCENTRICITY": 0.00233351},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33818, "OBJECT_ID": "1993-036BK", "MEAN_MOTION": 15.32475396, "INCLINATION": 74.07, "ECCENTRICITY": 0.00048374},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33822, "OBJECT_ID": "1993-036BP", "MEAN_MOTION": 14.14093665, "INCLINATION": 74.07, "ECCENTRICITY": 0.01503496},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33823, "OBJECT_ID": "1993-036BQ", "MEAN_MOTION": 13.99347168, "INCLINATION": 73.81, "ECCENTRICITY": 0.0209337},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33894, "OBJECT_ID": "1993-036CX", "MEAN_MOTION": 13.21730987, "INCLINATION": 73.77, "ECCENTRICITY": 0.05698551},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33901, "OBJECT_ID": "1993-036DE", "MEAN_MOTION": 15.46576241, "INCLINATION": 73.76, "ECCENTRICITY": 0.0030138},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33914, "OBJECT_ID": "1993-036DT", "MEAN_MOTION": 13.72207983, "INCLINATION": 74.09, "ECCENTRICITY": 0.03036213},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 33999, "OBJECT_ID": "1993-036GJ", "MEAN_MOTION": 14.87569104, "INCLINATION": 73.92, "ECCENTRICITY": 0.00410879},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 34026, "OBJECT_ID": "1993-036HM", "MEAN_MOTION": 13.65631845, "INCLINATION": 73.77, "ECCENTRICITY": 0.03470184},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 34028, "OBJECT_ID": "1993-036HP", "MEAN_MOTION": 13.2078264, "INCLINATION": 73.88, "ECCENTRICITY": 0.05462555},
    {"OBJECT_NAME": "COSMOS 2251 DEB", "NORAD_CAT_ID": 34036, "OBJECT_ID": "1993-036HX", "MEAN_MOTION": 15.12971906, "INCLINATION": 74.01, "ECCENTRICITY": 0.00096422},
]


# ====================================================================
# FUNÇÕES DE MECÂNICA ORBITAL
# ====================================================================

def calcular_altitude(mean_motion):
    """Calcula a altitude orbital a partir do Mean Motion (revoluções/dia).

    Utiliza a Terceira Lei de Kepler para derivar o semi-eixo maior (a)
    e subtrai o raio da Terra para obter a altitude acima da superfície.

    Fórmula:
        a = (μ / (2π × n/86400)²)^(1/3)
        altitude = a − R_terra

    Complexidade Temporal: O(1)
        Operações matemáticas constantes (exponenciação, divisão, subtração).
        Não depende do tamanho de nenhuma entrada.
    Complexidade Espacial: O(1)
        Nenhuma estrutura de dados auxiliar é alocada.

    Args:
        mean_motion: Revoluções por dia do objeto orbital (dado CelesTrak).

    Returns:
        Altitude em quilômetros acima da superfície terrestre, arredondada
        a 2 casas decimais.
    """
    n = mean_motion * 2 * math.pi / 86400  # rad/s
    a = (MU_EARTH / (n ** 2)) ** (1 / 3)    # semi-eixo maior (km)
    return round(a - R_EARTH, 2)


# ====================================================================
# CARGA DE DADOS (FASE 1 — BOOT DO SISTEMA)
# ====================================================================

def carregar_catalogo():
    """Carrega e ordena o catálogo de detritos a partir da API CelesTrak.

    Fluxo:
        1. Faz uma requisição GET para a API CelesTrak (Cosmos 2251 Debris).
        2. Converte o payload JSON em lista de dicionários Python.
        3. Calcula a altitude de cada objeto via ``calcular_altitude()``.
        4. ORDENA a lista por altitude (crescente) — Regra de Ouro da Performance.
           Esta ordenação ocorre APENAS UMA VEZ durante o boot, preparando
           o catálogo para buscas binárias O(log n) subsequentes.
        5. Em caso de falha na API, utiliza dados de fallback locais.

    Complexidade Temporal: O(n log n)
        Dominada pelo ``sorted()``, que usa TimSort internamente.
        O processamento dos n objetos (map + filter) custa O(n).
        A requisição HTTP é O(1) em termos algorítmicos.
    Complexidade Espacial: O(n)
        Armazena n objetos processados em uma nova lista.

    Returns:
        Lista de dicionários ordenada por altitude, cada um contendo:
        ``norad_id``, ``nome``, ``object_id``, ``altitude``, ``inclinacao``,
        ``excentricidade``.
    """
    raw_data = None

    print("[BOOT] Conectando à base CelesTrak (Cosmos 2251 DEB)...")

    try:
        if _HAS_REQUESTS:
            response = requests.get(CELESTRAK_URL, timeout=15)
            response.raise_for_status()
            raw_data = response.json()
        else:
            with urllib.request.urlopen(CELESTRAK_URL, timeout=15) as resp:
                raw_data = json.loads(resp.read().decode())

        if not isinstance(raw_data, list) or len(raw_data) == 0:
            raise ValueError("Dados vazios ou formato inválido")

    except Exception as e:
        print(f"[WARN] API indisponível ({e}). Usando cache local.")
        raw_data = FALLBACK_RAW

    # Processamento: converte dados brutos para formato interno
    catalogo = []
    for obj in raw_data:
        mm = obj.get("MEAN_MOTION", 0)
        if mm <= 0:
            continue
        catalogo.append({
            "norad_id": obj.get("NORAD_CAT_ID", 0),
            "nome": obj.get("OBJECT_NAME", "DESCONHECIDO"),
            "object_id": obj.get("OBJECT_ID", "N/A"),
            "altitude": calcular_altitude(mm),
            "inclinacao": obj.get("INCLINATION", 0),
            "excentricidade": obj.get("ECCENTRICITY", 0),
        })

    # ORDENAÇÃO POR ALTITUDE — O(n log n) via TimSort
    # Esta é a "Regra de Ouro da Performance": ordena UMA VEZ no boot
    # para habilitar Busca Binária O(log n) em todas as consultas.
    catalogo.sort(key=lambda x: x["altitude"])

    print(f"[BOOT] {len(catalogo)} objetos carregados e ordenados por altitude")
    if catalogo:
        print(f"[BOOT] Faixa: {catalogo[0]['altitude']} km — {catalogo[-1]['altitude']} km")
    print("[SYS] Sistema operacional. Aguardando comandos.\n")

    return catalogo


# ====================================================================
# RADAR DE ZONAS CRÍTICAS (BUSCA BINÁRIA)
# ====================================================================

def busca_binaria_limite_inferior(catalogo, altitude_min):
    """Busca Binária — Limite Inferior (Lower Bound / bisect_left).

    Encontra o PRIMEIRO índice no catálogo ordenado cuja altitude é ≥ altitude_min.
    Equivalente ao ``bisect.bisect_left()`` do Python.

    PRÉ-CONDIÇÃO: O catálogo DEVE estar ordenado por altitude em ordem crescente.
    Esta pré-condição é garantida durante o boot do sistema (``carregar_catalogo()``).

    Complexidade Temporal: O(log n)
        A cada iteração do loop, o espaço de busca [lo, hi) é reduzido pela metade.
        Para n = 1500 objetos, no máximo ceil(log₂(1500)) ≈ 11 comparações são
        necessárias — extremamente eficiente comparado a uma varredura linear O(n).
    Complexidade Espacial: O(1)
        Apenas variáveis escalares de controle (lo, hi, mid) são utilizadas.
        Nenhuma lista ou estrutura auxiliar é alocada.

    Args:
        catalogo: Lista de dicts ordenada por altitude (crescente).
        altitude_min: Altitude mínima da faixa de busca (km).

    Returns:
        Índice do primeiro elemento com altitude ≥ altitude_min.
        Retorna len(catalogo) se todos os elementos têm altitude < altitude_min.
    """
    lo, hi = 0, len(catalogo)
    while lo < hi:
        mid = (lo + hi) // 2
        if catalogo[mid]["altitude"] < altitude_min:
            lo = mid + 1   # descarta metade inferior
        else:
            hi = mid        # mantém metade superior (inclusive mid)
    return lo


def busca_binaria_limite_superior(catalogo, altitude_max):
    """Busca Binária — Limite Superior (Upper Bound / bisect_right − 1).

    Encontra o ÚLTIMO índice no catálogo ordenado cuja altitude é ≤ altitude_max.
    Equivalente a ``bisect.bisect_right(arr, val) − 1`` do Python.

    PRÉ-CONDIÇÃO: Catálogo ordenado por altitude crescente (garantido no boot).

    Complexidade Temporal: O(log n)
        Mesma lógica de bisecção — espaço de busca dividido pela metade a cada passo.
        Custo idêntico ao limite inferior: ceil(log₂(n)) comparações no pior caso.
    Complexidade Espacial: O(1)
        Variáveis escalares apenas (lo, hi, mid).

    Args:
        catalogo: Lista de dicts ordenada por altitude (crescente).
        altitude_max: Altitude máxima da faixa de busca (km).

    Returns:
        Índice do último elemento com altitude ≤ altitude_max.
        Retorna −1 se todos os elementos têm altitude > altitude_max.
    """
    lo, hi = 0, len(catalogo)
    while lo < hi:
        mid = (lo + hi) // 2
        if catalogo[mid]["altitude"] <= altitude_max:
            lo = mid + 1   # descarta metade inferior (inclusive mid)
        else:
            hi = mid        # mantém metade superior
    return lo - 1


def radar_zona_critica(catalogo, alt_min, alt_max):
    """Radar de Zonas Críticas — Busca por faixa de altitude.

    Combina duas Buscas Binárias (limite inferior e superior) para localizar
    todos os detritos dentro de uma faixa específica de altitude [alt_min, alt_max].
    Retorna um slice eficiente do catálogo ordenado.

    Complexidade Temporal: O(log n + k)
        Onde k é o número de detritos encontrados na faixa.
        As duas buscas binárias custam O(log n) cada → O(2 log n) = O(log n).
        O slice ``catalogo[lower:upper+1]`` custa O(k) para copiar k elementos.
    Complexidade Espacial: O(k)
        Cria uma nova lista contendo os k resultados encontrados.

    Args:
        catalogo: Lista de dicts ordenada por altitude.
        alt_min: Limite inferior da faixa de altitude (km).
        alt_max: Limite superior da faixa de altitude (km).

    Returns:
        Lista de detritos com altitude no intervalo [alt_min, alt_max].
    """
    lower = busca_binaria_limite_inferior(catalogo, alt_min)
    upper = busca_binaria_limite_superior(catalogo, alt_max)
    if lower > upper or lower >= len(catalogo):
        return []
    return catalogo[lower:upper + 1]


# ====================================================================
# SISTEMA DE MANOBRAS EVASIVAS (PILHA / STACK — LIFO)
# ====================================================================

class PilhaManobras:
    """Pilha (Stack) LIFO para registro de Manobras Evasivas (CAM).

    Implementa o padrão Last-In-First-Out utilizando uma lista Python
    como estrutura subjacente. Cada elemento empilhado representa uma
    altitude testada durante a simulação de manobra.

    Operações e complexidades:
        empilhar():     O(1) amortizado — append no final da lista
        desempilhar():  O(1) — pop do final da lista
        topo():         O(1) — acesso direto ao último elemento
        esta_vazia():   O(1) — comparação de comprimento
    """

    def __init__(self):
        """Inicializa uma pilha vazia."""
        self._stack = []

    def empilhar(self, altitude):
        """Empilha (push) uma nova altitude na pilha de manobras.

        Complexidade Temporal: O(1) amortizado
            A operação ``list.append()`` em Python é O(1) amortizado.
            Em raros casos de realocação do array interno, pode ser O(n),
            mas o custo amortizado por operação é constante.
        Complexidade Espacial: O(1)
            Adiciona exatamente um elemento à lista existente.

        Args:
            altitude: Altitude da manobra proposta em km.
        """
        self._stack.append(altitude)

    def desempilhar(self):
        """Desempilha (pop) a última altitude da pilha.

        Complexidade Temporal: O(1)
            A operação ``list.pop()`` sem argumento remove o último
            elemento, o que não requer deslocamento de outros elementos.
        Complexidade Espacial: O(1)

        Returns:
            A altitude removida, ou None se a pilha estiver vazia.
        """
        if self.esta_vazia():
            return None
        return self._stack.pop()

    def topo(self):
        """Consulta (peek) a altitude no topo da pilha sem removê-la.

        Complexidade Temporal: O(1)
            Acesso direto ao último elemento via índice [-1].
        Complexidade Espacial: O(1)

        Returns:
            A altitude no topo, ou None se a pilha estiver vazia.
        """
        if self.esta_vazia():
            return None
        return self._stack[-1]

    def esta_vazia(self):
        """Verifica se a pilha está vazia. O(1)."""
        return len(self._stack) == 0

    def tamanho(self):
        """Retorna o número de elementos na pilha. O(1)."""
        return len(self._stack)

    def historico(self):
        """Retorna cópia da pilha para visualização. O(n)."""
        return list(self._stack)


def verificar_seguranca(catalogo, altitude, raio=10):
    """Verifica a segurança orbital de uma altitude para manobra evasiva.

    Avalia o risco de colisão verificando a presença de detritos dentro
    de um raio de segurança ao redor da altitude proposta.

    Níveis de risco:
        🟢 VERDE (green):    Nenhum detrito no raio de segurança
        🟡 AMARELO (yellow):  Detritos detectados, porém a >5km de distância
        🔴 VERMELHO (red):    Detritos a <5km — risco crítico de colisão

    Complexidade Temporal: O(log n + k)
        Herda da função ``radar_zona_critica()`` (2× busca binária + iteração).
        O cálculo de ``min()`` sobre k distâncias adiciona O(k).
        Total: O(log n + 2k) = O(log n + k).
    Complexidade Espacial: O(k)
        Armazena os k detritos encontrados no raio para análise.

    Args:
        catalogo: Lista de dicts ordenada por altitude.
        altitude: Altitude da posição orbital a verificar (km).
        raio: Raio de segurança em km (padrão: 10 km).

    Returns:
        Dict com 'status' (green/yellow/red), 'threats' (int) e 'nearest' (float|None).
    """
    nearby = radar_zona_critica(catalogo, altitude - raio, altitude + raio)
    if not nearby:
        return {"status": "green", "threats": 0, "nearest": None}

    nearest_dist = min(abs(d["altitude"] - altitude) for d in nearby)
    if nearest_dist < 5:
        return {"status": "red", "threats": len(nearby), "nearest": round(nearest_dist, 2)}
    return {"status": "yellow", "threats": len(nearby), "nearest": round(nearest_dist, 2)}


# ====================================================================
# SIMULADOR DA SÍNDROME DE KESSLER (RECURSÃO)
# ====================================================================

def simular_cascata_kessler(catalogo, altitude_impacto, raio_explosao,
                            geracao_atual, max_geracoes, ids_atingidos,
                            resultados):
    """Simulação Recursiva da Síndrome de Kessler (Cascata de Colisões).

    Simula o efeito em cadeia catastrófico de uma colisão orbital:
        1. Busca detritos na zona de impacto (via busca binária)
        2. Cada detrito atingido gera 3 novos fragmentos
        3. Fragmentos expandem a zona de destruição
        4. CHAMA A SI MESMA recursivamente para a próxima geração
        5. Condições de parada (casos base):
           a) max_geracoes atingido → para a recursão
           b) Nenhum novo detrito atingido → cadeia interrompida naturalmente

    Complexidade Temporal: O(g × (log n + k))
        Onde:
            g = número de gerações (profundidade máxima da recursão)
            n = tamanho total do catálogo
            k = número médio de detritos atingidos por geração
        Cada chamada recursiva executa:
            - Busca binária: O(log n) para encontrar os limites da zona
            - Iteração: O(k) para filtrar objetos já atingidos
        No pior caso, g chamadas recursivas → O(g × (log n + k)).
    Complexidade Espacial: O(g + total_hits)
        A pilha de recursão tem profundidade máxima g.
        O set ``ids_atingidos`` cresce até O(total_hits) cumulativo.
        A lista ``resultados`` cresce em O(g) (um registro por geração).

    Args:
        catalogo: Lista de dicts ordenada por altitude.
        altitude_impacto: Altitude do ponto de impacto (km).
        raio_explosao: Raio de destruição/explosão (km).
        geracao_atual: Geração atual da cascata (inicia em 0).
        max_geracoes: Limite máximo de gerações a simular.
        ids_atingidos: Set de NORAD IDs já atingidos (evita contagem dupla).
        resultados: Lista acumuladora de resultados por geração.

    Returns:
        Lista de dicts com detalhes de cada geração da cascata.
    """
    # CASO BASE 1: limite de gerações atingido
    if geracao_atual > max_geracoes:
        return resultados

    # Busca detritos na zona de impacto usando busca binária
    lower = busca_binaria_limite_inferior(catalogo, altitude_impacto - raio_explosao)
    upper = busca_binaria_limite_superior(catalogo, altitude_impacto + raio_explosao)

    # Filtra objetos já destruídos em gerações anteriores
    novos_atingidos = []
    for i in range(lower, min(upper + 1, len(catalogo))):
        if catalogo[i]["norad_id"] not in ids_atingidos:
            novos_atingidos.append(catalogo[i])
            ids_atingidos.add(catalogo[i]["norad_id"])

    # CASO BASE 2: cadeia interrompida — nenhum novo detrito atingido
    if not novos_atingidos:
        return resultados

    FRAGMENTOS_POR_COLISAO = 3
    resultados.append({
        "geracao": geracao_atual,
        "altitude_impacto": round(altitude_impacto, 2),
        "objetos_atingidos": len(novos_atingidos),
        "nomes": [d["nome"] for d in novos_atingidos[:5]],
        "fragmentos_gerados": len(novos_atingidos) * FRAGMENTOS_POR_COLISAO,
    })

    # PASSO RECURSIVO: fragmentos geram novos impactos na próxima geração
    media_alt = sum(d["altitude"] for d in novos_atingidos) / len(novos_atingidos)
    novo_raio = raio_explosao * 0.7 + len(novos_atingidos) * 0.3

    return simular_cascata_kessler(
        catalogo, media_alt, novo_raio,
        geracao_atual + 1, max_geracoes,
        ids_atingidos, resultados
    )

# ====================================================================
# MICROSERVIÇO WEB (FAST API) - A PONTE COM O JAVA
# ====================================================================

# 1. Inicializa a API
app = FastAPI(title="Kessler Vision - Motor Físico API")

# 2. Carrega a base de dados do CelesTrak UMA ÚNICA VEZ quando liga o servidor
CATALOGO_GLOBAL = carregar_catalogo()

@app.get("/api/analisar")
def analisar_risco(altitude: float):
    print(f"[API] Java solicitou analise para altitude: {altitude} km")
    
    # Chama a sua função original de Busca Binária/Radar
    resultado_fisica = verificar_seguranca(CATALOGO_GLOBAL, altitude, raio=10)
    
    status = resultado_fisica["status"]
    ameacas = resultado_fisica["threats"]
    distancia = resultado_fisica["nearest"]

    # Traduz para as regras do sistema
    if status == "red":
        nivel_alerta = "VERMELHO"
        probabilidade = min(85.0 + (ameacas * 2.5), 99.9)
        acao = "PERIGO: Preparar manobra evasiva (Pilha CAM)"
    elif status == "yellow":
        nivel_alerta = "AMARELO"
        probabilidade = min(40.0 + (ameacas * 1.5), 84.9)
        acao = "ATENÇÃO: Monitorizar detritos próximos"
    else:
        nivel_alerta = "VERDE"
        probabilidade = 1.2
        acao = "SEGURO: Órbita limpa. Manter trajetória."

    return {
        "altitudeAnalisada": altitude,
        "nivelAlerta": nivel_alerta,
        "probabilidadeImpacto": round(probabilidade, 2),
        "ameacasDetectadas": ameacas,
        "distanciaMaisProxima": distancia,
        "acaoRecomendada": acao
    }

# ====================================================================
# INTERFACE DO USUÁRIO (CLI — ESPELHO DA WEB UI)
# ====================================================================

def _exibir_header(catalogo, pilha):
    """Exibe o cabeçalho do menu principal."""
    print(f"\n{'=' * 60}")
    print("  KESSLER VISION v2.0 — PAINEL DE CONTROLE")
    print(f"  Catálogo: {len(catalogo)} objetos | Pilha CAM: {pilha.tamanho()}")
    print(f"{'=' * 60}")
    print("  [1] Status do Catálogo")
    print("  [2] Radar de Zonas de Risco (Busca Binária)")
    print("  [3] Simular Manobra Evasiva (Pilha CAM)")
    print("  [4] Simular Pior Cenário (Cascata Kessler)")
    print("  [0] Encerrar Sistema")
    print(f"{'=' * 60}")


def menu():
    """Menu interativo principal — espelha as 4 opções da web UI."""
    catalogo = carregar_catalogo()
    pilha = PilhaManobras()

    while True:
        _exibir_header(catalogo, pilha)
        opcao = input("\n  Comando > ").strip()

        # ---- OPÇÃO 1: STATUS DO CATÁLOGO ----
        if opcao == "1":
            total = len(catalogo)
            if total == 0:
                print("  [WARN] Catálogo vazio.")
                continue
            leo_low = sum(1 for d in catalogo if d["altitude"] < 400)
            leo_mid = sum(1 for d in catalogo if 400 <= d["altitude"] <= 800)
            leo_high = sum(1 for d in catalogo if d["altitude"] > 800)
            print(f"\n  [STATUS] Total de Objetos: {total}")
            print(f"  [STATUS] Faixa: {catalogo[0]['altitude']} km — {catalogo[-1]['altitude']} km")
            print(f"  [STATUS] LEO Baixo (<400km):     {leo_low}")
            print(f"  [STATUS] LEO Médio (400–800km):   {leo_mid}")
            print(f"  [STATUS] LEO Alto (>800km):       {leo_high}")

        # ---- OPÇÃO 2: RADAR DE ZONAS ----
        elif opcao == "2":
            try:
                alt_min = float(input("  Altitude mínima (km): "))
                alt_max = float(input("  Altitude máxima (km): "))
                if alt_min >= alt_max:
                    print("  [ERRO] Altitude mínima deve ser menor que a máxima.")
                    continue

                print(f"  [RADAR] Escaneando zona {alt_min}km — {alt_max}km...")
                resultados = radar_zona_critica(catalogo, alt_min, alt_max)

                if not resultados:
                    print("  [OK] Zona limpa. Nenhum detrito detectado.")
                else:
                    print(f"  [WARN] {len(resultados)} detritos detectados!")
                    print(f"\n  {'NORAD_ID':<12} {'NOME':<30} {'ALTITUDE':>10}")
                    print(f"  {'-'*12} {'-'*30} {'-'*10}")
                    for d in resultados[:25]:
                        print(f"  {d['norad_id']:<12} {d['nome']:<30} {d['altitude']:>8} km")
                    if len(resultados) > 25:
                        print(f"  ... e mais {len(resultados) - 25} objetos")
            except ValueError:
                print("  [ERRO] Valores inválidos.")

        # ---- OPÇÃO 3: MANOBRA EVASIVA (PILHA CAM) ----
        elif opcao == "3":
            print("\n  MANOBRA EVASIVA — Submenu CAM")
            print("  [P] Push — Propor nova altitude")
            print("  [U] Undo — Desfazer última manobra (Pop)")
            print("  [H] Histórico — Ver pilha completa")
            print("  [X] Sair do submenu")

            while True:
                sub = input("\n  CAM > ").strip().upper()
                if sub == "P":
                    try:
                        alt = float(input("  Altitude proposta (km): "))
                        seg = verificar_seguranca(catalogo, alt)
                        pilha.empilhar(alt)
                        status_label = {
                            "green": "🟢 SEGURO",
                            "yellow": "🟡 ATENÇÃO",
                            "red": "🔴 PERIGO"
                        }[seg["status"]]
                        print(f"  [CAM] PUSH → {alt} km | {status_label} | Ameaças: {seg['threats']}")
                        if seg["nearest"] is not None:
                            print(f"  [CAM] Detrito mais próximo: {seg['nearest']} km")
                    except ValueError:
                        print("  [ERRO] Altitude inválida.")
                elif sub == "U":
                    removido = pilha.desempilhar()
                    if removido is None:
                        print("  [WARN] Pilha vazia. Nada para desfazer.")
                    else:
                        print(f"  [UNDO] POP ← {removido} km removido.")
                        if not pilha.esta_vazia():
                            print(f"  [CAM] Posição restaurada: {pilha.topo()} km")
                        else:
                            print("  [CAM] Pilha vazia. Nenhuma posição ativa.")
                elif sub == "H":
                    hist = pilha.historico()
                    if not hist:
                        print("  [INFO] Pilha vazia.")
                    else:
                        print(f"\n  PILHA DE MANOBRAS (LIFO) — {len(hist)} entradas")
                        for i, alt in enumerate(reversed(hist)):
                            marker = "▶ TOPO" if i == 0 else ("  BASE" if i == len(hist) - 1 else "      ")
                            seg = verificar_seguranca(catalogo, alt)
                            print(f"  {marker} | {alt} km | {seg['status'].upper()} | {seg['threats']} ameaças")
                elif sub == "X":
                    break
                else:
                    print("  [ERRO] Comando inválido.")

        # ---- OPÇÃO 4: CASCATA KESSLER ----
        elif opcao == "4":
            try:
                alt = float(input("  Altitude de impacto (km): "))
                raio = float(input("  Raio de explosão (km) [padrão 15]: ") or "15")
                max_gen = int(input("  Máximo de gerações [padrão 3]: ") or "3")

                print(f"\n  [KESSLER] Simulação recursiva — Alt: {alt}km, Raio: {raio}km, Gen: {max_gen}")

                ids_atingidos = set()
                resultados = []
                simular_cascata_kessler(
                    catalogo, alt, raio, 0, max_gen - 1,
                    ids_atingidos, resultados
                )

                if not resultados:
                    print("  [OK] Nenhum detrito na zona de impacto. Cascata não iniciada.")
                else:
                    total_hits = sum(r["objetos_atingidos"] for r in resultados)
                    total_frags = sum(r["fragmentos_gerados"] for r in resultados)

                    print(f"\n  {'=' * 50}")
                    print("  ⚠  RELATÓRIO DE CASCATA KESSLER  ⚠")
                    print(f"  {'=' * 50}")
                    for r in resultados:
                        print(f"  Geração {r['geracao']}: {r['objetos_atingidos']} atingidos → "
                              f"{r['fragmentos_gerados']} fragmentos (alt: {r['altitude_impacto']}km)")
                    print(f"  {'─' * 50}")
                    print(f"  TOTAL: {total_hits} destruídos | {total_frags} novos fragmentos")
                    print(f"  Gerações da cascata: {len(resultados)}")
                    print(f"  {'=' * 50}")
            except ValueError:
                print("  [ERRO] Valores inválidos.")

        # ---- OPÇÃO 0: SAIR ----
        elif opcao == "0":
            print("\n  [SYS] Encerrando Kessler Vision. Boa sorte nas manobras evasivas!")
            break
        else:
            print("  [ERRO] Comando inválido. Use 0-4.")


if __name__ == "__main__":
    print("\nIniciando Motor Fisico Kessler Vision (FastAPI) na porta 8000...")
    # Em vez de chamar o menu(), ligamos o servidor web
    uvicorn.run(app, host="0.0.0.0", port=8000)
