## Pending Commands — Configurar e inicializar o banco de dados PostgreSQL local via Docker

### Install
```bash
none
```

### Run
```bash
docker compose up -d && pnpm prisma migrate dev && pnpm db:seed && pnpm dev
```

### Notes
É necessário ter o Docker e o Docker Compose instalados na máquina para subir o banco localmente.
