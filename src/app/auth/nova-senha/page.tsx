'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

// Schema local de validação para o formulário
const novaSenhaSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

function NovaSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [isValidForm, setIsValidForm] = useState(false)

  // Validação em tempo real
  useEffect(() => {
    const result = novaSenhaSchema.safeParse({ password, confirmPassword })
    setIsValidForm(result.success)
  }, [password, confirmPassword])

  // Valida a existência do token no carregamento da página
  useEffect(() => {
    if (!token) {
      setGeneralError('Link de redefinição inválido ou ausente. Por favor, solicite a recuperação novamente.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsLoading(true)
    setErrors({})
    setGeneralError('')

    const validation = novaSenhaSchema.safeParse({ password, confirmPassword })
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
      const response = await fetch('/api/auth/nova-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setGeneralError(data.error || 'Ocorreu um erro ao definir a nova senha.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setGeneralError('Erro de conexão com o servidor. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Redefinir Senha</h1>
        <p className="text-sm text-slate-400 mt-1">Crie uma nova senha de acesso para sua conta</p>
      </div>

      {success ? (
        <div className="space-y-6 text-center animate-fade-in">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Senha alterada com sucesso!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua senha foi redefinida de forma segura. Você já pode fazer login com suas novas credenciais.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/10 transition duration-200"
          >
            Fazer login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-normal">
              {generalError}
            </div>
          )}

          {/* Campo: Nova Senha */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nova Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={!token}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                }}
                placeholder="Mínimo 8 caracteres"
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

          {/* Campo: Confirmar Nova Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={!token}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              placeholder="Repita a senha"
              className={`w-full px-4 py-3 bg-slate-950/60 border ${
                errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
              } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 text-sm`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={!isValidForm || isLoading || !token}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
              !isValidForm || isLoading || !token
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
                <span>Redefinindo senha...</span>
              </>
            ) : (
              <span>Redefinir senha</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm border-t border-slate-800/60 pt-4">
        <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <NovaSenhaForm />
    </Suspense>
  )
}
