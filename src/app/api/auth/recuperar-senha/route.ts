import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import ResetSenha from '@/emails/ResetSenha'

const recuperarSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = recuperarSchema.safeParse(body)

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
      // Retorna sucesso por motivos de segurança, para não vazar se o e-mail existe
      return NextResponse.json(
        { message: 'E-mail de recuperação enviado' },
        { status: 200 }
      )
    }

    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/nova-senha?token=${resetToken}`

    await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@imopin.com.br',
      to: email,
      subject: 'Recuperação de Senha — ImoPin',
      react: ResetSenha({ name: user.name, url: resetUrl }),
    })

    return NextResponse.json(
      { message: 'E-mail de recuperação enviado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}
