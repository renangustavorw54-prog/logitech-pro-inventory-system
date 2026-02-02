#!/bin/bash

echo "===================================="
echo "Controle Fácil de Estoque"
echo "===================================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não está instalado"
    echo "Baixe Docker em: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
    echo ""
    echo "IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!"
    read -p "Pressione Enter para continuar..."
fi

echo ""
echo "Iniciando o Docker Compose..."
docker-compose up -d

echo ""
echo "===================================="
echo "Sistema iniciado com sucesso!"
echo "===================================="
echo ""
echo "Acesse o sistema em: http://localhost:3000"
echo ""
echo "Para parar o sistema, execute: docker-compose down"
echo ""
