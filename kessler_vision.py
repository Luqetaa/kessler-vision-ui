#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Kessler Vision v2.0 — Simulador Tático de Monitoramento de Lixo Espacial (LEO)
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

MU_EARTH = 398600.4418
R_EARTH = 6378.137
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
    n = mean_motion * 2 * math.pi / 86400
    a = (MU_EARTH / (n ** 2)) ** (1 / 3)
    return round(a - R_EARTH, 2)


# ====================================================================
# CARGA DE DADOS (FASE 1 — BOOT DO SISTEMA)
# ====================================================================

def carregar_catalogo():
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
    lo, hi = 0, len(catalogo)
    while lo < hi:
        mid = (lo + hi) // 2
        if catalogo[mid]["altitude"] < altitude_min:
            lo = mid + 1
        else:
            hi = mid
    return lo


def busca_binaria_limite_superior(catalogo, altitude_max):
    lo, hi = 0, len(catalogo)
    while lo < hi:
        mid = (lo + hi) // 2
        if catalogo[mid]["altitude"] <= altitude_max:
            lo = mid + 1
        else:
            hi = mid
    return lo - 1


def radar_zona_critica(catalogo, alt_min, alt_max):
    lower = busca_binaria_limite_inferior(catalogo, alt_min)
    upper = busca_binaria_limite_superior(catalogo, alt_max)
    if lower > upper or lower >= len(catalogo):
        return []
    return catalogo[lower:upper + 1]


# ====================================================================
# SISTEMA DE MANOBRAS EVASIVAS (PILHA / STACK — LIFO)
# ====================================================================

class PilhaManobras:
    def __init__(self):
        self._stack = []

    def empilhar(self, altitude):
        self._stack.append(altitude)

    def desempilhar(self):
        if self.esta_vazia():
            return None
        return self._stack.pop()

    def topo(self):
        if self.esta_vazia():
            return None
        return self._stack[-1]

    def esta_vazia(self):
        return len(self._stack) == 0

    def tamanho(self):
        return len(self._stack)

    def historico(self):
        return list(self._stack)


def verificar_seguranca(catalogo, altitude, raio=10):
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
    if geracao_atual > max_geracoes:
        return resultados

    lower = busca_binaria_limite_inferior(catalogo, altitude_impacto - raio_explosao)
    upper = busca_binaria_limite_superior(catalogo, altitude_impacto + raio_explosao)

    novos_atingidos = []
    for i in range(lower, min(upper + 1, len(catalogo))):
        if catalogo[i]["norad_id"] not in ids_atingidos:
            novos_atingidos.append(catalogo[i])
            ids_atingidos.add(catalogo[i]["norad_id"])

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

app = FastAPI(title="Kessler Vision - Motor Físico API")

CATALOGO_GLOBAL = carregar_catalogo()

@app.get("/api/analisar")
def analisar_risco(altitude: float):
    print(f"[API] Java solicitou analise para altitude: {altitude} km")
    
    resultado_fisica = verificar_seguranca(CATALOGO_GLOBAL, altitude, raio=10)
    
    status = resultado_fisica["status"]
    ameacas = resultado_fisica["threats"]
    distancia = resultado_fisica["nearest"]

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
    catalogo = carregar_catalogo()
    pilha = PilhaManobras()

    while True:
        _exibir_header(catalogo, pilha)
        opcao = input("\n  Comando > ").strip()

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

        elif opcao == "0":
            print("\n  [SYS] Encerrando Kessler Vision. Boa sorte nas manobras evasivas!")
            break
        else:
            print("  [ERRO] Comando inválido. Use 0-4.")


if __name__ == "__main__":
    print("\nIniciando Motor Fisico Kessler Vision (FastAPI) na porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
