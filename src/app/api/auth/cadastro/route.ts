import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { cadastroSchema } from '@/lib/validations'
import ConfirmacaoEmail from '@/emails/ConfirmacaoEmail'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const validation = cadastroSchema.safeParse(body)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { name, email, phone, password } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const emailToken = crypto.randomUUID()
    const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        emailVerified: null,
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
      react: ConfirmacaoEmail({ name, url: confirmUrl }),
    })

    return NextResponse.json(
      { message: 'Usuário cadastrado com sucesso. Verifique seu e-mail.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}
