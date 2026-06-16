import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import ConfirmacaoEmail from '@/emails/ConfirmacaoEmail'

const reenviarSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = reenviarSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'E-mail já está verificado' },
        { status: 400 }
      )
    }

    const emailToken = crypto.randomUUID()
    const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailToken,
        emailTokenExpiry,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const confirmUrl = `${baseUrl}/api/auth/confirmar-email?token=${emailToken}`

    await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@imopin.com.br',
      to: email,
      subject: 'Confirme seu e-mail no ImoPin',
      react: ConfirmacaoEmail({ name: user.name, url: confirmUrl }),
    })

    return NextResponse.json(
      { message: 'E-mail de confirmação reenviado com sucesso.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}
