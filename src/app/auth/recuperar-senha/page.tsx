'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { recuperarSenhaSchema } from '@/lib/validations'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [isValidForm, setIsValidForm] = useState(false)

  // Validação em tempo real
  useEffect(() => {
    const result = recuperarSenhaSchema.safeParse({ email })
    setIsValidForm(result.success)
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError('')

    const validation = recuperarSenhaSchema.safeParse({ email })
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
      const response = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      // Backend sempre retorna 200/sucesso independente se o e-mail existe
      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setGeneralError(data.error || 'Erro ao processar solicitação.')
      }
    } catch (err) {
      setGeneralError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Senha</h1>
        <p className="text-sm text-slate-400 mt-1">
          Informe seu e-mail para receber as instruções de recuperação
        </p>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Verifique seu e-mail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Se o e-mail informado estiver cadastrado em nossa base de dados, você receberá em instantes um link para definir uma nova senha.
            </p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-lg text-[11px] text-slate-500 leading-normal">
            Não esqueça de verificar a caixa de spam e o lixo eletrônico.
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition duration-200"
          >
            Tentar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {generalError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              E-mail cadastrado
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
                <span>Enviando link...</span>
              </>
            ) : (
              <span>Enviar instruções</span>
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
