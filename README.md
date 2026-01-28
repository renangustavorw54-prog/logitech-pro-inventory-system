# 🚀 LogiTech Pro - Sistema de Gestão de Estoque

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?repo=https://github.com/renangustavorw54-prog/logitech-pro-inventory-system)

## 🌐 Como colocar o sistema no ar (O Jeito Mais Fácil)

1. Clique no botão **"Deploy on Railway"** acima.
2. O Railway vai abrir uma tela já configurada com:
   - O código do sistema.
   - O banco de dados MySQL.
   - Todas as variáveis necessárias.
3. Clique em **"Deploy"** e pronto! O sistema fará tudo sozinho.

---

## 🛠️ Configuração Manual (Se preferir)

Se você já criou o projeto manualmente:
1. No painel do Railway, adicione um serviço **MySQL**.
2. Nas variáveis do sistema, garanta que existe a `DATABASE_URL` (o Railway coloca sozinho).
3. Adicione manualmente a variável `JWT_SECRET` com qualquer senha.
4. Em **Settings > Networking**, clique em **Generate Domain** para ganhar seu link.

## 🛠️ Variáveis de Ambiente Necessárias
Certifique-se de configurar estas variáveis no painel do Railway:
- `DATABASE_URL`: (Gerada automaticamente pelo Railway ao adicionar MySQL)
- `JWT_SECRET`: Uma senha forte para segurança dos tokens.
- `NODE_ENV`: production
- `OWNER_OPEN_ID`: Seu ID de administrador.

---

![LogiTech Pro](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)

Um sistema profissional e moderno de gerenciamento de estoque com dashboard em tempo real, desenvolvido com tecnologias de ponta para pequenas e médias empresas. LogiTech Pro oferece controle completo sobre seu inventário com interface intuitiva, relatórios detalhados e alertas automáticos.

## 🎯 Características Principais

**Dashboard em Tempo Real**
- Visualização instantânea do total de produtos cadastrados
- Indicador de itens com estoque abaixo do mínimo
- Cálculo automático do valor total do inventário
- Gráficos de movimentações recentes

**Gerenciamento de Produtos**
- CRUD completo (criar, ler, atualizar, deletar)
- Organização por categorias customizáveis
- Rastreamento de quantidade e estoque mínimo
- Precificação unitária com suporte a múltiplas moedas

**Sistema de Movimentações**
- Registro de entradas e saídas de estoque
- Validação automática de quantidade disponível
- Histórico detalhado com timestamps e responsáveis
- Notas e observações para cada movimentação

**Alertas e Notificações**
- Alertas visuais para estoque crítico
- Notificações automáticas ao proprietário
- Identificação de produtos esgotados
- Listagem de itens abaixo do estoque mínimo

**Relatórios e Análises**
- Gráficos interativos de consumo
- Análise de produtos mais movimentados
- Relatórios por período customizável
- Distribuição de entradas vs saídas

**Interface Profissional**
- Design responsivo (desktop, tablet, mobile)
- Tema corporativo em tons de azul
- Navegação intuitiva com sidebar
- Autenticação segura integrada

## 🚀 Começando

### Requisitos do Sistema

- Node.js 18+ ou superior
- npm, yarn ou pnpm como gerenciador de pacotes
- Banco de dados MySQL 8.0+ ou TiDB
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação Rápida

