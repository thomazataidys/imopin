# Documentação da Fase 2 — Autenticação (ImoPin)

Este documento detalha todas as implementações realizadas na Fase 2 do projeto ImoPin, englobando correções no backend, desenvolvimento guiado por testes (TDD) para utilitários do cliente e a construção completa da interface visual (frontend) para o fluxo de autenticação.

---

## 1. Correções no Backend

Ao executar a suite de testes unitários do backend (`pnpm test`), identificou-se que o método `safeParse` da biblioteca Zod, ao falhar na validação, gerava um erro interno no servidor (HTTP 500) em vez de retornar HTTP 400. 

### Causa do Problema
O código tentava acessar `validation.error.errors` para mapear os problemas inline. Em certas versões ou configurações do Zod, `errors` pode ser indefinido.

### Solução Aplicada
Substituímos o acesso a `.errors` pela propriedade oficial e recomendada `.issues` nos seguintes handlers de rota:
*   [cadastro/route.ts](file:///home/tomy/projects/imopin/src/app/api/auth/cadastro/route.ts)
*   [nova-senha/route.ts](file:///home/tomy/projects/imopin/src/app/api/auth/nova-senha/route.ts)
*   [recuperar-senha/route.ts](file:///home/tomy/projects/imopin/src/app/api/auth/recuperar-senha/route.ts)
*   [reenviar-confirmacao/route.ts](file:///home/tomy/projects/imopin/src/app/api/auth/reenviar-confirmacao/route.ts)

Essa alteração normalizou as rotas e fez com que os testes de validação do backend passassem com sucesso.

---

## 2. Desenvolvimento Guiado por Testes (TDD)

Para o frontend, implementou-se uma máscara de telefone em tempo real para o input de cadastro. Seguindo a premissa de TDD:

1.  **Testes Criados Primeiro**: O arquivo de teste unitário [phoneMask.test.ts](file:///home/tomy/projects/imopin/src/__tests__/utils/phoneMask.test.ts) foi criado sob a pasta de testes para definir a especificação esperada do helper (remover caracteres inválidos, lidar com DDI/DDD, formatar dinamicamente e limitar ao tamanho máximo de celular de 11 dígitos).
2.  **Implementação da Função**: Desenvolveu-se a função `applyPhoneMask` em [phoneMask.ts](file:///home/tomy/projects/imopin/src/lib/phoneMask.ts) cobrindo com exatidão os testes unitários gerados.

---

## 3. Interfaces do Frontend (Fase 2)

As telas foram implementadas dentro do diretório `/auth` utilizando o **Next.js 16 App Router** e **TailwindCSS** seguindo um padrão visual premium de alto nível (tema escuro com luzes de fundo difusas, sombras suaves e responsividade total mobile-first).

### 3.1 Layout Compartilhado ([layout.tsx](file:///home/tomy/projects/imopin/src/app/auth/layout.tsx))
Utiliza um visual de tela dividida (*split screen* 50/50) no desktop:
*   **Lado Esquerdo**: Área do formulário, contendo o logotipo moderno do ImoPin, gradientes translúcidos, blur no fundo e profundidade visual.
*   **Lado Direito**: Banner escuro premium com gradientes degradê (`from-slate-900 via-indigo-950 to-blue-950`), efeitos luminosos difusos, padrão de pontos abstrato e estatísticas promocionais da plataforma voltadas para a cidade de Pinheiro, MA ("Princesa da Baixada").

### 3.2 Tela de Cadastro ([cadastro/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/cadastro/page.tsx))
Formulário interativo com:
*   Inputs modernos com indicadores dinâmicos de foco e validação em tempo real utilizando os schemas do Zod.
*   Máscara automática no campo de telefone.
*   Opção de mostrar/ocultar senha (*toggle visibility*).
*   Botão de envio que exibe estado de carregamento (*loading*) e é habilitado somente quando o formulário é 100% válido.
*   Mapeamento de erros inline abaixo de cada campo enviado pela API.

### 3.3 Tela de Login ([login/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/login/page.tsx))
*   Reutiliza o layout e estilos do formulário de cadastro.
*   Controles integrados de exibição de senha.
*   Conexão direta com o **NextAuth Credentials Provider**.
*   Tratamento de parâmetros de erro vindos do redirecionamento do NextAuth (ex: credenciais incorretas ou e-mail não confirmado).

### 3.4 Tela de Confirmação Pendente ([confirmar-email/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/confirmar-email/page.tsx))
*   Informa o e-mail cadastrado a partir de query params na URL.
*   Possui caixa instrucional contendo o passo a passo a ser seguido pelo usuário.
*   Botão para reenvio do e-mail de confirmação (`/api/auth/reenviar-confirmacao`) com contador de cooldown regressivo de 60 segundos gerenciado localmente.

### 3.5 Tela de Confirmação Concluída ([email-confirmado/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/email-confirmado/page.tsx))
*   Exibe animações e ícone de sucesso.
*   Contém uma barra de progresso visual de 4 segundos.
*   Redireciona o usuário de forma automatizada para a página de login ao expirar o tempo, ou imediatamente ao clicar no botão de ação.

### 3.6 Recuperação de Senha ([recuperar-senha/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/recuperar-senha/page.tsx))
*   Permite a entrada do e-mail para envio das instruções.
*   Chama a rota `/api/auth/recuperar-senha` que retorna sucesso neutro para preservação da segurança contra varredura de e-mails ativos.
*   Informa o usuário com mensagem amigável de sucesso e opção para refazer o envio caso necessário.

### 3.7 Nova Senha ([nova-senha/page.tsx](file:///home/tomy/projects/imopin/src/app/auth/nova-senha/page.tsx))
*   Extrai o token da URL e valida seu preenchimento.
*   Campos de Nova Senha e Confirmação de Senha validados no lado do cliente.
*   Interface limpa com redirecionamento de sucesso para a tela de login.
