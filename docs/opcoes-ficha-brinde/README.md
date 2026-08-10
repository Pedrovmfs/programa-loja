# Opções de Ficha Técnica de Brinde

Exemplos gerados pra comparação visual — **nenhuma dessas opções está
ativa no código ainda**. O gerador atual não cria Ficha Técnica nenhuma
pra itens de categoria "brinde" (só aparecem como linha na tabela de
Brindes da Capa-Resumo). Quando a opção for escolhida, ela é reaplicada
no código de verdade (mesmo processo usado antes pra Ficha Técnica de
vestuário, ver `docs/opcoes-ficha-tecnica/`).

Os campos "Tipo de Personalização" e "Local de Personalização" aqui são
**editáveis** (não uma lista fixa tipo Gola): a pessoa digita um valor na
tela e aperta Enter/"Adicionar", ele vira uma etiqueta removível, e todas
as etiquetas aparecem já marcadas (☑) na ficha gerada — reaproveitando o
mesmo desenho de "caixinha marcada" usado na Ficha Técnica de vestuário,
só que a lista de opções vem do que a pessoa digitou em vez de ser fixa.
Não precisa de nenhuma coluna nova no banco: os campos `tipo_personalizacao`
e `local_personalizacao` já existem no item e já são lista de texto — só
a tela de edição muda (de seletor fixo pra campo "digitar e adicionar").

## Opção A — Uma Ficha Técnica por item de brinde (`opcao-a-*.docx`)

Mesmo padrão de hoje (cada item do pedido ganha sua própria Ficha
Técnica numerada), só que sem Grade de Tamanhos/Controle de Corte (não
se aplica a brinde) — tem Dados do Brinde, Personalização (editável),
Arte/Estampa, Observações e Responsáveis. Curta, cabe fácil em 1 página.

## Opção B — Uma ficha só cobrindo todos os brindes do pedido (`opcao-b-*.docx`)

Um documento por pedido, com um bloco compacto por brinde (nome,
tamanho/detalhe, quantidade, personalização, observação), Responsáveis
no fim. Três variações geradas pra testar o limite de "cabe em ~2
páginas" que você pediu:

- `opcao-b-todos-juntos-com-arte-por-item-3itens.docx` — 3 brindes, cada
  um com sua própria caixa de colar arte.
- `opcao-b-todos-juntos-com-arte-por-item-6itens.docx` — 6 brindes
  (pedido "carregado" de propósito), cada um com sua caixa de arte.
- `opcao-b-todos-juntos-sem-arte-por-item-6itens.docx` — os mesmos 6
  brindes, mas sem caixa de arte individual (só o bloco de dados) — pra
  comparar o quanto a arte por item pesa na página.

Não consegui medir a contagem de página exata daqui (o conversor que uso
pra isso não rodou neste ambiente) — abrindo os 3 arquivos no Word dá
pra ver direto quantas páginas cada um ocupa. Minha expectativa, calculando
a altura de cada elemento à mão: a versão de 6 itens **sem** arte por item
deve caber numa página só; a versão de 6 itens **com** arte por item deve
ficar perto do limite de 2 páginas (pode estourar um pouco). Se estourar
demais, as opções são: tirar a caixa de arte individual (fica só uma
caixa de arte compartilhada no fim, cobrindo todos os brindes) ou
realmente pôr um número máximo de brindes por ficha (ex.: até 4, como já
existe pra vestuário com "até 2 modelos").
