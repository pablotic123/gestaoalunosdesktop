#!/bin/bash

echo "===================================="
echo "  SGE - Sistema de Gestao Escolar"
echo "  Script de Instalacao Desktop"
echo "===================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Python
echo -e "[1/4] Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Python nao encontrado!"
    echo "Por favor, instale o Python 3.11+"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Python encontrado: $(python3 --version)"

# Verificar Node.js
echo -e "[2/4] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO]${NC} Node.js nao encontrado!"
    echo "Por favor, instale o Node.js 18+"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Node.js encontrado: $(node --version)"

# Verificar MongoDB
echo -e "[3/4] Verificando MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}[AVISO]${NC} MongoDB nao detectado no PATH."
    echo "Certifique-se de que o MongoDB esta instalado e rodando."
else
    echo -e "${GREEN}[OK]${NC} MongoDB encontrado"
fi

# Instalar dependencias
echo -e "[4/4] Instalando dependencias..."
echo ""

echo "Instalando dependencias do backend..."
cd backend
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO]${NC} Falha ao instalar dependencias do backend"
    exit 1
fi
cd ..

echo ""
echo "Instalando dependencias do frontend..."
cd frontend
yarn install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO]${NC} Falha ao instalar dependencias do frontend"
    exit 1
fi
cd ..

echo ""
echo "===================================="
echo -e "  ${GREEN}Instalacao concluida com sucesso!${NC}"
echo "===================================="
echo ""
echo "Para iniciar em modo desenvolvimento:"
echo "  cd frontend"
echo "  yarn electron:dev"
echo ""
echo "Para gerar o instalador:"
echo "  Windows: yarn electron:build:win"
echo "  macOS:   yarn electron:build:mac"
echo "  Linux:   yarn electron:build:linux"
echo ""
