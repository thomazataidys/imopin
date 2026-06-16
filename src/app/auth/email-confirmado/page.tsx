'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmailConfirmadoPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = 4000 // 4 segundos
    const intervalTime = 40 // Atualiza a cada 40ms
    const step = (intervalTime / totalDuration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + step
      })
    }, intervalTime)

    const redirectTimer = setTimeout(() => {
      router.push('/auth/login')
    }, totalDuration)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50 text-center space-y-6">
      {/* Ícone de sucesso */}
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Conta ativada com sucesso!</h1>
        <p className="text-sm text-slate-300">
          Parabéns! Agora você pode encontrar e anunciar imóveis em Pinheiro.
        </p>
      </div>

      {/* Lista de benefícios */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 text-left space-y-3 text-xs">
        <h3 className="font-semibold text-slate-200 uppercase tracking-wider">O que você pode fazer agora</h3>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Buscar imóveis com filtros refinados</span>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Entrar em contato direto por WhatsApp</span>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Favoritar seus anúncios preferidos</span>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Criar e gerenciar seus anúncios imobiliários</span>
          </li>
        </ul>
      </div>

      {/* Barra de progresso para redirect */}
      <div className="space-y-2">
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Redirecionando para a página de login automaticamente...
        </p>
      </div>

      {/* Botão imediato */}
      <button
        onClick={() => router.push('/auth/login')}
        className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
      >
        Entrar na minha conta
      </button>
    </div>
  )
}
