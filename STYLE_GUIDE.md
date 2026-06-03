# Kessler Vision — Diretrizes Globais de Estilo & Design System

Este documento estabelece as regras de design e os padrões estéticos para a interface do **Kessler Vision**. O objetivo é criar uma experiência visual premium, imersiva e futurista, que mescle a sofisticação moderna do **Glassmorphism** com o minimalismo nostálgico e técnico do estilo **ASCII/Terminal**.

```text
========================================================================
     __ __  ____   ____  ____  _      ____  ____  _____     __ __  ____
    |  |  |/    | /    |/    || |    |    ||    |/ ___/    |  |  ||    |
    |  |  ||  o  ||   __||  o  || |     |  |  |  |(   \_     |  |  | |  | 
    |  _  ||     ||  |  ||     || |___  |  |  |  | \__  |    |  |  | |  | 
    |  |  ||  _  ||  |_ ||  _  ||     | |  |  |  | /  \ |    |  :  | |  | 
    |  |  ||  |  ||    _||  |  ||     | |  |  |  | \    |     \   /  |  | 
    |__|__||__|__||___|  |__|__||___|__||____||____|\___|      \_/  |____|
                                                                        
    SYS_MONITOR: ACTIVE [||||||||||||||||||||||||] 100% ORBIT_ELEVATION
========================================================================
```

---

## 1. Paleta de Cores (Cosmic Tech)

As cores devem evocar o espaço profundo e telas de radar analíticas. Evite o uso de cores básicas puras; utilize tons dessaturados e cores neon de destaque com opacidade controlada.

| Elemento | Amostra | Código HEX | Classe Tailwind / CSS | Função principal |
| :--- | :--- | :--- | :--- | :--- |
| **Space Black** | | `#050508` | `bg-[#050508]` | Fundo principal da aplicação |
| **Obsidian Slate**| | `#0a0a0f` | `bg-[#0a0a0f]` | Fundo de painéis e seções |
| **Cyber Cyan** | | `#00f0ff` | `text-[#00f0ff]` | Acento primário, dados normais, órbitas estáveis |
| **Neon Pink** | | `#ff007f` | `text-[#ff007f]` | Acento secundário, eventos críticos, alertas |
| **Orbit Green** | | `#10b981` | `text-emerald-400` | Dados válidos, status "OK", otimizações bem-sucedidas |
| **Cosmic Gray** | | `#8e8e9f` | `text-[#8e8e9f]` | Textos secundários, metadados, timestamps |

---

## 2. Regras de Glassmorphism (Efeito Translúcido)

Os painéis principais devem dar a sensação de placas de vidro flutuando no espaço, revelando sutilmente a animação de fundo (como a órbita de detritos ou grids de radar).

### Especificações Técnicas de CSS:
```css
.glass-panel {
  background: rgba(10, 10, 15, 0.45);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.5),
    inset 0 0 12px rgba(0, 240, 255, 0.05); /* Brilho interno sutil */
}
```

### Regras de Implementação:
1. **Transparência**: O fundo deve manter entre `30%` e `50%` de opacidade para garantir que o blur funcione sem poluir visualmente a leitura.
2. **Bordas sutilmente iluminadas**: Utilize gradientes nas bordas ou opacidades extremamente baixas (`border-white/10` ou `border-cyan-500/15`).
3. **Bordas arredondadas (Rounded Corners)**: Elementos de layout principais devem usar `rounded-2xl` (`1rem`) ou `rounded-3xl` (`1.5rem`) para um acabamento premium moderno.

---

## 3. Elementos ASCII & Estética Terminal

Para reforçar a vibe retro-futurista de software aeroespacial militar/científico, integre representações em texto plano de matrizes, molduras e barras de status.

### Tipografia
- **Fontes de Leitura**: `Inter` ou `Outfit` (sans-serif moderno) para blocos textuais.
- **Fontes de Dados & Terminal**: `Neue Metana Mono` ou `JetBrains Mono` para IDs de satélite, coordenadas, consoles e cabeçalhos ASCII.

### Divisores e Bordas ASCII
Sempre que fizer divisórias em caixas de console ou listas técnicas, use layouts simulados com caracteres mono-espaçados:
- Linhas tracejadas técnicas: `----------------------------------------`
- Linhas duplas: `========================================`
- Indicadores de progresso: `[██████████░░░░░░░░░░] 50%`

### Scanlines (Linhas de Varredura)
Para consoles de log e terminais, adicione um overlay de linhas horizontais translúcidas simulando telas CRT clássicas:
```css
.scanline-overlay {
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 10;
  pointer-events: none;
}
```

---

## 4. Micro-animações e Interatividade

A interface do Kessler Vision precisa se sentir viva e reativa. Cada clique e interação deve dar feedbacks táteis e de iluminação.

1. **Estado Hover nos Cards de Vidro**:
   - Aumentar a opacidade da borda de `0.08` para `0.15`.
   - Adicionar uma sombra brilhante sutil externa (glow) na cor do acento primário (`shadow-[0_0_20px_rgba(0,240,255,0.15)]`).
   - Escalonamento leve via Framer Motion: `whileHover={{ scale: 1.015 }}`.

2. **Indicadores de Status Pulsantes**:
   - Elementos de monitoramento "Live" devem usar a classe `animate-pulse` ou uma animação customizada de expansão de radar (pings concêntricos).

3. **Efeito Glow de Neon**:
   - Em títulos e dados de impacto crítico, use sombras de texto para brilho retro:
     ```css
     .text-neon-glow {
       text-shadow: 0 0 8px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3);
     }
     ```

---

## 5. Exemplo de Componente Alinhado ao Estilo

Para criar novos blocos de código seguindo este guia de estilo, utilize a estrutura estrutural abaixo no React/Tailwind:

```tsx
import React from 'react';
import { Terminal } from 'lucide-react';

export const OrbitCard = () => {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-white/8 bg-black/45 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_24px_rgba(0,240,255,0.1)]">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 scanline-overlay opacity-30 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-wider font-bold">
          [ DEBRIS_DETECTED ]
        </span>
        <Terminal className="h-4 w-4 text-[#8e8e9f]" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2 font-mono">
        OBJECT_ID: #402_ALPHA
      </h3>
      <p className="text-sm text-[#8e8e9f] mb-4">
        Fragmento instável detectado em LEO (Low Earth Orbit). Risco de colisão eminente.
      </p>

      {/* ASCII Stats Block */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-white/70 space-y-1">
        <div>ALTITUDE: 842.15 KM</div>
        <div>VELOCITY: 7.8 KM/S</div>
        <div>PROBABILITY: [||||||||||||||||||░░] 84%</div>
      </div>
    </div>
  );
};
```

---

## Como aplicar novas alterações
Ao criar novos cards, gráficos ou interações com dados, assegure-se de que a tipografia mono seja utilizada para dados puros de computação e que os botões tenham transições suaves de escala e brilho. A simbiose entre dados brutos (ASCII) e a estética futurista translúcida (Glassmorphism) é a essência do design do **Kessler Vision**.
