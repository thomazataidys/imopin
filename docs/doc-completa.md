ImoPin
Plataforma Imobiliária — Pinheiro, MA
SPEC-DRIVEN DEVELOPMENT (SDD)

Versão
1.0.0
Status
Draft
Data
10/04/2026

Índice
1. Visão Geral do Produto
2. Stack Técnico
3. Arquitetura do Sistema
4. Modelagem do Banco de Dados
5. Autenticação e Autorização
6. Especificação de Telas (UI Specs)
7. Regras de Negócio
8. APIs e Endpoints
9. Estrutura de Pastas Next.js
10. Checklist de Implementação


1. Visão Geral do Produto
1.1 Descrição
O ImoPin é uma plataforma SaaS de aluguel e venda de imóveis focada exclusivamente na cidade de Pinheiro - MA. O objetivo é ser simples, intuitivo e funcional, com experiência mobile-first e excelente usabilidade no desktop.

1.2 Perfis de Usuário
Perfil
Acesso
Pode fazer
Visitante
Sem conta
Navegar e ver imóveis
Usuário Logado (Buscador)
Conta ativa
Favoritar, contatar proprietários via WhatsApp
Usuário Logado (Anunciante)
Conta ativa
Tudo acima + criar/gerenciar anúncios (máx. 10/semana)
Administrador
Acesso admin
Moderar anúncios, gerenciar usuários, categorias e faculdades
1.3 Regras Gerais
• O sistema é focado 100% na cidade de Pinheiro - MA
• Gratuito para todos os usuários na fase inicial
• Anúncios são publicados automaticamente sem moderação prévia
• Limite de 10 anúncios criados por usuário por semana
• Fotos: máximo 8MB por imagem, mínimo 3 fotos por anúncio, máximo 20 fotos
• Anúncios sem interação por 90 dias recebem alerta de renovação
• Imóvel marcado como Alugado/Vendido sai da busca automaticamente


2. Stack Técnico
Camada
Tecnologia / Serviço
Frontend
Next.js 16 (App Router) + React + TypeScript
Estilização
TailwindCSS + shadcn/ui
Banco de Dados
PostgreSQL via Neon (free tier)
ORM
Prisma
Autenticação
NextAuth.js (Credentials + JWT)
Storage de Imagens
Cloudflare R2 (free: 10GB/mês, sem custo de egress)
E-mail Transacional
Resend (free: 3.000 e-mails/mês)
Templates de E-mail
React Email
Deploy
Vercel (free tier)
Validação
Zod
Upload de Imagens
UploadThing ou presigned URL direto no R2
Maps
Leaflet.js + OpenStreetMap (gratuito)
Por que Neon e não Supabase gratuito? O Supabase pausa projetos inativos após 1 semana. O Neon não pausa — ideal para produção mesmo no free tier. Quando o produto crescer, migra para Supabase Pro ($25/mês) sem mudanças no código, só troca a connection string.

3. Arquitetura do Sistema
3.1 Fluxo Geral
Browser/Mobile  ?  Vercel Edge (Next.js)  ?  API Routes (TypeScript)  ?  Neon PostgreSQL
Upload de imagens  ?  API Route (valida e gera presigned URL)  ?  Cloudflare R2
E-mails  ?  API Route  ?  Resend SDK  ?  Caixa do usuário

