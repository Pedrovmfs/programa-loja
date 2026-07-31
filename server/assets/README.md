Coloque aqui o arquivo `logo.png` (fundo transparente) da Attual Camisetas.

Assim que esse arquivo existir nesta pasta, a Ficha Técnica e a Capa-Resumo
passam a usar a logo de verdade no cabeçalho automaticamente — sem precisar
mudar nada no código (ver `server/src/services/docx/logo.ts`).

Enquanto o arquivo não existir, os documentos saem só com o texto
"ATTUAL CAMISETAS" no lugar da imagem.
