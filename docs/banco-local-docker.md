# Configuração de Banco de Dados Local com Docker

Este documento descreve o setup do banco de dados PostgreSQL executado localmente via Docker para o ambiente de desenvolvimento do ImoPin, eliminando a dependência direta do Neon na nuvem durante as fases de desenvolvimento e testes de interface.

---

## 1. Estrutura do Container Docker

Criamos o arquivo [docker-compose.yml](file:///home/tomy/projects/imopin/docker-compose.yml) na raiz do projeto com as seguintes definições do serviço:

*   **Imagem**: `postgres:16-alpine` (imagem leve e oficial)
*   **Porta**: Mapeamento da porta padrão `5432:5432`
*   **Volume de Persistência**: Criado o volume nomeado `postgres_data` mapeado para `/var/lib/postgresql/data` para reter os dados criados localmente após a reinicialização dos containers.
*   **Credenciais**:
    *   **Usuário**: `imopin_user`
    *   **Senha**: `imopin_password`
    *   **Nome do Banco**: `imopin`

---

## 2. Configurações Globais (.env.local)

A string de conexão local foi ajustada no arquivo `.env.local` para se conectar diretamente ao banco de dados do Docker:

```env
DATABASE_URL="postgresql://imopin_user:imopin_password@localhost:5432/imopin?schema=public"
```

Como removemos a dependência forçada do adaptador Neon localmente no arquivo [prisma.ts](file:///home/tomy/projects/imopin/src/lib/prisma.ts), o Prisma consegue se conectar via driver TCP nativo sem erros de WebSocket.

---

## 3. Instruções de Execução do Banco

Para inicializar a infraestrutura localmente e aplicar as migrações/popular o banco de dados:

1.  **Subir o Container do Banco de Dados**:
    ```bash
    docker compose up -d
    ```

2.  **Executar Migrações do Prisma**:
    Cria as tabelas mapeadas no banco local:
    ```bash
    pnpm prisma migrate dev
    ```

3.  **Popular o Banco (Seed)**:
    Insere dados pré-existentes (como faculdades locais e usuários administrativos):
    ```bash
    pnpm db:seed
    ```

4.  **Iniciar a Aplicação**:
    ```bash
    pnpm dev
    ```
