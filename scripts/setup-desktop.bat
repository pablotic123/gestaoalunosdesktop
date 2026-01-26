@echo off
echo ====================================
echo   SGE - Sistema de Gestao Escolar
echo   Script de Instalacao Desktop
echo ====================================
echo.

:: Verificar Python
echo [1/4] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale o Python 3.11+ de: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python encontrado

:: Verificar Node.js
echo [2/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js 18+ de: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js encontrado

:: Verificar MongoDB
echo [3/4] Verificando MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Servico MongoDB nao detectado como servico do Windows.
    echo Certifique-se de que o MongoDB esta instalado e rodando.
    echo Download: https://www.mongodb.com/try/download/community
    echo.
)
echo [OK] Verificacao concluida

:: Instalar dependencias
echo [4/4] Instalando dependencias...
echo.

echo Instalando dependencias do backend...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
cd ..

echo.
echo Instalando dependencias do frontend...
cd frontend
call yarn install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
cd ..

echo.
echo ====================================
echo   Instalacao concluida com sucesso!
echo ====================================
echo.
echo Para iniciar em modo desenvolvimento:
echo   cd frontend
echo   yarn electron:dev
echo.
echo Para gerar o instalador Windows:
echo   cd frontend
echo   yarn electron:build:win
echo.
pause
