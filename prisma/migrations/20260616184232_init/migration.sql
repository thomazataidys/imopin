-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Finalidade" AS ENUM ('ALUGAR', 'VENDER', 'ALUGAR_E_VENDER');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('RESIDENCIAL', 'COMERCIAL');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('APARTAMENTO', 'CASA', 'CASA_CONDOMINIO', 'CHACARA', 'COBERTURA', 'FLAT', 'KITNET', 'LOTE_TERRENO', 'SOBRADO', 'EDIFICIO', 'FAZENDA_SITIO', 'CONSULTORIO', 'GALPAO', 'IMOVEL_COMERCIAL', 'LOTE_COMERCIAL', 'PONTO_COMERCIAL');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('ATIVO', 'PAUSADO', 'ALUGADO', 'VENDIDO', 'EXCLUIDO');

-- CreateEnum
CREATE TYPE "MotivoDenuncia" AS ENUM ('INFO_FALSA', 'FOTO_INADEQUADA', 'CONTATO_INVALIDO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusDenuncia" AS ENUM ('PENDENTE', 'RESOLVIDA', 'IGNORADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "emailToken" TEXT,
    "emailTokenExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "finalidade" "Finalidade" NOT NULL,
    "tipoCategoria" "TipoCategoria" NOT NULL,
    "tipoImovel" "TipoImovel" NOT NULL,
    "status" "StatusImovel" NOT NULL DEFAULT 'ATIVO',
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL DEFAULT 'Pinheiro',
    "estado" TEXT NOT NULL DEFAULT 'MA',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "areaM2" DOUBLE PRECISION,
    "quartos" INTEGER NOT NULL DEFAULT 0,
    "banheiros" INTEGER NOT NULL DEFAULT 0,
    "vagas" INTEGER NOT NULL DEFAULT 0,
    "mobiliado" BOOLEAN NOT NULL DEFAULT false,
    "aceitaPets" BOOLEAN NOT NULL DEFAULT false,
    "piscina" BOOLEAN NOT NULL DEFAULT false,
    "churrasqueira" BOOLEAN NOT NULL DEFAULT false,
    "portaria" BOOLEAN NOT NULL DEFAULT false,
    "condominioFechado" BOOLEAN NOT NULL DEFAULT false,
    "precoAluguel" DOUBLE PRECISION,
    "precoVenda" DOUBLE PRECISION,
    "condominio" DOUBLE PRECISION,
    "iptu" DOUBLE PRECISION,
    "whatsapp" TEXT NOT NULL,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "ultimaInteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertaRenovacaoEnviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculdade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Faculdade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaculdadeImovel" (
    "imovelId" TEXT NOT NULL,
    "faculdadeId" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FaculdadeImovel_pkey" PRIMARY KEY ("imovelId","faculdadeId")
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "userId" TEXT,
    "motivo" "MotivoDenuncia" NOT NULL,
    "descricao" TEXT,
    "status" "StatusDenuncia" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnunciosSemana" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "semanaInicio" TIMESTAMP(3) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnunciosSemana_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailToken_key" ON "User"("emailToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "Imovel_userId_idx" ON "Imovel"("userId");

-- CreateIndex
CREATE INDEX "Imovel_status_idx" ON "Imovel"("status");

-- CreateIndex
CREATE INDEX "Imovel_bairro_idx" ON "Imovel"("bairro");

-- CreateIndex
CREATE INDEX "Imovel_finalidade_idx" ON "Imovel"("finalidade");

-- CreateIndex
CREATE INDEX "Imovel_tipoImovel_idx" ON "Imovel"("tipoImovel");

-- CreateIndex
CREATE INDEX "Imovel_precoAluguel_idx" ON "Imovel"("precoAluguel");

-- CreateIndex
CREATE INDEX "Imovel_precoVenda_idx" ON "Imovel"("precoVenda");

-- CreateIndex
CREATE INDEX "Foto_imovelId_idx" ON "Foto"("imovelId");

-- CreateIndex
CREATE INDEX "Favorito_userId_idx" ON "Favorito"("userId");

-- CreateIndex
CREATE INDEX "Favorito_imovelId_idx" ON "Favorito"("imovelId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_userId_imovelId_key" ON "Favorito"("userId", "imovelId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculdade_nome_key" ON "Faculdade"("nome");

-- CreateIndex
CREATE INDEX "FaculdadeImovel_faculdadeId_idx" ON "FaculdadeImovel"("faculdadeId");

-- CreateIndex
CREATE INDEX "Denuncia_imovelId_idx" ON "Denuncia"("imovelId");

-- CreateIndex
CREATE INDEX "Denuncia_status_idx" ON "Denuncia"("status");

-- CreateIndex
CREATE INDEX "AnunciosSemana_userId_idx" ON "AnunciosSemana"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnunciosSemana_userId_semanaInicio_key" ON "AnunciosSemana"("userId", "semanaInicio");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaculdadeImovel" ADD CONSTRAINT "FaculdadeImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaculdadeImovel" ADD CONSTRAINT "FaculdadeImovel_faculdadeId_fkey" FOREIGN KEY ("faculdadeId") REFERENCES "Faculdade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnunciosSemana" ADD CONSTRAINT "AnunciosSemana_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
