# ImoPin — Infraestrutura do Projeto

## Stack Tecnológico

| Camada | Tecnologia | Propósito |
|---|---|---|
| Frontend/Backend | Next.js 16 (App Router) + React 19 + TypeScript | Aplicação full-stack |
| Estilização | TailwindCSS 4 + shadcn/ui | Design system mobile-first |
| Banco de Dados | PostgreSQL (Neon) | Dados da plataforma |
| ORM | Prisma 7 | Modelagem e consultas ao banco |
| Autenticação | NextAuth v5 (Credentials + JWT) | Login e sessão |
| Storage de Imagens | Cloudflare R2 (S3-compatible) | Upload de fotos dos imóveis |
| E-mail Transacional | Resend + React Email | Confirmação, reset de senha, notificações |
| Validação | Zod 4 | Schemas de validação |
| Mapas | Leaflet + OpenStreetMap (futuro) | Localização dos imóveis |
| Deploy | Vercel (free tier) | Hospedagem |

## Estrutura do Projeto

```
imopin/
├── prisma/
│   ├── schema.prisma          ← Modelos do banco (8 tabelas + enums)
│   └── seed.ts                ← Popula faculdades e admin
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts  ← NextAuth handler
│   │   ├── layout.tsx          ← Root layout
│   │   ├── globals.css         ← Estilos globais Tailwind
│   │   └── page.tsx            ← Landing Page (placeholder)
│   ├── lib/
│   │   ├── auth.ts            ← Configuração do NextAuth
│   │   ├── prisma.ts          ← Prisma Client singleton
│   │   ├── r2.ts              ← Cliente Cloudflare R2 (S3)
│   │   ├── resend.ts          ← Cliente Resend
│   │   ├── validations.ts     ← Schemas Zod
│   │   └── utils.ts           ← Utilitários (cn, formatPrice, etc.)
│   ├── emails/                ← Templates React Email (futuro)
│   ├── hooks/                 ← Custom hooks (futuro)
│   ├── types/                 ← Tipos TypeScript (futuro)
│   └── proxy.ts               ← Proteção de rotas (Next.js 16)
├── .env.local                 ← Variáveis de ambiente
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Modelos do Banco (Prisma)

O schema em `prisma/schema.prisma` contém 8 modelos:

1. **User** — Usuários da plataforma (USER / ADMIN)
2. **Imovel** — Anúncios de imóveis com todos os atributos
3. **Foto** — Fotos dos imóveis (ordenadas, com r2Key)
4. **Favorito** — Favoritos (relação N:N User-Imovel, sem duplicatas)
5. **Faculdade** — Faculdades de Pinheiro (para filtro "perto de faculdade")
6. **FaculdadeImovel** — Distância entre imóvel e faculdade
7. **Denuncia** — Denúncias de anúncios
8. **AnunciosSemana** — Controle de limite de 10 anúncios/semana

## O que você precisa configurar manualmente

### 1. Neon (Banco de Dados)
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um projeto (região: US East ou SA)
3. Copie a `DATABASE_URL` da aba Connection Details
4. Coloque no `.env.local`

### 2. Cloudflare R2 (Storage de Imagens)
1. Crie uma conta em [cloudflare.com](https://cloudflare.com)
2. Acesse R2 > Create Bucket > `imopin-fotos`
3. Vá em R2 > Manage R2 API Tokens > Create API Token
   - Permissão: **Object Read & Write**
4. Copie:
   - `R2_ACCOUNT_ID` (encontra na URL do dashboard)
   - `R2_ACCESS_KEY_ID` (gerado no token)
   - `R2_SECRET_ACCESS_KEY` (gerado no token)
5. No bucket, vá em Settings > Public Access > **Allow public access**
   - Copie a `R2_PUBLIC_URL` (ex: `https://pub-xxxxx.r2.dev`)

### 3. Resend (E-mail)
1. Crie uma conta em [resend.com](https://resend.com)
2. Adicione e verifique um domínio (ex: `imopin.com.br`)
3. Gere uma API key em API Keys
4. Coloque `RESEND_API_KEY` no `.env.local`
5. Configure `RESEND_FROM` com um e-mail do seu domínio verificado

### 4. NextAuth Secret
Gere uma chave secreta:
```bash
openssl rand -base64 32
```
Coloque em `NEXTAUTH_SECRET` no `.env.local`

### 5. Variáveis de Ambiente Finais
Confira que `.env.local` tem todos os valores preenchidos:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=imopin-fotos
R2_PUBLIC_URL=...
RESEND_API_KEY=re_...
RESEND_FROM=noreply@imopin.com.br
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Comandos para rodar após configurar

```bash
# Gerar migrations e aplicar no banco
pnpm db:migrate --name init

# Popular banco com faculdades + admin
pnpm db:seed

# Iniciar dev server
pnpm dev
```

## Admin padrão (após seed)
- **E-mail:** admin@imopin.com.br
- **Senha:** Admin@123

## Observações Técnicas (Next.js 16)

- **proxy.ts** substitui o antigo `middleware.ts` (breaking change do Next.js 16)
- **params** em route handlers e page components são `Promise` e precisam de `await`
- **cookies()** e **headers()** de `next/headers` exigem `await`
- **Turbopack** é o bundler padrão
- **shadcn/ui** ainda não foi instalado (será na Fase 2+)