3.2 Padrão de Rotas Next.js (App Router)
Rota
Descrição
/
Landing Page
/buscar
Home de busca (tela principal)
/imoveis
Listagem de imóveis com filtros
/imoveis/[id]
Detalhe de um imóvel
/favoritos
Lista de favoritos do usuário logado
/anunciar
Criar anúncio (por etapas, requer login)
/meus-anuncios
Gerenciamento de anúncios do usuário
/meus-dados
Edição de perfil do usuário
/auth/login
Página de login
/auth/cadastro
Página de cadastro
/auth/confirmar-email
Tela pós-cadastro (aguardando confirmação)
/auth/email-confirmado
Tela de conta ativada com sucesso
/auth/recuperar-senha
Solicitar reset de senha
/auth/nova-senha
Definir nova senha (via token do e-mail)
/admin
Painel administrativo (restrito)
/api/auth/[...nextauth]
Handler do NextAuth
/api/imoveis
CRUD de imóveis
/api/favoritos
Gerenciar favoritos
/api/upload
Gerar presigned URL para R2
/api/admin/*
Rotas administrativas

4. Modelagem do Banco de Dados (Prisma Schema)
4.1 Tabela: User
Campo
Tipo / Detalhe
id
String @id @default(cuid())
name
String
email
String @unique
phone
String?
passwordHash
String
emailVerified
DateTime? — preenchido ao confirmar e-mail
emailToken
String? @unique — token de confirmação (expira 24h)
emailTokenExpiry
DateTime?
resetToken
String? @unique — token de reset de senha
resetTokenExpiry
DateTime?
role
Enum: USER | ADMIN
createdAt
DateTime @default(now())
updatedAt
DateTime @updatedAt
imoveis
Imovel[] — relação 1:N
favoritos
Favorito[] — relação N:M via tabela pivot
4.2 Tabela: Imovel
Campo
Tipo / Detalhe
id
String @id @default(cuid())
userId
String — FK para User
titulo
String — gerado automaticamente na revisão
descricao
String
finalidade
Enum: ALUGAR | VENDER | ALUGAR_E_VENDER
tipoCategoria
Enum: RESIDENCIAL | COMERCIAL
tipoImovel
Enum: APARTAMENTO | CASA | CASA_CONDOMINIO | CHACARA | COBERTURA | FLAT | KITNET | LOTE_TERRENO | SOBRADO | EDIFICIO | FAZENDA_SITIO | CONSULTORIO | GALPAO | IMOVEL_COMERCIAL | LOTE_COMERCIAL | PONTO_COMERCIAL
status
Enum: ATIVO | PAUSADO | ALUGADO | VENDIDO | EXCLUIDO
cep
String
rua
String
numero
String
complemento
String?
bairro
String
cidade
String @default('Pinheiro')
estado
String @default('MA')
lat
Float? — latitude para mapa
lng
Float? — longitude para mapa
areaM2
Float?
quartos
Int @default(0)
banheiros
Int @default(0)
vagas
Int @default(0)
mobiliado
Boolean @default(false)
aceitaPets
Boolean @default(false)
piscina
Boolean @default(false)
churrasqueira
Boolean @default(false)
portaria
Boolean @default(false)
condominioFechado
Boolean @default(false)
precoAluguel
Float? — em centavos (ex: 150000 = R$1.500,00)
precoVenda
Float? — em centavos
condominio
Float?
iptu
Float?
whatsapp
String — número para contato
fotos
Foto[] — relação 1:N
favoritos
Favorito[]
faculdadesProximas
FaculdadeImovel[]
visualizacoes
Int @default(0)
ultimaInteracao
DateTime @default(now()) — usado para alerta dos 90 dias
alertaRenovacaoEnviado
Boolean @default(false)
createdAt
DateTime @default(now())
updatedAt
DateTime @updatedAt
publicadoEm
DateTime @default(now())
4.3 Tabela: Foto
Campo
Tipo / Detalhe
id
String @id @default(cuid())
imovelId
String — FK para Imovel
url
String — URL pública no Cloudflare R2
r2Key
String — chave interna no R2 (para deletar)
ordem
Int — define a sequência e qual é a capa (ordem 0)
createdAt
DateTime @default(now())
4.4 Tabela: Favorito
Campo
Tipo / Detalhe
id
String @id @default(cuid())
userId
String — FK para User
imovelId
String — FK para Imovel
createdAt
DateTime @default(now())
@@unique([userId, imovelId])
Garante sem duplicatas
4.5 Tabela: Faculdade
Campo
Tipo / Detalhe
id
String @id @default(cuid())
nome
String
lat
Float
lng
Float
ativa
Boolean @default(true)
4.6 Tabela: FaculdadeImovel (pivot)
Campo
Tipo / Detalhe
imovelId
String
faculdadeId
String
distanciaKm
Float — calculada no cadastro
@@id([imovelId, faculdadeId])
PK composta
4.7 Tabela: Denuncia
Campo
Tipo / Detalhe
id
String @id @default(cuid())
imovelId
String — FK para Imovel
userId
String? — quem denunciou (pode ser anônimo)
motivo
Enum: INFO_FALSA | FOTO_INADEQUADA | CONTATO_INVALIDO | OUTRO
descricao
String?
status
Enum: PENDENTE | RESOLVIDA | IGNORADA
createdAt
DateTime @default(now())
4.8 Tabela: AnunciosSemana (controle de limite)
Campo
Tipo / Detalhe
id
String @id @default(cuid())
userId
String
semanaInicio
DateTime — início da semana (segunda-feira 00:00)
quantidade
Int @default(0)
@@unique([userId, semanaInicio])
Um registro por user por semana

5. Autenticação e Autorização
5.1 Fluxo de Cadastro
• Usuário preenche: Nome, Telefone, E-mail, Senha, Confirmar Senha
• Backend valida com Zod: formato de e-mail, telefone BR, senha mín. 8 chars
• Verifica se e-mail já existe ? erro 409 se sim
• Gera hash da senha com bcryptjs (salt 12)
• Cria usuário com emailVerified: null e gera emailToken (UUID v4) com expiry de 24h
• Envia e-mail de confirmação via Resend com link: /api/auth/confirmar-email?token=XXX
• Retorna tela 'Verifique seu e-mail' com botão de reenvio (cooldown 60s via estado local)

5.2 Fluxo de Confirmação de E-mail
• Usuário clica no link do e-mail ? GET /api/auth/confirmar-email?token=XXX
• Backend busca usuário pelo token
• Valida se token não expirou (emailTokenExpiry > now())
• Se expirado: redireciona para /auth/token-expirado com botão de reenvio
• Se válido: atualiza emailVerified = now(), limpa emailToken e emailTokenExpiry
• Redireciona para /auth/email-confirmado (tela de sucesso)
• Após 3 segundos, redireciona automaticamente para /auth/login

5.3 Fluxo de Login
• E-mail + Senha via NextAuth Credentials Provider
• Verifica se emailVerified está preenchido ? erro amigável se não confirmou
• Compara senha com hash — bcryptjs compare
• Cria sessão JWT com: id, name, email, role
• Redireciona para página anterior (callbackUrl) ou para /buscar

5.4 Fluxo de Reset de Senha
• Usuário informa e-mail em /auth/recuperar-senha
• Backend sempre retorna sucesso (não revela se e-mail existe) — segurança
• Se e-mail existe: gera resetToken + resetTokenExpiry (1h) e envia e-mail
• Link do e-mail: /auth/nova-senha?token=XXX
• Usuário define nova senha ? backend valida token, atualiza hash, limpa token

5.5 Proteção de Rotas (Middleware Next.js)
Rota
Proteção
/favoritos
Requer login — redireciona para /auth/login?callbackUrl=...
/anunciar
Requer login + emailVerified
/meus-anuncios
Requer login
/meus-dados
Requer login
/admin/*
Requer login + role ADMIN
/imoveis, /buscar
Pública — contatar exige login (modal inline)

6. Especificação de Telas (UI Specs)
6.1 Landing Page  /
Objetivo
Apresentar o ImoPin, converter visitantes em buscadores ou anunciantes.
Componentes e Comportamento
• Header: Logo ImoPin à esquerda + botão 'Entrar' à direita
• Hero Section: Headline impactante, subtítulo, dois botões principais:
? 'Encontrar Imóvel' ? navega para /buscar
? 'Anunciar meu Imóvel' ? se logado vai para /anunciar, se não abre modal de login
• Seção 'Como funciona': 3 cards com ícone (Busque ? Entre em contato ? Feche negócio)
• Contador dinâmico: 'X imóveis cadastrados em Pinheiro' — busca via API
• Seção de bairros mais buscados: chips clicáveis que levam para /imoveis?bairro=XXX
• Seção CTA final: 'Tem um imóvel para alugar ou vender?' + botão Anunciar
• Footer: © 2025 ImoPin · Termos de Uso · Política de Privacidade · Contato
Responsividade
• Mobile: botões hero empilhados, cards 'como funciona' em coluna única
• Desktop: dois botões lado a lado, cards em linha de 3

6.2 Cadastro  /auth/cadastro
Layout
Mobile: tela cheia com formulário centralizado. Desktop: split 50/50 — formulário à esquerda, foto/imagem à direita (pode ser foto de Pinheiro).
Campos do formulário
• Nome completo — texto, obrigatório
• Telefone — máscara (99) 99999-9999, obrigatório
• E-mail — formato válido, obrigatório
• Senha — mínimo 8 caracteres, com toggle mostrar/ocultar
• Confirmar senha — deve ser igual à senha
• Botão 'Criar minha conta' — desabilitado até formulário válido
• Link 'Já tenho conta? Fazer login' ? /auth/login
• Texto: 'Ao continuar você aceita os Termos de Uso e Política de Privacidade'
Estados e feedback
• Loading no botão durante requisição
• Erro inline sob cada campo (ex: 'E-mail já cadastrado', 'Senhas não conferem')
• Sucesso: navega para /auth/confirmar-email (tela de aguardo)

6.3 Aguardando Confirmação de E-mail  /auth/confirmar-email
Conteúdo
• Ícone de envelope
• Título: 'Verifique seu e-mail'
• Texto: 'Enviamos um e-mail para [email]. Clique no link para ativar sua conta.'
• Próximos passos: 1. Abra o e-mail, 2. Clique em Confirmar, 3. Faça login
• Caixa de aviso: 'Não recebeu? Verifique spam ou aguarde 5 minutos'
• Botão 'Reenviar e-mail' com cooldown de 60 segundos (contador regressivo)

6.4 Conta Ativada  /auth/email-confirmado
Conteúdo
• Ícone de envelope com check azul
• Título: 'Conta ativada com sucesso!'
• Texto: 'Parabéns! Agora você pode encontrar e anunciar imóveis em Pinheiro.'
• Lista: Encontrar imóvel · Entrar em contato com anunciantes · Favoritar imóveis
• Botão 'Entrar na minha conta' ? /auth/login
• Redirecionamento automático para /auth/login após 4 segundos (com barra de progresso)

6.5 Login  /auth/login
Layout
Idêntico ao cadastro (split desktop / tela cheia mobile). Reutiliza o mesmo componente de layout.
Campos
• E-mail
• Senha com toggle
• Link 'Esqueci minha senha' ? /auth/recuperar-senha
• Botão 'Entrar'
• Link 'Ainda não tem conta? Cadastrar' ? /auth/cadastro

6.6 Home de Busca  /buscar
Estrutura
• Header: botão sidebar (?) + Logo + botão 'Entrar'/'Avatar do usuário'
• Hero com busca:
? Tabs: Alugar | Comprar
? Campo de texto: placeholder 'Busque por bairro ou rua...'
? Dropdown 'Tipo de imóvel': lista dos tipos do enum + 'Todos os imóveis'
? Botão 'Buscar' ? navega para /imoveis com query params
• Seção de Categorias: chips/cards visuais para os tipos principais (Casa, Apartamento, etc.)
• Seção de destaques: últimos imóveis cadastrados (carrossel horizontal)
• CTA para anunciar imóvel
Sidebar (drawer lateral)
• Topo com fundo azul: Avatar + Nome + E-mail + botão 'Meus dados'
• Se não logado: botões 'Entrar' e 'Cadastrar'
• Itens: Alugar · Comprar · Favoritos · Meus Anúncios · Anunciar · Ajuda · Sair
• 'Meus Anúncios' só visível se usuário tiver ao menos 1 anúncio
• Overlay escurecido ao abrir, clique no overlay fecha

6.7 Listagem de Imóveis  /imoveis
Header da tela
• Botão sidebar (?) + Logo + Ícone de Favoritos (coração)
• Campo de busca com valor atual e botão limpar (×)
Filtros rápidos (scroll horizontal)
• Chips: Mobiliado · Aceita Pets · Piscina · Perto de Faculdade · Garagem · Churrasqueira
• Chip 'Perto de Faculdade': ao clicar abre dropdown com lista de faculdades
• Faculdades iniciais: IESMA · UEMA Pinheiro · FAMA · (campo sugerir outra)
• Chips selecionados ficam com fundo azul e borda marcada
Barra de resultados
• Texto: 'X imóveis para [alugar/comprar] em Pinheiro - MA'
• Botão 'Filtros (N)' ? abre modal/drawer de filtros avançados
• Botão 'Ordenar por ?' ? abre popover com opções
• Opções de ordenação: Mais relevantes · Mais recente · Menor preço · Maior preço
Modal de Filtros Avançados
• Finalidade: Alugar / Comprar / Ambos
• Tipo de imóvel: checkboxes agrupados (Residencial / Comercial)
• Faixa de preço: dois inputs (De / Até) com máscara R$
• Quartos: botões 1 · 2 · 3 · 4+
• Banheiros: botões 1 · 2 · 3 · 4+
• Vagas: botões 0 · 1 · 2 · 3+
• Área mínima (m²): input numérico
• Características: checkboxes Mobiliado · Aceita Pets · Piscina · Churrasqueira · Portaria · Condomínio Fechado
• Botões: 'Limpar filtros' + 'Ver X imóveis' (atualiza em tempo real)
Cards de Imóvel
• Foto principal com navegação por setas (swipe no mobile)
• Botão coração (favoritar) sobreposto na foto — canto superior direito
• Tag de status: 'Aluguel' ou 'Venda' (badge colorido)
• Informações: tipo + m² · bairro · preço · quartos/banheiros/vagas
• Botão 'Contatar' ? se logado abre WhatsApp, se não abre modal de login
• Imóvel Alugado/Vendido: selo sobre a foto + botão Contatar desabilitado
Paginação
• Scroll infinito no mobile (intersection observer)
• Paginação numérica no desktop
• 20 imóveis por página

6.8 Detalhe do Imóvel  /imoveis/[id]
Galeria de Fotos
• Foto principal grande com navegação por setas
• Thumbnails abaixo (desktop) / contador '3/8' (mobile)
• Contador de fotos total sobreposto na imagem
Ações rápidas (fixas no mobile ao rolar)
• Botão 'Favoritar' (coração) — toggle
• Botão 'Compartilhar' — gera link, copia URL, ou compartilha nativo no mobile
Informações principais
• Título do imóvel
• Tags: 'Para alugar' ou 'À venda' + 'Alugado'/'Vendido' se aplicável
• Endereço: Bairro, Pinheiro - MA
• Características: m² · quartos · banheiros · vagas (com ícones)
• Data de publicação + última atualização
Valores
• Preço de aluguel e/ou venda em destaque
• Condomínio e IPTU (se informados)
• Total estimado por mês
Características do imóvel
• Grid de chips: Mobiliado · Aceita Pets · Piscina · Churrasqueira · etc.
Descrição
• Texto completo do anunciante
• Botão 'Ver mais' se texto for longo (colapsa em 4 linhas)
Localização
• Mapa Leaflet + OpenStreetMap centralizado no imóvel
• Pin indicando localização aproximada (pode ser ligeiramente deslocado por privacidade)
Contato
• Botão grande 'Falar pelo WhatsApp' ? abre wa.me/55NUMERO
• Se não logado: botão abre modal de login antes de redirecionar
• Número de visualizações do anúncio
Alerta de segurança
• Caixa com dicas: não transfira dinheiro sem visitar, não compartilhe dados pessoais
• Botão 'Denunciar anúncio' ? modal com motivos
Imóveis próximos
• Carrossel com até 8 imóveis do mesmo bairro ou tipo
• Cards idênticos aos da listagem
Footer
• Simples: © 2025 ImoPin · Termos · Privacidade · Contato

6.9 Criar Anúncio  /anunciar (por etapas)
Barra de progresso no topo mostrando a etapa atual. Botões 'Voltar' e 'Continuar' fixos no rodapé. Os dados são preservados em estado local (localStorage) para caso o usuário atualize a página.
Etapa 1/8 — Intenção
• Pergunta: 'O que você deseja fazer?'
• Radio buttons: Alugar · Vender · Alugar e Vender
Etapa 2/8 — Tipo de Imóvel
• Grupo: Residencial ? Apartamento · Casa · Casa de Condomínio · Chácara · Cobertura · Flat · Kitnet/Conjugado · Lote/Terreno · Sobrado · Edifício Residencial · Fazenda/Sítio
• Grupo: Comercial ? Consultório · Galpão/Depósito · Imóvel Comercial · Lote Comercial · Ponto Comercial/Loja
Etapa 3/8 — Endereço
• CEP (auto-preenche via ViaCEP API): Rua, Bairro
• Número + Complemento
• Mapa Leaflet mostrando localização — usuário pode ajustar o pin
• Validação: CEP deve ser de Pinheiro - MA (65200-000 a 65299-999)
Etapa 4/8 — Características
• Área total (m²) — input numérico
• Quartos: stepper ? N + (0 a 20)
• Banheiros: stepper ? N + (0 a 20)
• Vagas de garagem: stepper ? N + (0 a 10)
• Checkboxes: Mobiliado · Aceita Pets · Piscina · Churrasqueira · Portaria · Condomínio Fechado
Etapa 5/8 — Valores
• Se 'Alugar' ou 'Alugar e Vender': campo Preço de Aluguel/mês (R$)
• Se 'Vender' ou 'Alugar e Vender': campo Preço de Venda (R$)
• Condomínio/mês (opcional)
• IPTU/ano (opcional)
Etapa 6/8 — Fotos
• Upload drag-and-drop + botão selecionar
• Validação: máximo 8MB por foto, formatos JPG/PNG/WebP
• Mínimo 3 fotos obrigatório para continuar
• Máximo 20 fotos
• Arrastar para reordenar (react-beautiful-dnd ou dnd-kit)
• Primeira foto = capa (marcada visualmente com badge 'Capa')
• Botão X para remover foto individual
• Progress bar durante upload para R2
Etapa 7/8 — Descrição e Contato
• Título do anúncio: pré-preenchido (ex: 'Casa para alugar no Centro') — editável
• Descrição: textarea com contador de caracteres (mín. 50, máx. 2000)
• WhatsApp para contato: pré-preenchido com telefone do cadastro — editável
• Formato WhatsApp: (99) 99999-9999 com máscara
Etapa 8/8 — Revisão e Publicação
• Resumo de todos os dados preenchidos
• Miniatura das fotos
• Botão 'Editar' ao lado de cada seção (volta para a etapa correspondente)
• Botão 'Publicar Anúncio' ? chamada API ? redirect para /meus-anuncios com toast de sucesso
• Validação final: limite de 10 anúncios por semana — erro bloqueador se atingido

6.10 Meus Anúncios  /meus-anuncios
Layout
• Lista de cards do usuário
• Abas de filtro: Todos · Ativos · Pausados · Alugados/Vendidos
Card de Anúncio (gerenciamento)
• Foto capa (pequena, à esquerda)
• Título · tipo · bairro · preço · data de publicação
• Badge de status colorido: Ativo (verde) · Pausado (cinza) · Alugado (azul) · Vendido (roxo)
• Contador de visualizações
• Menu de ações (três pontinhos ou botões):
? Editar ? /anunciar?edit=ID (carrega dados existentes)
? Pausar / Reativar ? toggle de status ATIVO?PAUSADO
? Marcar como Alugado ? modal confirmação 'Seu imóvel foi alugado?'
? Marcar como Vendido ? modal confirmação 'Seu imóvel foi vendido?'
? Excluir ? modal confirmação com aviso que é permanente
Alerta de limite
• Banner no topo se o usuário está próximo do limite (8+ anúncios na semana)
• Bloqueio total ao atingir 10 anúncios na semana com contador de quando renova

6.11 Favoritos  /favoritos
Layout
• Grid de cards (2 colunas mobile, 3-4 desktop)
• Cards idênticos à listagem
• Imóvel alugado/vendido: selo sobre a foto indicando status
• Botão coração preenchido (ativo) — clique remove dos favoritos
• Estado vazio: ilustração + 'Você ainda não salvou nenhum imóvel' + botão 'Buscar imóveis'

6.12 Meus Dados  /meus-dados
Reutiliza o mesmo layout do cadastro — só muda o título e o comportamento
• Título: 'Meus dados'
• Campo Nome: pré-preenchido, editável
• Campo Telefone: pré-preenchido, editável
• Campo E-mail: pré-preenchido, read-only (cinza) — é o login
• Link 'Alterar minha senha' ? abre modal inline:
? Senha atual · Nova senha · Confirmar nova senha
• Botão 'Salvar alterações' com loading e toast de sucesso

6.13 Painel Administrativo  /admin
Dashboard
• Cards: Total de imóveis · Novos esta semana · Usuários cadastrados · Denúncias pendentes
Módulos
• Imóveis: tabela paginada com busca, filtro de status, botão remover
• Denúncias: lista de denúncias pendentes com botões Resolver / Ignorar
• Usuários: tabela com nome, e-mail, data de cadastro, status de verificação
• Categorias de Imóvel: CRUD de tipos (para expansão futura sem mexer no código)
• Faculdades: CRUD — nome, lat, lng, ativa/inativa


7. Regras de Negócio
7.1 Limite de Anúncios
• Ao publicar: busca ou cria registro em AnunciosSemana para (userId, semanaAtual)
• semanaAtual = segunda-feira da semana corrente às 00:00 UTC
• Se quantidade >= 10: retorna erro 429 'Limite semanal atingido'
• Se quantidade < 10: incrementa e prossegue
• Anúncios editados NÃO contam para o limite (só novos)

7.2 Renovação de Anúncios (90 dias)
• Cron job diário (Vercel Cron, 00:00 UTC): busca imóveis onde:
• status = ATIVO E ultimaInteracao < now() - 90 dias E alertaRenovacaoEnviado = false
• Para cada: envia e-mail 'Seu anúncio ainda está disponível?' com botões Sim/Não
• Marca alertaRenovacaoEnviado = true
• Se usuário clicar 'Sim': atualiza ultimaInteracao, reseta alertaRenovacaoEnviado
• Se usuário clicar 'Não': muda status para PAUSADO
• Toda interação no anúncio (edição, visualização pelo dono) atualiza ultimaInteracao

7.3 Favoritos e Notificação de Status
• Ao marcar imóvel como Alugado/Vendido: busca todos os Favoritos desse imovelId
• Usuários que favoritaram verão o badge de status na tela de Favoritos no próximo acesso
• Não há notificação push ou e-mail nessa fase — apenas visual

7.4 Validações de CEP
• CEP deve pertencer a Pinheiro - MA: faixa 65200-000 a 65299-999
• API ViaCEP (gratuita): viacep.com.br/ws/{CEP}/json/
• Se CEP inválido ou fora de Pinheiro: erro bloqueador 'Este CEP não pertence a Pinheiro - MA'

7.5 Upload de Imagens
• Frontend solicita presigned URL ao backend: POST /api/upload
• Backend valida: usuário logado, tipo de arquivo (image/*), tamanho <= 8MB
• Gera presigned URL do R2 com TTL de 5 minutos
• Frontend faz PUT direto para R2 com a presigned URL
• Após upload: envia URL pública + r2Key para backend salvar na tabela Foto
• Ao excluir imóvel ou foto: backend deleta objeto no R2 via SDK

7.6 Contato via WhatsApp
• URL gerada: https://wa.me/55{DDD}{NUMERO}?text={mensagem_pre_definida}
• Mensagem pré-definida: 'Olá! Vi seu anúncio no ImoPin: [título do imóvel]. Tenho interesse!'
• Se usuário não logado: ao clicar registra intenção, abre modal de login, após login redireciona para WhatsApp
• Cada clique em Contatar incrementa visualizacoes do imóvel


8. APIs e Endpoints
8.1 Imóveis
Endpoint
Descrição
GET /api/imoveis
Listagem com filtros (query params: bairro, tipo, finalidade, preco_min, preco_max, quartos, banheiros, vagas, mobiliado, pets, piscina, faculdade_id, ordenar, page, limit)
GET /api/imoveis/[id]
Detalhe de um imóvel + incrementa visualizações
POST /api/imoveis
Criar imóvel — requer auth + emailVerified + limite semanal
PUT /api/imoveis/[id]
Editar imóvel — requer auth + ser dono
PATCH /api/imoveis/[id]/status
Alterar status (PAUSADO, ATIVO, ALUGADO, VENDIDO) — requer auth + ser dono
DELETE /api/imoveis/[id]
Excluir imóvel — requer auth + ser dono — deleta fotos do R2
GET /api/imoveis/[id]/proximos
Imóveis próximos (mesmo bairro, até 8)
8.2 Autenticação
Endpoint
Descrição
POST /api/auth/cadastro
Criar usuário — valida, hash senha, envia e-mail
GET /api/auth/confirmar-email
Validar token — query param: token
POST /api/auth/reenviar-confirmacao
Reenviar e-mail de confirmação
POST /api/auth/recuperar-senha
Solicitar reset — envia e-mail com token
POST /api/auth/nova-senha
Definir nova senha com token
PUT /api/auth/alterar-senha
Alterar senha (logado) — requer senha atual
PUT /api/auth/perfil
Atualizar nome e telefone
8.3 Favoritos e Upload
Endpoint
Descrição
GET /api/favoritos
Lista favoritos do usuário logado
POST /api/favoritos
Adicionar favorito — body: { imovelId }
DELETE /api/favoritos/[imovelId]
Remover favorito
POST /api/upload
Gerar presigned URL — body: { filename, contentType, size }
DELETE /api/upload
Deletar objeto do R2 — body: { r2Key }
8.4 Admin
Endpoint
Descrição
GET /api/admin/dashboard
Métricas gerais
GET /api/admin/imoveis
Todos os imóveis paginados
DELETE /api/admin/imoveis/[id]
Remover qualquer imóvel
GET /api/admin/denuncias
Lista de denúncias
PATCH /api/admin/denuncias/[id]
Resolver ou ignorar denúncia
GET /api/admin/usuarios
Lista de usuários
GET /api/admin/faculdades
Lista de faculdades
POST /api/admin/faculdades
Criar faculdade
PUT /api/admin/faculdades/[id]
Editar faculdade
DELETE /api/admin/faculdades/[id]
Remover faculdade
8.5 Outros
Endpoint
Descrição
POST /api/denuncias
Denunciar anúncio — requer auth
GET /api/estatisticas
Total de imóveis ativos (para landing page)
GET /api/faculdades
Lista de faculdades ativas (para filtro)
POST /api/renovar-anuncio
Usuário confirma que imóvel ainda está disponível — via link do e-mail com token

9. Estrutura de Pastas — Next.js 16 App Router
imopin/
??? prisma/
?   ??? schema.prisma              ? Modelos do banco de dados
?   ??? seed.ts                    ? Dados iniciais (faculdades, admin)
??? src/
?   ??? app/                       ? App Router (Next.js 14)
?   ?   ??? (public)/              ? Rotas públicas (sem auth)
?   ?   ?   ??? page.tsx           ? Landing Page /
?   ?   ?   ??? buscar/page.tsx    ? Home de busca
?   ?   ?   ??? imoveis/
?   ?   ?   ?   ??? page.tsx       ? Listagem
?   ?   ?   ?   ??? [id]/page.tsx  ? Detalhe do imóvel
?   ?   ?   ??? auth/
?   ?   ?       ??? login/page.tsx
?   ?   ?       ??? cadastro/page.tsx
?   ?   ?       ??? confirmar-email/page.tsx
?   ?   ?       ??? email-confirmado/page.tsx
?   ?   ?       ??? recuperar-senha/page.tsx
?   ?   ?       ??? nova-senha/page.tsx
?   ?   ??? (private)/             ? Requer auth (protegido por middleware)
?   ?   ?   ??? favoritos/page.tsx
?   ?   ?   ??? meus-anuncios/page.tsx
?   ?   ?   ??? meus-dados/page.tsx
?   ?   ?   ??? anunciar/
?   ?   ?       ??? page.tsx       ? Wizard de criação (8 etapas)
?   ?   ??? admin/                 ? Requer role ADMIN
?   ?   ?   ??? page.tsx           ? Dashboard
?   ?   ?   ??? imoveis/page.tsx
?   ?   ?   ??? denuncias/page.tsx
?   ?   ?   ??? usuarios/page.tsx
?   ?   ?   ??? faculdades/page.tsx
?   ?   ??? api/                   ? API Routes
?   ?   ?   ??? auth/
?   ?   ?   ?   ??? [...nextauth]/route.ts
?   ?   ?   ?   ??? cadastro/route.ts
?   ?   ?   ?   ??? confirmar-email/route.ts
?   ?   ?   ?   ??? reenviar-confirmacao/route.ts
?   ?   ?   ?   ??? recuperar-senha/route.ts
?   ?   ?   ?   ??? nova-senha/route.ts
?   ?   ?   ?   ??? alterar-senha/route.ts
?   ?   ?   ?   ??? perfil/route.ts
?   ?   ?   ??? imoveis/
?   ?   ?   ?   ??? route.ts       ? GET (listagem) + POST (criar)
?   ?   ?   ?   ??? [id]/
?   ?   ?   ?       ??? route.ts   ? GET + PUT + DELETE
?   ?   ?   ?       ??? status/route.ts
?   ?   ?   ?       ??? proximos/route.ts
?   ?   ?   ??? favoritos/
?   ?   ?   ?   ??? route.ts
?   ?   ?   ?   ??? [imovelId]/route.ts
?   ?   ?   ??? upload/route.ts
?   ?   ?   ??? denuncias/route.ts
?   ?   ?   ??? faculdades/route.ts
?   ?   ?   ??? estatisticas/route.ts
?   ?   ?   ??? renovar-anuncio/route.ts
?   ?   ?   ??? admin/
?   ?   ?       ??? dashboard/route.ts
?   ?   ?       ??? imoveis/route.ts
?   ?   ?       ??? denuncias/[id]/route.ts
?   ?   ?       ??? usuarios/route.ts
?   ?   ?       ??? faculdades/
?   ?   ?           ??? route.ts
?   ?   ?           ??? [id]/route.ts
?   ?   ??? layout.tsx             ? Root layout (fonts, providers)
?   ?   ??? globals.css
?   ??? components/
?   ?   ??? ui/                    ? shadcn/ui components
?   ?   ??? layout/
?   ?   ?   ??? Header.tsx
?   ?   ?   ??? Sidebar.tsx
?   ?   ?   ??? Footer.tsx
?   ?   ?   ??? AuthLayout.tsx     ? Layout split para login/cadastro
?   ?   ??? imoveis/
?   ?   ?   ??? ImovelCard.tsx
?   ?   ?   ??? ImovelGaleria.tsx
?   ?   ?   ??? ImovelMapa.tsx
?   ?   ?   ??? ImovelFiltros.tsx
?   ?   ?   ??? ImovelCarrossel.tsx
?   ?   ??? anunciar/
?   ?   ?   ??? WizardLayout.tsx   ? Barra de progresso + nav
?   ?   ?   ??? Step1Intencao.tsx
?   ?   ?   ??? Step2Tipo.tsx
?   ?   ?   ??? Step3Endereco.tsx
?   ?   ?   ??? Step4Caracteristicas.tsx
?   ?   ?   ??? Step5Valores.tsx
?   ?   ?   ??? Step6Fotos.tsx
?   ?   ?   ??? Step7Descricao.tsx
?   ?   ?   ??? Step8Revisao.tsx
?   ?   ??? shared/
?   ?       ??? ModalLogin.tsx
?   ?       ??? ModalDenuncia.tsx
?   ?       ??? BotaoWhatsapp.tsx
?   ?       ??? ToastProvider.tsx
?   ??? lib/
?   ?   ??? prisma.ts              ? Prisma Client singleton
?   ?   ??? auth.ts                ? NextAuth config
?   ?   ??? r2.ts                  ? Cloudflare R2 client
?   ?   ??? resend.ts              ? Resend client
?   ?   ??? validations.ts         ? Schemas Zod
?   ?   ??? utils.ts               ? Funções auxiliares
?   ??? emails/                    ? Templates React Email
?   ?   ??? ConfirmacaoEmail.tsx
?   ?   ??? ResetSenha.tsx
?   ?   ??? RenovacaoAnuncio.tsx
?   ??? hooks/
?   ?   ??? useImoveis.ts
?   ?   ??? useFavoritos.ts
?   ?   ??? useAnuncioWizard.ts
?   ??? types/
?   ?   ??? index.ts               ? Tipos TypeScript do domínio
?   ??? middleware.ts              ? Proteção de rotas
??? public/
?   ??? images/
??? .env.local                     ? Variáveis de ambiente
??? next.config.ts
??? tailwind.config.ts
??? package.json

9.1 Variáveis de Ambiente (.env.local)
# Banco de dados
DATABASE_URL=postgresql://...
 
# NextAuth
NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
 
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=imopin-fotos
R2_PUBLIC_URL=https://seu-dominio.r2.dev
 
# Resend
RESEND_API_KEY=re_...
RESEND_FROM=noreply@imopin.com.br
 
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000


10. Checklist de Implementação
Use este checklist como guia de progresso. A ordem sugerida minimiza retrabalho — configure infra antes de UI, banco antes de API, API antes de frontend.
Fase 1 — Setup e Infraestrutura
• [ ] Criar projeto Next.js 16 com pnpm: npx create-next-app@latest imopin --typescript --tailwind --app
• [ ] Instalar dependências: prisma, nextauth, zod, react-email, resend, @aws-sdk/client-s3, bcryptjs
• [ ] Configurar Neon: criar projeto, copiar DATABASE_URL
• [ ] Configurar Cloudflare R2: criar bucket, gerar API token, definir domínio público
• [ ] Configurar Resend: criar conta, verificar domínio, gerar API key
• [ ] Criar prisma/schema.prisma com todos os modelos da Seção 4
• [ ] Rodar npx prisma migrate dev --name init
• [ ] Criar prisma/seed.ts com faculdades de Pinheiro e usuário admin
• [ ] Configurar middleware.ts para proteção de rotas

Fase 2 — Autenticação
• [ ] Implementar POST /api/auth/cadastro
• [ ] Template de e-mail: ConfirmacaoEmail.tsx
• [ ] Implementar GET /api/auth/confirmar-email
• [ ] Implementar POST /api/auth/reenviar-confirmacao
• [ ] Configurar NextAuth com Credentials Provider em /lib/auth.ts
• [ ] Implementar fluxo de recuperação de senha (2 endpoints + template)
• [ ] Tela de cadastro /auth/cadastro
• [ ] Tela de login /auth/login
• [ ] Tela de confirmação pendente /auth/confirmar-email
• [ ] Tela de conta ativada /auth/email-confirmado
• [ ] Telas de recuperação de senha

Fase 3 — Core de Imóveis
• [ ] Implementar GET /api/imoveis (com todos os filtros)
• [ ] Implementar POST /api/imoveis (com validação de limite semanal)
• [ ] Implementar GET /api/imoveis/[id]
• [ ] Implementar PUT /api/imoveis/[id]
• [ ] Implementar PATCH /api/imoveis/[id]/status
• [ ] Implementar DELETE /api/imoveis/[id] (com deleção no R2)
• [ ] Implementar POST /api/upload (presigned URL para R2)
• [ ] Implementar GET /api/imoveis/[id]/proximos

Fase 4 — UI Principal
• [ ] Componentes base: Header, Sidebar, Footer, AuthLayout
• [ ] Landing Page /
• [ ] Home de busca /buscar
• [ ] ImovelCard.tsx
• [ ] Listagem /imoveis com filtros e ordenação
• [ ] Detalhe do imóvel /imoveis/[id] com mapa Leaflet
• [ ] ModalLogin.tsx (aciona quando não logado tenta contatar)
• [ ] BotaoWhatsapp.tsx

Fase 5 — Anunciante
• [ ] WizardLayout.tsx com barra de progresso
• [ ] Steps 1 a 8 do wizard de criação
• [ ] Integração de upload de fotos (presigned URL + drag-and-drop)
• [ ] Persistência do wizard em localStorage (anti-reload)
• [ ] Tela /meus-anuncios com todas as ações
• [ ] Edição de anúncio (carrega dados no wizard)

Fase 6 — Funcionalidades do Usuário
• [ ] Sistema de favoritos (POST + DELETE + listagem)
• [ ] Tela /favoritos com badge de status
• [ ] Tela /meus-dados com edição e troca de senha
• [ ] Sistema de denúncias (modal + endpoint)

Fase 7 — Admin e Automações
• [ ] Painel /admin com dashboard de métricas
• [ ] CRUD de faculdades no admin
• [ ] Moderação de imóveis e denúncias
• [ ] Cron job de renovação de anúncios (vercel.json: crons)
• [ ] Template de e-mail RenovacaoAnuncio.tsx
• [ ] Endpoint POST /api/renovar-anuncio

Fase 8 — Qualidade e Deploy
• [ ] Revisão de responsividade em todas as telas (mobile-first)
• [ ] Configurar domínio personalizado na Vercel
• [ ] Configurar domínio de e-mail no Resend
• [ ] Variáveis de ambiente no painel da Vercel
• [ ] Testar fluxo completo: cadastro ? confirmar ? anunciar ? buscar ? contatar
• [ ] Testar limite de 10 anúncios/semana
• [ ] Testar upload de imagem 8MB
• [ ] Testar fluxo de favoritos com imóvel alugado


Dica para Vibe Coding: Ao usar IA para gerar código, forneça sempre o contexto desta spec. Exemplo de prompt: 'Crie a API route POST /api/auth/cadastro para o projeto ImoPin. Usa Next.js 14 App Router, TypeScript, Prisma com os modelos da spec, Resend para e-mail e bcryptjs para hash de senha. Valida com Zod os campos: name (string), phone (string BR), email (string), password (min 8 chars), confirmPassword.'
— FIM DO DOCUMENTO —
ImoPin SDD v1.0.0 — Gerado automaticamente
