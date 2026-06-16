import { PrismaClient, Role } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@imopin.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@imopin.com.br',
      phone: '(98) 99999-0000',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })

  console.log('Admin criado:', admin.email)

  const faculdades = [
    { nome: 'IESMA - Instituto de Educação Superior do Maranhão', lat: -2.5214, lng: -44.1042 },
    { nome: 'UEMA Pinheiro - Universidade Estadual do Maranhão', lat: -2.5231, lng: -44.1025 },
    { nome: 'FAMA - Faculdade do Maranhão', lat: -2.5200, lng: -44.1060 },
  ]

  for (const f of faculdades) {
    const faculdade = await prisma.faculdade.upsert({
      where: { nome: f.nome },
      update: {},
      create: {
        nome: f.nome,
        lat: f.lat,
        lng: f.lng,
      },
    })
    console.log('Faculdade criada:', faculdade.nome)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
