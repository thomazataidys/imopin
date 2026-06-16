# Banco de Dados Local (Docker)

## Motivação

Enquanto o projeto está em desenvolvimento, usamos **PostgreSQL via Docker** localmente. Isso evita depender de serviços externos (Neon) durante a fase de construção, acelera o ciclo de desenvolvimento e não gera custos.

Em produção, a troca para Neon (ou outro serviço gerenciado) é simples: muda a `DATABASE_URL` e o adaptador do Prisma.

## Stack Local

| Componente | Tecnologia |
|---|---|
| Banco | PostgreSQL 16 Alpine (Docker) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Driver Node | `pg` (node-postgres) |
| Porta | `5432` (container) |

> **Nota:** O adaptador `@prisma/adapter-pg` conecta via protocolo TCP padrão do PostgreSQL, diferente do `@prisma/adapter-neon` que usa WebSocket (só funciona com Neon serverless).

## Docker Compose

O arquivo `docker-compose.yml` na raiz do projeto define o serviço:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: imopin_postgres
    restart: always
    environment:
      POSTGRES_USER: imopin_user
      POSTGRES_PASSWORD: imopin_password
      POSTGRES_DB: imopin
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Comandos

```bash
# Subir o banco
docker compose up -d

# Parar o banco
docker compose down

# Parar e apagar dados (reset)
docker compose down -v
```

## Scripts do Projeto

Os scripts estão no `package.json`:

```bash
pnpm db:migrate   # prisma migrate dev (cria migrations + aplica)
pnpm db:seed      # prisma db seed (popula faculdades + admin)
pnpm db:studio    # prisma studio (UI do banco)
```

## Fluxo Completo para Iniciar

```bash
# 1. Subir o container
docker compose up -d

# 2. Criar migration + aplicar no banco
npx prisma migrate dev --name init

# 3. Popular com dados iniciais
pnpm db:seed

# 4. Iniciar dev server
pnpm dev
```

## Conexão

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://imopin_user:imopin_password@localhost:5432/imopin?schema=public` |
| Host | `localhost` |
| Porta | `5432` |
| Database | `imopin` |
| User | `imopin_user` |
| Password | `imopin_password` |

## Migrando para Produção (Neon)

Quando for fazer o deploy, o processo é:

1. Criar projeto no [Neon](https://neon.tech)
2. Copiar a `DATABASE_URL` do Neon
3. Trocar o adaptador no `src/lib/prisma.ts`:

```ts
// Antes (local)
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// Depois (Neon)
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
```

4. Instalar o pacote: `pnpm add @prisma/adapter-neon @neondatabase/serverless`
5. Remover `@prisma/adapter-pg` e `pg` se quiser
6. Atualizar `DATABASE_URL` no ambiente da Vercel
