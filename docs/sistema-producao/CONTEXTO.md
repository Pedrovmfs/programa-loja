# Sistema de Produção (estilo Azoup) — contexto salvo

> Projeto novo, separado do Attual Pedidos em escopo de negócio. Salvo em 2026-11-20.

## Origem
A chefe da Attual Camisetas pediu algo no estilo de um vídeo mostrando o "Azoup" (gestão de produção pra confecção: Kanban de Ordem de Produção por fases, controle de estoque, terceirização).

Artefatos já publicados:
- Avaliação de complexidade: [Sistema de produção: complexidade real](https://claude.ai/artifact/9s1JYGoA4H76ZWqiDcLJas)
- Requisitos + processo ideal da OP: [OP: requisitos e processo ideal](https://claude.ai/artifact/XESsYYERRaAdhEupSGGupH)

## Decisão de escopo (confirmada com a chefe)
- Sem estoque automático de verdade — só um marcador simples "tem/não tem material".
- Fases fixas pra começar. Roteiro configurável = ideal futuro, não essencial agora.

## Arquitetura (Attual Camisetas)
- **Mesmo repositório do Attual Pedidos**, porque a OP precisa nascer automaticamente a partir dos dados de pedido/item que já existem aqui.
- Repo separado só faria sentido com banco compartilhado entre dois códigos (mais atrito) — descartado.

## Novos interessados: duas malharias
- Uma da família (tia/tio) e outra (tio/primo), vizinhas uma da outra.
- **Não têm sistema de pedido** → "OP nasce do pedido" não se aplica; a OP é criada manualmente.
- Se der certo, pode abrir porta pro "grupo de costura" (rede de malharias da cidade). Indo com cautela de propósito: essas duas (família) são o primeiro teste real antes de clientes fora do círculo de confiança.

## Precificação (negociação em ~1 semana, as duas juntas na mesma reunião)
- **Tier Essencial** — Kanban + marcador de material, adaptado ao processo de cada malharia: **R$2.500–4.000 por empresa**.
  - Preferência por instâncias/programas separados (não uma compartilhada): risco de vazamento de dado entre concorrentes vizinhos e acoplamento de manutenção.
- **Tier Lite** (fallback se recusarem) — Kanban bem mais simples, sem automação, OP criada e movida manualmente, sem marcador de material, sem divisão por tamanho/cor: **R$800–1.500 por empresa**. Também é menos trabalho de construir (importa pra evitar sobrecarga com projetos pessoais).
- Deixar **explícito no acordo** se o valor cobre só construção ou também manutenção contínua.
- Motivação: portfólio/experiência pesa mais que o dinheiro; não entrar por menos que as faixas acima.

## Próximos passos
1. **Antes de tudo:** entender os estilos/modelos de OP existentes no mercado (o Azoup não é referência notável — pesquisar outros).
2. Maquete clicável (protótipo visual, sem backend) do Kanban + card de OP + modal de mover fase, pra usar na reunião de negociação.
3. Roteiro de descoberta (perguntas estruturadas pra entender o processo real de cada malharia antes de cotar/construir) — ainda não feito.
