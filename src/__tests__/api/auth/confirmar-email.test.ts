import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/auth/confirmar-email/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('GET /api/auth/confirmar-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar 400 se nenhum token for fornecido', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/confirmar-email', {
      method: 'GET',
    })

    const response = await GET(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Token é obrigatório')
  })

  it('deve redirecionar para token-expirado se o token nao existir ou for invalido', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/auth/confirmar-email?token=invalid_token', {
      method: 'GET',
    })

    const response = await GET(req)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/token-expirado')
  })

  it('deve redirecionar para token-expirado se o token estiver expirado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      email: 'maria@example.com',
      emailTokenExpiry: new Date(Date.now() - 3600000), // Expirou há 1h
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/confirmar-email?token=expired_token', {
      method: 'GET',
    })

    const response = await GET(req)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/token-expirado')
  })

  it('deve atualizar o usuario como verificado, limpar o token e redirecionar para email-confirmado se o token for valido', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      email: 'maria@example.com',
      emailTokenExpiry: new Date(Date.now() + 3600000), // Válido por mais 1h
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/confirmar-email?token=valid_token', {
      method: 'GET',
    })

    const response = await GET(req)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/auth/email-confirmado')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_id' },
      data: {
        emailVerified: expect.any(Date),
        emailToken: null,
        emailTokenExpiry: null,
      },
    })
  })
})
