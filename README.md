# Kessler Vision — Frontend & Dashboard

## Sobre a Solução

O **Kessler Vision** é um ecossistema computacional de alta performance projetado para o monitoramento tático de ativos espaciais e auditoria de riscos de colisão na Órbita Baixa da Terra (LEO).

Esta aplicação frontend representa a camada visual interativa da plataforma. Foi construída para oferecer um dashboard moderno, responsivo e de alta fidelidade visual, permitindo a gestão de frotas espaciais e a visualização tática de potenciais colisões orbitais.

A arquitetura do frontend foi desenhada seguindo as melhores práticas do ecossistema JavaScript/TypeScript moderno:
- **Core da Aplicação (React & Vite):** SPA (Single Page Application) ultra-rápida, utilizando componentes funcionais e hooks do React.
- **Estilização Dinâmica (Tailwind CSS):** Design system utilitário permitindo a criação de interfaces ricas, animações fluidas e suporte avançado a modos visuais.
- **Integração Backend:** Consumo inteligente das APIs REST (Core em Java) e microserviços (Motor de Física em Python).

## O Problema Escolhido

A humanidade tornou-se profundamente dependente da infraestrutura orbital para telecomunicações, geolocalização (GPS), previsões meteorológicas e monitoramento climático. No entanto, mais de 60 anos de exploração espacial geraram uma nuvem massiva de lixo espacial.

O projeto mitiga diretamente o risco da **Síndrome de Kessler** — um cenário hipotético onde a densidade de objetos em órbita é alta o suficiente para que colisões gerem um efeito cascata, destruindo satélites operacionais e tornando órbitas inteiras inutilizáveis por gerações. O Kessler Vision antecipa e audita esses riscos, permitindo visualizações estratégicas no painel de controle.

## ODS Relacionado

Esta solução está diretamente alinhada com o **ODS 9: Indústria, Inovação e Infraestrutura** da Organização das Nações Unidas (ONU).

Ao proteger constelações de satélites comerciais e científicos contra impactos catastróficos, o Kessler Vision atua como uma camada tecnológica essencial para:
- Garantir a resiliência da infraestrutura tecnológica global.
- Promover a inovação através de visualização de dados espaciais escaláveis.
- Apoiar a sustentabilidade de longo prazo das atividades na órbita terrestre, protegendo investimentos e serviços públicos globais.

## 🏗️ Arquitetura e Estrutura do Projeto

```text
├── src/
│   ├── assets/               # Imagens, SVGs e recursos estáticos globais
│   ├── components/           # Componentes React reutilizáveis (UI)
│   ├── index.css             # Arquivo principal de estilização e diretrizes do Tailwind
│   ├── main.tsx              # Ponto de entrada da aplicação React
│   ├── App.tsx               # Componente raiz da aplicação
│   └── vite-env.d.ts         # Tipagens de ambiente do Vite
├── public/                   # Arquivos estáticos servidos diretamente na raiz
├── index.html                # Template HTML base da SPA
├── package.json              # Dependências e scripts do projeto (npm)
├── tailwind.config.js        # Configuração do design system (Tailwind CSS)
├── tsconfig.json             # Configuração do compilador TypeScript
└── vite.config.ts            # Configurações do bundler Vite
```

## Como Executar o Projeto

### Pré-requisitos Mínimos:
- **Node.js** (versão 18.x ou superior) e **npm** / **yarn** instalados.
- **Java JDK 21** instalado.
- **Python 3.10** ou superior instalado.
- **PostgreSQL** rodando localmente.

### 1. Clonando e Executando o Backend (Java + Python)

Para que o frontend exiba os dados dinâmicos, é obrigatório rodar o backend. 
**Repositório Oficial do Backend:** [Caio-Front-End/Kessler_Vision_Backend](https://github.com/Caio-Front-End/Kessler_Vision_Backend)

**Resumo de inicialização do Backend:**
1. **Banco de Dados:** Crie um banco PostgreSQL vazio chamado exatamente `kesslervision`. As credenciais padrão esperadas são usuário `postgres`.
2. **Motor Físico (Python):** Entre na pasta do motor, instale as dependências (`pip install fastapi uvicorn requests`) e inicie o serviço com `python kessler_vision.py` (porta 8000).
3. **API Core (Java):** Na pasta da API Java, inicie o projeto Spring Boot (ex: `mvn spring-boot:run`). O Hibernate criará as tabelas e o Tomcat rodará na porta 8080.

### 2. Instalação e Execução do Frontend (React + Vite)

Abra o terminal na raiz deste projeto (pasta `kessler-vision-ui`) e instale as dependências:

```bash
npm install
```

Após a instalação, inicialize o servidor local:

```bash
npm run dev
```

O console exibirá que o servidor local está online, geralmente acessível através do endereço:
`http://localhost:5173/`

### 3. Validando o Ecossistema Completo

Abra o navegador e acesse a URL do Vite (http://localhost:5173/). 
Com todos os microserviços online (Banco de Dados, Motor Python e API Java), as interações no Dashboard React farão requisições reais para a API Java, que orquestrará a busca com o Motor de Física em Python e retornará a visualização de potenciais colisões na interface.
## 👥 Integrantes do Grupo

- Caio N. Battista - RM: 561383
- Lucas Cavalcante - RM: 562857
- Matheus Rodrigues - RM: 561689
- Manoah Leão - RM: 563713
- Jean Pierre - RM: 566534

## 📺 Demonstração em Vídeo

O vídeo completo com a explicação da arquitetura, defesa do problema escolhido e a execução prática da interface funcionando de ponta a ponta pode ser assistido no link abaixo:

[🔗 Clique aqui para assistir ao vídeo do projeto no YouTube](https://youtu.be/UtyQfMzZGGQ)

Desenvolvido como projeto acadêmico para avaliação corporativa e técnica.
