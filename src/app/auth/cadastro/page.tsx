'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { applyPhoneMask } from '@/lib/phoneMask'
import { cadastroSchema } from '@/lib/validations'

export default function CadastroPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  
  const [isValidForm, setIsValidForm] = useState(false)

  // Validação em tempo real para habilitar/desabilitar o botão
  useEffect(() => {
    const result = cadastroSchema.safeParse({
      name,
      phone,
      email,
      password,
      confirmPassword,
    })
    setIsValidForm(result.success)
  }, [name, phone, email, password, confirmPassword])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(applyPhoneMask(e.target.value))
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError('')

    // Validação final com Zod
    const validation = cadastroSchema.safeParse({
      name,
      phone,
      email,
      password,
      confirmPassword,
    })

    if (!validation.success) {
      const zErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        zErrors[path] = issue.message
      })
      setErrors(zErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else if (data.error) {
          setGeneralError(data.error)
        } else {
          setGeneralError('Ocorreu um erro ao realizar o cadastro.')
        }
        return
      }

      // Sucesso: Redireciona para tela de confirmação de e-mail passando o e-mail na query string
      router.push(`/auth/confirmar-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setGeneralError('Erro de conexão com o servidor. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Criar uma conta</h1>
        <p className="text-sm text-slate-400 mt-1">Preencha os campos abaixo para se cadastrar</p>
      </div>

      {generalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start space-x-2 animate-shake">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo: Nome completo */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
            placeholder="Ex: Maria Silva"
            className={`w-full px-4 py-3 bg-slate-950/60 border ${
              errors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
        </div>

        {/* Campo: Telefone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Telefone
          </label>
          <input
            id="phone"
            type="text"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(98) 99999-9999"
            className={`w-full px-4 py-3 bg-slate-950/60 border ${
              errors.phone ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1.5">{errors.phone}</p>}
        </div>

        {/* Campo: E-mail */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
            }}
            placeholder="seuemail@exemplo.com"
            className={`w-full px-4 py-3 bg-slate-950/60 border ${
              errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
        </div>

        {/* Campo: Senha */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              placeholder="••••••••"
              className={`w-full pl-4 pr-10 py-3 bg-slate-950/60 border ${
                errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
              } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
        </div>

        {/* Campo: Confirmar Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Confirmar Senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-3 bg-slate-950/60 border ${
              errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
          />
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword}</p>}
        </div>

        {/* Termos e Política */}
        <p className="text-xs text-slate-400 leading-normal">
          Ao continuar você aceita os <Link href="/termos" className="text-blue-400 hover:underline">Termos de Uso</Link> e <Link href="/privacidade" className="text-blue-400 hover:underline">Política de Privacidade</Link>.
        </p>

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={!isValidForm || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
            !isValidForm || isLoading
              ? 'bg-slate-800 border border-slate-700/50 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99] shadow-blue-500/10'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Cadastrando...</span>
            </>
          ) : (
            <span>Criar minha conta</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-400">Já tem conta? </span>
        <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Fazer login
        </Link>
      </div>
    </div>
  )
}
