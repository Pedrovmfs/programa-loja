@echo off
setlocal
title Attual - Instalando o Programa de Pedidos
cd /d "%~dp0"

echo ==========================================
echo  Instalando o Programa de Pedidos - Attual
echo ==========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERRO: o Node.js nao esta instalado neste computador.
  echo Baixe e instale em https://nodejs.org ^(versao LTS^) e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

node -e "require('node:sqlite')" >nul 2>nul
if %errorlevel% neq 0 (
  echo ERRO: a versao do Node.js instalada e antiga demais para este programa.
  echo Baixe uma versao mais recente ^(22 ou superior^) em https://nodejs.org e instale por cima.
  echo.
  pause
  exit /b 1
)

echo Instalando dependencias ^(pode demorar alguns minutos na primeira vez^)...
call npm install
if %errorlevel% neq 0 (
  echo.
  echo ERRO ao instalar as dependencias. Veja a mensagem acima.
  pause
  exit /b 1
)

echo.
echo Compilando o programa...
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo ERRO ao compilar o programa. Veja a mensagem acima.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo  Instalacao concluida!
echo  Use o arquivo "iniciar.bat" para abrir o programa.
echo ==========================================
pause
