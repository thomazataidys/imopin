import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/nova-senha/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}))

describe('POST /api/auth/nova-senha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar 400 se os dados de entrada forem invalidos', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/nova-senha', {
      method: 'POST',
      body: JSON.stringify({
        token: '',
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
    const req = new NextRequest('http://localhost:3000/api/auth/nova-senha', {
      method: 'POST',
      body: JSON.stringify({
        token: 'some_token',
        password: 'newpassword123',
        confirmPassword: 'different123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.errors.confirmPassword).toContain('Senhas não conferem')
  })

  it('deve retornar 400 se o token for inexistente ou expirado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null) // Token inválido

    const req = new NextRequest('http://localhost:3000/api/auth/nova-senha', {
      method: 'POST',
      body: JSON.stringify({
        token: 'invalid_token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Token inválido ou expirado')
  })

  it('deve retornar 400 se o token estiver expirado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      resetTokenExpiry: new Date(Date.now() - 3600000), // Expirou há 1h
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/nova-senha', {
      method: 'POST',
      body: JSON.stringify({
        token: 'expired_token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Token inválido ou expirado')
  })

  it('deve atualizar a senha com sucesso, encriptar e limpar tokens', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_id',
      resetTokenExpiry: new Date(Date.now() + 3600000), // Válido por mais 1h
    } as any)

    const req = new NextRequest('http://localhost:3000/api/auth/nova-senha', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid_token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toBe('Senha redefinida com sucesso')

    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_id' },
      data: {
        passwordHash: 'new_hashed_password',
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
  })
})
