# Attual Camisetas — Programa de Lançamento de Pedidos

Substitui a Ficha Técnica + Ficha de Corte em papel. Cada pedido pode ter
vários itens (vestuário + brindes); cada item de vestuário gera sua própria
Ficha Técnica numerada (450.1, 450.2...) e o pedido inteiro gera uma
Capa-Resumo.

## Arquitetura

- **server/** — Node + TypeScript + Express + `node:sqlite` (SQLite embutido
  no próprio Node.js — sem addon nativo, sem compilação no `npm install`).
  Único processo dono do banco (`server/data/pedidos.db`) e dos documentos
  gerados (`server/data/documentos/`). Gera os `.docx` com a lib `docx`.
- **web/** — React + Vite. Fala com o backend via `/api/*`.
- **desktop/** — shell Electron opcional: empacota tudo num app desktop de
  verdade (sem terminal, sem tela preta) com modo rede (um computador
  "principal" guarda os dados; os demais só se conectam a ele). Ver seção
  própria abaixo.

Requer Node.js **22.5+** (idealmente 22 LTS ou mais recente) — é a partir
dessa versão que o módulo `node:sqlite` está disponível.

Numeração de OS: atribuída no momento de "Gerar Documentos", dentro de uma
transação `BEGIN IMMEDIATE` (ver `server/src/services/numbering.ts`) — o
SQLite serializa concorrência entre requisições, então duas telas não podem
receber o mesmo número mesmo lançando pedidos ao mesmo tempo.

## Rodando localmente

```bash
npm install          # instala server + web (workspaces)

# em dois terminais:
npm run dev:server   # http://localhost:4000
npm run dev:web      # http://localhost:5173 (proxy /api -> :4000)
```

Abra `http://localhost:5173`. Para uso no dia a dia da loja, pode abrir
essa URL em modo app do Chrome/Edge (`--app=http://localhost:5173`) para
parecer um programa desktop.

## Dados

- Banco: `server/data/pedidos.db` (SQLite, não versionado em git).
- Documentos gerados: `server/data/documentos/{numero_os}/`.
- Fazer backup = copiar a pasta `server/data`.

## Build de produção / uso na loja (Windows)

```bash
npm run build
npm run --workspace server start
```

O `server` compilado já serve o frontend (`web/dist`) na mesma porta —
um processo só, `http://localhost:4000`. Para o computador da loja, os
scripts `instalar.bat` (rodar uma vez) e `iniciar.bat` (uso diário) na
raiz do repositório fazem exatamente isso automaticamente — instruções
em `LEIA-ME.txt`. Essa via ainda abre uma janela de terminal (mesmo que
escondida atrás do navegador).

## App desktop (Electron) — recomendado para o dia a dia da loja

Resolve os dois incômodos da via acima: nenhuma janela preta de terminal
aparece, e é um único `.exe` (sem `npm install` manual). Também é o que
habilita várias telas da loja usando o mesmo pedido (modo rede).

**Como funciona o modo rede**: na primeira vez que abre em cada
computador, aparece uma tela perguntando se este é o **computador
principal** (onde os pedidos ficam salvos — escolha isso no PC que fica
sempre ligado) ou se vai **conectar a outro computador** (informa o nome/IP
do principal, com botão "Testar Conexão" antes de continuar). Isso só
aparece uma vez; depois o programa abre direto. Para reconfigurar depois,
tem um menu "Configurações → Alterar modo de conexão" dentro do app.

Importante: **só o computador "principal" precisa ter Node.js instalado**
(mesmo pré-requisito do `instalar.bat`, é ele quem roda o backend de
verdade por trás do Electron). Os computadores "cliente" não precisam de
nada além do `.exe` — só enxergam a tela por rede.

### Solução de problemas — computador "cliente" não conecta no "principal"

**"Nome não encontrado" ao testar conexão pelo nome do computador**
(ex.: `SERVIDOR`): o nome de rede (NetBIOS/hostname do Windows) só resolve
entre PCs se a "Descoberta de Rede" estiver ativada e a rede marcada como
"Privada" — em muitas lojas isso está desligado. Solução: usar o IP local
do computador principal em vez do nome (a tela de configuração já mostra
esse IP como alternativa). Para descobrir manualmente, no Prompt de
Comando do computador principal:

```
ipconfig | findstr /C:"adapter" /C:"IPv4"
```

Ignore linhas de adaptadores "VirtualBox", "VPN", "Bluetooth", "Hyper-V" ou
"vEthernet" — o IP certo é o que aparece embaixo do adaptador Wi-Fi ou
Ethernet realmente conectado.

**"Tempo esgotado" ao testar conexão com o IP correto**: geralmente é o
Firewall do Windows bloqueando a porta 4000 no computador principal (ele
não pede permissão automaticamente em toda configuração de rede). No
Prompt de Comando do computador principal, **como Administrador**:

```
netsh advfirewall firewall add rule name="Attual Pedidos" dir=in action=allow protocol=TCP localport=4000
```

Depois disso, testar a conexão de novo no computador cliente.

### Gerando o instalador Windows (.exe)

Empacotar para Windows exige ferramentas específicas (rcedit via Wine) que
só funcionam de forma confiável rodando num Windows de verdade — por isso
o build roda automaticamente no GitHub Actions
(`.github/workflows/build-desktop.yml`) toda vez que há push, ou sob
demanda pela aba **Actions → Build Desktop (Windows) → Run workflow**. O
`.exe` fica disponível para baixar como *artifact* do workflow ao final do
build (portable + instalador NSIS).

Para rodar/testar localmente durante o desenvolvimento (em qualquer SO):

```bash
npm run build                    # compila server + web
npm run bundle --workspace desktop  # empacota o backend + copia o frontend
npm run start --workspace desktop   # abre o app Electron
```
