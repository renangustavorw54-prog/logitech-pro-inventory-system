# Guia de Instalação - LogiTech Pro

Este documento fornece instruções passo a passo para instalar e configurar o LogiTech Pro em diferentes ambientes.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Local](#instalação-local)
3. [Instalação em Produção](#instalação-em-produção)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Configuração OAuth](#configuração-oauth)
6. [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Software Necessário

- **Node.js**: versão 18.0 ou superior
  - [Download Node.js](https://nodejs.org/)
  - Verifique a instalação: `node --version`

- **Git**: para clonar o repositório
  - [Download Git](https://git-scm.com/)
  - Verifique a instalação: `git --version`

- **Gerenciador de Pacotes**: recomendamos pnpm
  - Instale globalmente: `npm install -g pnpm`
  - Verifique a instalação: `pnpm --version`

- **Banco de Dados**: MySQL 8.0+ ou TiDB
  - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
  - Ou use [TiDB Cloud](https://tidbcloud.com/) para hospedagem em nuvem

### Conhecimentos Recomendados

- Familiaridade com linha de comando
- Noções básicas de Git
- Entendimento de variáveis de ambiente
- Conhecimento básico de bancos de dados

## Instalação Local

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/renangustavorw54-prog/logitech-pro-inventory-system.git
cd logitech-pro-inventory-system
```

### Passo 2: Instalar Dependências

```bash
pnpm install
```

Isso instalará todas as dependências do projeto listadas em `package.json`.

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/logitech_pro

# OAuth (obtenha esses valores do seu provedor OAuth)
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.seu-oauth-provider.com
VITE_OAUTH_PORTAL_URL=https://login.seu-oauth-provider.com

# Segurança
JWT_SECRET=gere_uma_chave_secreta_muito_longa_e_aleatoria

# Proprietário
OWNER_NAME=Seu Nome Completo
OWNER_OPEN_ID=seu_open_id_do_oauth
```

### Passo 4: Configurar Banco de Dados

**Opção A: MySQL Local**

```bash
# Acesse o MySQL
mysql -u root -p

# Crie o banco de dados
CREATE DATABASE logitech_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crie um usuário (opcional, mas recomendado)
CREATE USER 'logitech'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON logitech_pro.* TO 'logitech'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Atualize a `DATABASE_URL` no `.env`:
```env
DATABASE_URL=mysql://logitech:sua_senha_segura@localhost:3306/logitech_pro
```

**Opção B: TiDB Cloud**

1. Crie uma conta em [tidbcloud.com](https://tidbcloud.com/)
2. Crie um novo cluster
3. Copie a string de conexão fornecida
4. Atualize a `DATABASE_URL` no `.env`

### Passo 5: Executar Migrações

```bash
pnpm db:push
```

Isso criará todas as tabelas necessárias no banco de dados.

### Passo 6: Iniciar o Servidor

```bash
pnpm dev
```

O servidor iniciará em `http://localhost:3000`

Você verá uma saída similar a:
```
[OAuth] Initialized with baseURL: https://api.oauth.provider.com
Server running on http://localhost:3000/
```

### Passo 7: Acessar a Aplicação

Abra seu navegador e acesse: `http://localhost:3000`

Você será redirecionado para fazer login através do OAuth.

## Instalação em Produção

### Pré-requisitos Adicionais

- Servidor com Node.js instalado (VPS, AWS EC2, DigitalOcean, etc.)
- Domínio próprio (ex: logitech-pro.com)
- Certificado SSL/TLS
- Banco de dados MySQL hospedado (AWS RDS, TiDB Cloud, etc.)

### Passo 1: Preparar o Servidor

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instale pnpm
npm install -g pnpm

# Crie um usuário para a aplicação
sudo useradd -m -s /bin/bash logitech
sudo su - logitech
```

### Passo 2: Clonar e Configurar

```bash
# Clone o repositório
git clone https://github.com/renangustavorw54-prog/logitech-pro-inventory-system.git
cd logitech-pro-inventory-system

# Instale dependências
pnpm install

# Configure variáveis de ambiente
nano .env
```

Certifique-se de que `DATABASE_URL` aponta para seu banco de dados de produção.

### Passo 3: Build para Produção

```bash
pnpm build
```

Isso criará os arquivos otimizados em `dist/`.

### Passo 4: Configurar PM2 (Gerenciador de Processos)

```bash
# Instale PM2 globalmente
sudo npm install -g pm2

# Crie arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'logitech-pro',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Inicie a aplicação
pm2 start ecosystem.config.js

# Configure para iniciar automaticamente
pm2 startup
pm2 save
```

### Passo 5: Configurar Nginx (Reverse Proxy)

```bash
# Instale Nginx
sudo apt install -y nginx

# Crie arquivo de configuração
sudo nano /etc/nginx/sites-available/logitech-pro
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ative a configuração
sudo ln -s /etc/nginx/sites-available/logitech-pro /etc/nginx/sites-enabled/

# Teste a configuração
sudo nginx -t

# Reinicie Nginx
sudo systemctl restart nginx
```

### Passo 6: Configurar SSL com Certbot

```bash
# Instale Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gere certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Configure renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Configuração do Banco de Dados

### Backup Regular

```bash
# Backup manual
mysqldump -u usuario -p logitech_pro > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u usuario -p logitech_pro < backup_20260125.sql
```

### Monitoramento

```bash
# Verificar tamanho do banco
mysql -u usuario -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'logitech_pro';"
```

## Configuração OAuth

### Configurar com Manus OAuth

1. Acesse o painel de controle do Manus
2. Crie uma nova aplicação OAuth
3. Configure a URL de callback: `https://seu-dominio.com/api/oauth/callback`
4. Copie o `App ID` e configure no `.env`
5. Obtenha a URL do servidor OAuth e portal de login

### Configurar com Outro Provedor

Siga a documentação do seu provedor OAuth e atualize as variáveis:
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpe node_modules e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Connection refused" ao banco de dados

Verifique:
1. Se o MySQL está rodando: `sudo systemctl status mysql`
2. Se a `DATABASE_URL` está correta
3. Se o usuário tem permissões: `mysql -u usuario -p`

### Erro: "OAuth callback failed"

1. Verifique se a URL de callback está configurada corretamente
2. Confirme que `VITE_APP_ID` está correto
3. Verifique se `OAUTH_SERVER_URL` é acessível

### Porta 3000 já está em uso

```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo (substitua PID)
kill -9 PID

# Ou use uma porta diferente
PORT=3001 pnpm dev
```

### Aplicação lenta em produção

1. Verifique os logs: `pm2 logs logitech-pro`
2. Aumente os recursos do servidor
3. Otimize queries do banco de dados
4. Ative cache de banco de dados

## Próximos Passos

Após a instalação bem-sucedida:

1. Crie sua primeira categoria
2. Adicione alguns produtos de teste
3. Registre movimentações de teste
4. Explore os relatórios e alertas
5. Configure notificações por email (se disponível)

Para suporte adicional, consulte a [documentação principal](README.md) ou abra uma [issue](https://github.com/renangustavorw54-prog/logitech-pro-inventory-system/issues).
