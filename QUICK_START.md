# Guia de Instalação Rápida: Controle Fácil de Estoque

## Opção 1: Deploy Online (Recomendado - Mais Rápido)

A forma mais fácil e rápida de começar é fazer o deploy online. Você não precisa instalar nada no seu computador!

### Via Railway (Recomendado)

1. Clique no botão **"Deploy on Railway"** no README.
2. O Railway vai abrir uma tela já configurada com o código e o banco de dados.
3. Clique em **"Deploy"** e pronto! O sistema fará tudo sozinho.

**Vantagens:** Sem instalação, acesso de qualquer lugar com internet, atualizações automáticas.

## Opção 2: Docker (Para Usar Localmente ou em Servidor)

Se você quer rodar o sistema no seu computador ou servidor, a forma mais simples é usar Docker.

### Pré-requisitos

- Docker instalado ([Baixar Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (geralmente já vem com o Docker)

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/renangustavorw54-prog/logitech-pro-inventory-system.git
cd logitech-pro-inventory-system
```

2. **Crie o arquivo `.env`:**
```bash
cp .env.example .env
```

3. **Edite o arquivo `.env` com suas configurações:**
```env
DATABASE_URL=mysql://root:senha123@db:3306/logitech_pro
JWT_SECRET=sua_chave_secreta_muito_longa
NODE_ENV=production
OWNER_OPEN_ID=seu_admin_id
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://seu-oauth.com
VITE_OAUTH_PORTAL_URL=https://seu-oauth-portal.com
```

4. **Inicie o Docker Compose:**
```bash
docker-compose up -d
```

5. **Acesse o sistema:**
Abra seu navegador e vá para `http://localhost:3000`

**Vantagens:** Funciona em qualquer lugar, fácil de gerenciar, escalável.

## Opção 3: Instalação Manual (Para Desenvolvedores)

Se você quer fazer tudo manualmente:

### Pré-requisitos

- Node.js 18+ ([Baixar Node.js](https://nodejs.org/))
- MySQL 8.0+ ([Baixar MySQL](https://www.mysql.com/downloads/))
- pnpm (`npm install -g pnpm`)

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/renangustavorw54-prog/logitech-pro-inventory-system.git
cd logitech-pro-inventory-system
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure o banco de dados:**
Crie um banco de dados MySQL chamado `logitech_pro` e anote suas credenciais.

4. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do banco de dados.

5. **Execute as migrações:**
```bash
pnpm db:push
```

6. **Inicie o servidor:**
```bash
pnpm dev
```

7. **Acesse o sistema:**
Abra seu navegador e vá para `http://localhost:3000`

## Primeiros Passos Após a Instalação

1. **Faça login:** Use suas credenciais de OAuth.
2. **Crie seu primeiro produto:** Vá para "Produtos" e clique em "Novo Produto".
3. **Registre movimentações:** Comece a registrar entradas e saídas de estoque.
4. **Monitore o dashboard:** Acompanhe seu estoque em tempo real.

## Precisa de Ajuda?

Se tiver dúvidas ou problemas:

1. Consulte o [README completo](README.md)
2. Abra uma [Issue no GitHub](https://github.com/renangustavorw54-prog/logitech-pro-inventory-system/issues)
3. Entre em contato: [seu contato aqui]

---

**Pronto para começar? Escolha a opção que melhor se adapta à sua necessidade e comece agora!**