1. **Clone o repositório:**
```bash
git clone https://github.com/renangustavorw54-prog/logitech-pro-inventory-system.git
cd logitech-pro-inventory-system
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais de banco de dados e configurações OAuth.

4. **Execute as migrações do banco de dados:**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## 📖 Guia de Uso

### Primeiro Acesso

1. Acesse a aplicação através da URL fornecida
2. Faça login usando suas credenciais OAuth
3. Será automaticamente redirecionado para o dashboard

### Navegação Principal

A barra lateral esquerda oferece acesso às principais funcionalidades:

- **Dashboard** - Visão geral do estoque em tempo real
- **Produtos** - Gerenciamento completo de inventário
- **Categorias** - Organização de produtos por tipo
- **Movimentações** - Registro de entradas e saídas
- **Histórico** - Consulta de transações passadas
- **Alertas** - Monitoramento de estoque crítico
- **Relatórios** - Análises e gráficos de desempenho
- **Financeiro & Probabilidades** - Análise de ROI, custo e previsões de venda

### Criando seu Primeiro Produto

1. Acesse a página **Produtos**
2. Clique em **Novo Produto**
3. Preencha os campos obrigatórios:
   - Nome do produto
   - Quantidade inicial
   - Estoque mínimo (para alertas)
   - Preço unitário
4. Selecione uma categoria (opcional)
5. Clique em **Criar**

### Registrando Movimentações

**Entrada de Estoque:**
1. Acesse **Movimentações**
2. Clique em **Registrar Entrada**
3. Selecione o produto
4. Informe a quantidade
5. Adicione observações se necessário
6. Confirme o registro

**Saída de Estoque:**
1. Acesse **Movimentações**
2. Clique em **Registrar Saída**
3. Selecione o produto
4. Informe a quantidade (será validada)
5. Adicione motivo da saída
6. Confirme o registro

### Monitorando Alertas

A página **Alertas** exibe em tempo real:
- Produtos com estoque zerado (crítico)
- Produtos abaixo do estoque mínimo
- Diferença entre estoque atual e mínimo
- Status visual de cada item

### Gerando Relatórios

1. Acesse **Relatórios**
2. Selecione o período desejado
3. Visualize gráficos interativos de:
   - Distribuição de entradas vs saídas
   - Produtos mais movimentados
   - Tendências de consumo
4. Use a opção **Exportar PDF** para gerar documentos

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/logitech_pro

# Autenticação OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.oauth.provider.com
VITE_OAUTH_PORTAL_URL=https://login.oauth.provider.com

# Segurança
JWT_SECRET=sua_chave_secreta_muito_longa

# Proprietário
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu_open_id
```

### Estrutura do Projeto

```
logitech-pro-inventory-system/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e hooks
│   │   └── App.tsx        # Roteamento principal
│   └── index.html         # HTML raiz
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # Definição de procedures
│   ├── db.ts              # Helpers de banco de dados
│   └── _core/             # Infraestrutura interna
├── drizzle/               # Schema e migrações
│   └── schema.ts          # Definição de tabelas
└── package.json           # Dependências do projeto
```

## 🧪 Testes

Execute a suíte de testes com:

```bash
pnpm test
```

Os testes cobrem:
- Procedures de produtos (CRUD)
- Procedures de categorias
- Procedures de movimentações
- Estatísticas do dashboard

## 📊 Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 19+ |
| Styling | Tailwind CSS | 4+ |
| UI Components | Radix UI + shadcn/ui | Latest |
| Backend | Express.js | 4+ |
| API | tRPC | 11+ |
| Database | Drizzle ORM | 0.44+ |
| Database | MySQL / TiDB | 8.0+ |
| Gráficos | Recharts | 2.15+ |
| Autenticação | OAuth 2.0 | - |

## 🔐 Segurança

LogiTech Pro implementa as melhores práticas de segurança:

- **Autenticação OAuth 2.0** - Integração segura com provedores de identidade
- **Validação de Entrada** - Sanitização de todos os dados de entrada
- **Proteção CSRF** - Tokens CSRF em operações sensíveis
- **HTTPS Obrigatório** - Criptografia de dados em trânsito
- **Controle de Acesso** - Validação de permissões em procedures
- **Senhas Seguras** - Hashing com JWT para sessões

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Suporte e Contribuições

Para reportar bugs, sugestões ou contribuições:

1. Abra uma [Issue](https://github.com/renangustavorw54-prog/logitech-pro-inventory-system/issues)
2. Descreva o problema ou sugestão em detalhes
3. Inclua exemplos ou screenshots se aplicável

## 📧 Contato

Para dúvidas comerciais, licenciamento ou parcerias:
- Email: contato@logitech-pro.com
- Website: www.logitech-pro.com

## 🎉 Roadmap Futuro

- [x] Exportação de relatórios em PDF e Excel
- [x] Sistema de códigos de barras/QR code
- [x] Controle de permissões por usuário (RBAC)
- [x] Alertas automáticos de estoque crítico
- [x] Análise de giro de produtos
- [x] Gestão de Banca e Financeiro (ROI, Custo, Lucro Potencial)
- [x] Análise de Probabilidades de Venda e Nível de Risco
- [ ] Gerenciamento de fornecedores
- [ ] Integração com sistemas de pagamento
- [ ] App mobile nativo (iOS/Android)
- [ ] API REST pública para integrações
- [ ] Backup automático em nuvem
- [ ] Suporte multi-idioma
- [ ] Auditoria completa de operações

---

**LogiTech Pro** - Transformando a gestão de estoque em simplicidade e eficiência.

Desenvolvido com ❤️ para empresas que querem crescer com inteligência.
