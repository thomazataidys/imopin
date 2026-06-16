import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/reenviar-confirmacao/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

describe('POST /api/auth/reenviar-confirmacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar 400 se o email nao for fornecido ou for invalido', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reenviar-confirmacao', {
      method: 'POST',
      body: JSON.stringify({ email: 'email-invalido' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('E-mail inválido')
  })

  it('deve retornar 404 se o usuario nao for encontrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/auth/reenviar-confirmacao', {
      method: 'POST',
      body: JSON.stringify({ email: 'nao-existe@example.com' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Usuário não encontrado')
  })

  it('deve retornar 400 se o email ja estiver verificado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      email: 'verificado@example.com',
      emailVerified: new Date(),
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/reenviar-confirmacao', {
      method: 'POST',
      body: JSON.stringify({ email: 'verificado@example.com' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('E-mail já está verificado')
  })

  it('deve gerar novo token, salvar no banco e reenviar e-mail de confirmacao se nao estiver verificado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      name: 'João Silva',
      email: 'nao-verificado@example.com',
      emailVerified: null,
    } as any)

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user_id',
      email: 'nao-verificado@example.com',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/reenviar-confirmacao', {
      method: 'POST',
      body: JSON.stringify({ email: 'nao-verificado@example.com' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_id' },
      data: {
        emailToken: expect.any(String),
        emailTokenExpiry: expect.any(Date),
      },
    })

    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'nao-verificado@example.com',
        subject: 'Confirme seu e-mail no ImoPin',
      })
    )
  })
})
