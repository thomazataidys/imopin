import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/cadastro/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import bcrypt from 'bcryptjs'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email_id' }),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}))

describe('POST /api/auth/cadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar 400 se os dados de entrada forem invalidos', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'email-invalido',
        phone: '123',
        password: '123',
        confirmPassword: '123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('errors')
  })

  it('deve retornar 400 se as senhas nao conferirem', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '(98) 99999-9999',
        password: 'password123',
        confirmPassword: 'different123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.errors.confirmPassword).toContain('Senhas não conferem')
  })

  it('deve retornar 409 se o email ja estiver cadastrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing_user_id',
      email: 'maria@example.com',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '(98) 99999-9999',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toBe('E-mail já cadastrado')
  })

  it('deve cadastrar o usuario, gerar hash da senha, criar token e enviar e-mail de confirmacao', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new_user_id',
      name: 'Maria Silva',
      email: 'maria@example.com',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '(98) 99999-9999',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(201)

    // Verifica hash
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)

    // Verifica criacao no prisma
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Maria Silva',
          email: 'maria@example.com',
          phone: '(98) 99999-9999',
          passwordHash: 'hashed_password',
          emailVerified: null,
          emailToken: expect.any(String),
          emailTokenExpiry: expect.any(Date),
        }),
      })
    )

    // Verifica envio de email
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'maria@example.com',
        subject: 'Confirme seu e-mail no ImoPin',
      })
    )
  })
})
