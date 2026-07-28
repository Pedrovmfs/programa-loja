@echo off
setlocal
title Attual - Programa de Pedidos
cd /d "%~dp0"

if not exist "server\dist\index.js" (
  echo O programa ainda nao foi instalado neste computador.
  echo Rode primeiro o arquivo "instalar.bat" ^(uma vez so^).
  echo.
  pause
  exit /b 1
)

echo Iniciando o servidor...
start "Attual - Servidor (NAO FECHE esta janela enquanto estiver usando o programa)" cmd /k node server\dist\index.js

timeout /t 3 /nobreak >nul
start "" http://localhost:4000

echo.
echo O programa foi aberto no navegador.
echo Para ENCERRAR o programa, feche a janela "Attual - Servidor".
echo Esta janela aqui pode ser fechada.
pause
