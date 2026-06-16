import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* Lado esquerdo: Formulário */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-950 relative overflow-hidden">
        {/* Elementos decorativos de fundo para dar profundidade (glassmorphism/luz de fundo) */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center">
            {/* Logo ImoPin */}
            <div className="flex items-center space-x-2 mb-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                Imo<span className="text-blue-500 font-extrabold">Pin</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-6">
              Plataforma Imobiliária · Pinheiro, MA
            </p>
          </div>
          
          {children}
        </div>
      </div>

      {/* Lado direito: Banner Premium com Gradiente e Informações de Pinheiro */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 relative overflow-hidden border-l border-slate-800">
        {/* Efeitos de luz brilhante */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Grid decorativo */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="flex items-center space-x-2 relative z-10">
          <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase">
            Conectando Pinheirenses
          </span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Encontre o seu lugar ideal na <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Princesa da Baixada</span>.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Alugue ou venda imóveis em Pinheiro de forma simples, direta e sem burocracia. O lar perfeito para estudantes e famílias a poucos cliques de distância.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/60 pt-8 relative z-10">
          <div className="flex space-x-8">
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Foco Local</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Grátis</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Fase Inicial</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Direto</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Via WhatsApp</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-slate-500">ImoPin © 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}
