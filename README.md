# 📱 WhatsApp Template Manager

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Gerencie templates de mensagens do **WhatsApp Business** diretamente pela [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) — sem precisar acessar o painel Meta Business Suite.

Interface visual, didatica e em **portugues**, pensada para usuarios nao-tecnicos.

---

## ✨ Features

- 🔐 **Autenticacao segura** — login com senha via `.env`, sessao JWT em cookie HttpOnly
- 👥 **Multi-contas** — gerencie varios WABAs (WhatsApp Business Accounts) no mesmo painel
- 🔒 **Credenciais criptografadas** — Access Token da Meta salvo com AES-256-GCM no SQLite
- 📋 **Listagem visual** — templates em cards com mini-preview do WhatsApp
- 🎨 **Editor visual** — monte o template vendo o preview em tempo real no formato do WhatsApp
- 📱 **Preview realista** — moldura de iPhone simulando conversa real do WhatsApp
- 🏷️ **Variaveis com destaque** — `{{1}}` aparece como badge azul, exemplos como texto sublinhado
- 📝 **Formatacao WhatsApp** — negrito (`**texto**`), italico (`*texto*`), tachado (`~texto~`), codigo
- ↔️ **Drag & drop** — reordene os botoes arrastando
- 🚦 **Status em tempo real** — chips coloridos: Aprovado, Pendente, Rejeitado, Pausado, Desativado
- ❌ **Motivo da rejeicao** — exibido inline quando o template e recusado pela Meta
- 🔍 **Filtros rapidos** — clique nos chips de status para filtrar
- ✅ **Validacao** — Zod no client e server, erros inline nos campos
- 🌐 **Responsivo** — desktop-first, funcional em tablets

---

## 🛠 Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Banco | SQLite (better-sqlite3) |
| Formularios | React Hook Form + Zod |
| Estado | Zustand |
| Drag & Drop | @dnd-kit |
| Notificacoes | Sonner (toast) |
| Auth | JWT (jose) + HMAC timing-safe |
| Criptografia | AES-256-GCM (Node crypto) |
| Icones | Lucide React |
| Fonte | Montserrat (Google Fonts) |

---

## 📋 Pre-requisitos

- **Node.js** 18+
- **npm** 9+
- Uma conta no [Meta Business Suite](https://business.facebook.com/) com:
  - WhatsApp Business Account (WABA)
  - Numero de telefone vinculado
  - Access Token com permissoes `whatsapp_business_messaging` e `whatsapp_business_management`

---

## 🚀 Instalacao

```bash
# 1. Clone o repositorio
git clone https://github.com/seu-usuario/waba-manager.git
cd waba-manager

# 2. Configure as variaveis de ambiente
cp .env.example .env.local
# Edite .env.local e defina:
#   APP_PASSWORD — senha para acessar o painel
#   SESSION_SECRET — gere com: openssl rand -base64 32

# 3. Instale as dependencias
npm install

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** — a senha padrao e a que voce definiu em `APP_PASSWORD`.

---

## ⚙️ Configuracao

### 1. Login

Acesse `/login` e digite a senha definida em `APP_PASSWORD`.

### 2. Adicionar conta Meta

Vá em **Configuracoes** (`/settings`) e clique em **Adicionar Conta**:

| Campo | Descricao |
|-------|-----------|
| Nome | Um nome amigavel (ex: "Empresa XYZ") |
| Access Token | Token da Meta com permissoes de template |
| WABA ID | ID da WhatsApp Business Account |
| Phone Number ID | ID do numero de telefone |

Clique em **Validar** para testar as credenciais, depois em **Ativar** para usar essa conta.

### 3. Criar template

Va em **Templates** e clique em **Novo Template**. Preencha:

- **Nome**: apenas letras minusculas, numeros e underscore (ex: `boas_vindas_cliente`)
- **Categoria**: Marketing, Utilidade ou Autenticacao
- **Idioma**: Portugues, Ingles, Espanhol, etc.

Depois monte os componentes visualmente arrastando e editando:

- **Cabecalho** (opcional) — titulo, imagem, video, documento ou localizacao
- **Corpo** (obrigatorio) — texto da mensagem com variaveis `{{1}}`, `{{2}}`...
- **Rodape** (opcional) — texto pequeno no final
- **Botoes** (opcional) — resposta rapida, link, telefone, OTP

O **preview atualiza em tempo real** no formato do WhatsApp.

---

## 📁 Estrutura do Projeto

```
waba-manager/
├── app/
│   ├── (dashboard)/              # Rotas protegidas (com header)
│   │   ├── templates/            # Lista, criar, editar, detalhes
│   │   └── settings/             # Gerenciar contas Meta
│   ├── api/                      # Route handlers (server-side proxy)
│   │   ├── auth/                 # Login/logout (JWT)
│   │   ├── accounts/             # CRUD de contas Meta
│   │   └── templates/            # CRUD de templates (Meta API)
│   ├── login/                    # Pagina de login
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Estilos globais
├── components/
│   ├── layout/                   # AppHeader
│   └── templates/                # TemplateList, TemplateCard, TemplateForm,
│       │                          # TemplatePreview, StatusPill, etc.
│       └── ComponentEditor/      # HeaderEditor, BodyEditor, FooterEditor, ButtonsEditor
├── lib/
│   ├── db.ts                     # SQLite connection
│   ├── crypto.ts                 # AES-256-GCM encrypt/decrypt
│   ├── credentials.ts            # CRUD contas Meta + conta ativa
│   ├── meta-api.ts               # Wrapper da Meta Cloud API
│   ├── validations.ts            # Schemas Zod
│   └── stores/                   # Zustand store
├── types/
│   └── meta.ts                   # Tipos TypeScript
├── middleware.ts                  # Auth middleware JWT
├── .env.example                   # Template de variaveis
└── package.json
```

---

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para saber como contribuir com o projeto.

---

## 📄 Licenca

Este projeto esta sob a licenca MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

---

## ⚠️ Seguranca

- O **Access Token** da Meta **nunca** e exposto no client-side
- Todas as chamadas a Meta API passam por **Route Handlers** do Next.js (server-side)
- As credenciais sao criptografadas com **AES-256-GCM** antes de serem salvas no SQLite
- A sessao JWT usa cookie **HttpOnly + SameSite Strict**
- A senha de login usa comparacao **HMAC timing-safe** com delay anti brute-force

---

## 📝 Notas

- A Meta pode levar ate **24 horas** para aprovar um template
- Templates com status `PENDING` nao podem ser editados
- Ao editar um template aprovado, ele volta para `PENDING`
- O banco SQLite e criado automaticamente na primeira execucao (pasta `data/`)
