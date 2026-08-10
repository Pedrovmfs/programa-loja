# Opções de layout da Ficha Técnica

Exemplos gerados pra comparação visual, guardados aqui pra não se perder
entre uma sessão e outra. **Nenhuma dessas opções está ativa no código**
hoje — o gerador atual (`server/src/services/docx/`) continua no layout
padrão (Capa Resumo separada + uma Ficha Técnica por item). Quando a
decisão final for tomada, a opção escolhida é reaplicada no código de
verdade.

## Opção 1 — Layout compacto (`opcao-1-*.docx`)

Mesma estrutura de hoje (uma Ficha Técnica por item, com Capa Resumo
separada), mas mais compacta:

- Grade de Tamanhos: Infantil e Adulto lado a lado.
- Consumo de Material e Controle de Corte: um bloco só, lado a lado.
- Arte/Estampa: uma caixa só (não mais Frente/Costas separadas), com a
  Observação do item ao lado.
- Caixa de colar arte usa parágrafos em branco de verdade (não margem),
  corrigindo o bug de "o texto desce quando cola imagem".

Dois exemplos: `opcao-1-camiseta.docx` (mostra todos os campos) e
`opcao-1-short.docx` (mostra os campos escondidos pro modelo Short).

## Opções 2, 3 e 4 — Sem Capa Resumo, vários modelos num documento só

Ideia diferente: em vez de Capa Resumo + uma Ficha Técnica por item,
um único documento por pedido com espaço pra até 2, 3 ou 4 modelos
(um bloco completo — dados, personalização, grade, observação — por
modelo), e Arte/Consumo/Corte/Responsáveis compartilhados no fim.

- `opcao-2-ate-2-modelos.docx`
- `opcao-3-ate-3-modelos.docx`
- `opcao-4-ate-4-modelos.docx`

Nesses três, o Nº OS do topo já junta os sub-OS dos modelos incluídos
(ex: "450.1, 450.2, 450.3"), e a numeração das seções (Arte, Consumo,
Controle de Corte, Responsáveis) se ajusta automaticamente conforme a
quantidade de modelos.
