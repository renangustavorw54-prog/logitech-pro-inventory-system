# Guia de Deploy: Coloque o Sistema Online em 1 Clique

Escolha a plataforma que você prefere e comece a usar o **Controle Fácil de Estoque** online em minutos!

## 🚀 Opção 1: Railway (Recomendado - Mais Fácil)

Railway é a forma mais simples e rápida de colocar o sistema online. Tudo é configurado automaticamente!

### Passos:

1. **Clique no botão de deploy:**
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?repo=https://github.com/renangustavorw54-prog/logitech-pro-inventory-system)

2. **Conecte sua conta GitHub** (se não tiver, crie uma gratuitamente)

3. **Railway vai criar automaticamente:**
   - Um servidor para o sistema
   - Um banco de dados MySQL
   - Um domínio público para acessar

4. **Configure as variáveis obrigatórias:**
   - `JWT_SECRET` - Use uma senha forte (ex: `sua_chave_super_secreta_123`)
   - `OWNER_OPEN_ID` - Seu ID de usuário (pode ser qualquer valor único)
   - `VITE_APP_ID` - ID da aplicação (pode ser qualquer valor)

5. **Clique em "Deploy"** e aguarde 2-3 minutos

6. **Pronto!** Seu sistema estará online em um link como `seu-projeto.railway.app`

**Vantagens:**
- Sem complicações, tudo automático
- Banco de dados incluído
- Domínio público gratuito
- Suporte em português

---

## 🔵 Opção 2: Render (Alternativa)

Render é outra plataforma excelente para deploy rápido.

### Passos:

1. Acesse [Render.com](https://render.com)

2. Clique em **"New +"** → **"Web Service"**

3. Conecte seu repositório GitHub

4. Configure:
   - **Name:** `logitech-pro-inventory`
   - **Runtime:** Node
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`

5. Adicione as variáveis de ambiente (mesmas do Railway)

6. Clique em **"Create Web Service"**

**Vantagens:**
- Plano gratuito generoso
- Bom desempenho
- Fácil de usar

---

## 🟢 Opção 3: Vercel (Para Desenvolvedores)

Vercel é ideal se você quer máximo controle e performance.

### Passos:

1. Acesse [Vercel.com](https://vercel.com)

2. Clique em **"New Project"**

3. Importe seu repositório GitHub

4. Configure:
   - **Framework:** Other
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`

5. Adicione as variáveis de ambiente

6. Clique em **"Deploy"**

**Vantagens:**
- Excelente performance
- CDN global
- Escalabilidade automática

---

## 📋 Variáveis de Ambiente Necessárias

Todas as plataformas acima pedirão para você configurar estas variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do banco MySQL | Gerada automaticamente pela plataforma |
| `JWT_SECRET` | Chave de segurança | `sua_chave_super_secreta_123` |
| `NODE_ENV` | Ambiente | `production` |
| `OWNER_OPEN_ID` | ID do admin | `admin_user_123` |
| `VITE_APP_ID` | ID da app | `app_123` |
| `OAUTH_SERVER_URL` | (Opcional) URL OAuth | `https://seu-oauth.com` |
| `VITE_OAUTH_PORTAL_URL` | (Opcional) Portal OAuth | `https://seu-oauth-portal.com` |

---

## ✅ Após o Deploy

1. **Acesse seu sistema:** Clique no link gerado pela plataforma
2. **Faça login:** Use suas credenciais
3. **Comece a usar:** Cadastre seus produtos e movimentações

---

## 🆘 Problemas Comuns

### "Erro de conexão com o banco de dados"
- Verifique se a variável `DATABASE_URL` está configurada corretamente
- Aguarde 2-3 minutos para o banco ficar pronto

### "Página em branco ou erro 500"
- Verifique os logs da plataforma
- Certifique-se que `JWT_SECRET` está configurado
- Reinicie o deploy

### "Sistema muito lento"
- Planos gratuitos têm limitações
- Considere fazer upgrade para plano pago

---

## 💡 Dica de Ouro

**Para vender para seus clientes:**
1. Faça o deploy em uma das plataformas acima
2. Compartilhe o link com o cliente
3. Cliente acessa e vê o sistema funcionando em tempo real
4. Isso aumenta MUITO a confiança e a taxa de conversão!

---

**Precisa de ajuda?** Entre em contato conosco!
