import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/recuperar-senha/route'
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

describe('POST /api/auth/recuperar-senha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar 400 se o email for invalido', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ email: 'email-invalido' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('E-mail inválido')
  })

  it('deve retornar 200 (sucesso) e nao fazer nada se o email nao for cadastrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ email: 'inexistente@example.com' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toBe('E-mail de recuperação enviado')

    expect(prisma.user.update).not.toHaveBeenCalled()
    expect(resend.emails.send).not.toHaveBeenCalled()
  })

  it('deve gerar resetToken, salvar no banco e enviar e-mail de recuperacao se o usuario existir', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      name: 'Maria Silva',
      email: 'maria@example.com',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ email: 'maria@example.com' }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toBe('E-mail de recuperação enviado')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_id' },
      data: {
        resetToken: expect.any(String),
        resetTokenExpiry: expect.any(Date),
      },
    })

    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'maria@example.com',
        subject: 'Recuperação de Senha — ImoPin',
      })
    )
  })
})
