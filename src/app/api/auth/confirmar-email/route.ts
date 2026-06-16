import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { emailToken: token },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/token-expirado', baseUrl))
    }

    if (!user.emailTokenExpiry || user.emailTokenExpiry < new Date()) {
      return NextResponse.redirect(new URL('/auth/token-expirado', baseUrl))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailToken: null,
        emailTokenExpiry: null,
      },
    })

    return NextResponse.redirect(new URL('/auth/email-confirmado', baseUrl))
  } catch (error) {
    console.error('Erro ao confirmar e-mail:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}
