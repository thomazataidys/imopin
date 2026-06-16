'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmarEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'seu e-mail'

  const [cooldown, setCooldown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleReenviar = async () => {
    if (cooldown > 0 || isLoading) return
    
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/reenviar-confirmacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: searchParams.get('email') || '' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao reenviar e-mail de confirmação.')
      } else {
        setMessage('E-mail de confirmação reenviado com sucesso!')
        setCooldown(60) // Cooldown de 60 segundos
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50 text-center space-y-6">
      {/* Ícone de envelope animado */}
      <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 animate-pulse">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Verifique seu e-mail</h1>
        <p className="text-sm text-slate-300">
          Enviamos um e-mail para <strong className="text-blue-400 break-all">{email}</strong>. Clique no link para ativar sua conta.
        </p>
      </div>

      {/* Alertas */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Próximos passos */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 text-left space-y-3 text-xs">
        <h3 className="font-semibold text-slate-200 uppercase tracking-wider">Próximos passos</h3>
        <ol className="list-decimal list-inside text-slate-400 space-y-2">
          <li>Abra sua caixa de entrada</li>
          <li>Procure pelo e-mail do ImoPin</li>
          <li>Clique no botão para <strong className="text-blue-400">Confirmar E-mail</strong></li>
          <li>Faça login na plataforma</li>
        </ol>
      </div>

      <div className="text-xs text-slate-400 bg-slate-800/20 border border-slate-800/40 rounded-lg p-3">
        Não recebeu? Verifique a pasta de spam ou aguarde alguns minutos.
      </div>

      {/* Botão de reenvio */}
      <button
        onClick={handleReenviar}
        disabled={cooldown > 0 || isLoading}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
          cooldown > 0 || isLoading
            ? 'bg-slate-800 border border-slate-700/50 text-slate-500 cursor-not-allowed'
            : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-slate-600'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Reenviando...</span>
          </span>
        ) : cooldown > 0 ? (
          <span>Reenviar e-mail ({cooldown}s)</span>
        ) : (
          <span>Reenviar e-mail</span>
        )}
      </button>

      <div className="text-sm border-t border-slate-800/60 pt-4">
        <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ConfirmarEmailContent />
    </Suspense>
  )
}
