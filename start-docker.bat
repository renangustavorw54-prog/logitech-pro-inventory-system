@echo off
REM Script de inicialização rápida para Windows

echo ====================================
echo Controle Fácil de Estoque
echo ====================================
echo.

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker não está instalado ou não está no PATH
    echo Baixe Docker em: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar se .env existe
if not exist .env (
    echo Criando arquivo .env...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!
    echo Pressione qualquer tecla para continuar...
    pause
)

echo.
echo Iniciando o Docker Compose...
docker-compose up -d

echo.
echo ====================================
echo Sistema iniciado com sucesso!
echo ====================================
echo.
echo Acesse o sistema em: http://localhost:3000
echo.
echo Para parar o sistema, execute: docker-compose down
echo.
pause
