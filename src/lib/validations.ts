import { z } from 'zod'

export const cadastroSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const imovelSchema = z.object({
  titulo: z.string().min(10).max(100),
  descricao: z.string().min(50).max(2000),
  finalidade: z.enum(['ALUGAR', 'VENDER', 'ALUGAR_E_VENDER']),
  tipoCategoria: z.enum(['RESIDENCIAL', 'COMERCIAL']),
  tipoImovel: z.enum([
    'APARTAMENTO', 'CASA', 'CASA_CONDOMINIO', 'CHACARA', 'COBERTURA',
    'FLAT', 'KITNET', 'LOTE_TERRENO', 'SOBRADO', 'EDIFICIO',
    'FAZENDA_SITIO', 'CONSULTORIO', 'GALPAO', 'IMOVEL_COMERCIAL',
    'LOTE_COMERCIAL', 'PONTO_COMERCIAL',
  ]),
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
  rua: z.string().min(3),
  numero: z.string(),
  complemento: z.string().optional(),
  bairro: z.string().min(2),
  lat: z.number().optional(),
  lng: z.number().optional(),
  areaM2: z.number().positive().optional(),
  quartos: z.number().int().min(0).max(20),
  banheiros: z.number().int().min(0).max(20),
  vagas: z.number().int().min(0).max(10),
  mobiliado: z.boolean(),
  aceitaPets: z.boolean(),
  piscina: z.boolean(),
  churrasqueira: z.boolean(),
  portaria: z.boolean(),
  condominioFechado: z.boolean(),
  precoAluguel: z.number().positive().optional(),
  precoVenda: z.number().positive().optional(),
  condominio: z.number().positive().optional(),
  iptu: z.number().positive().optional(),
  whatsapp: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/),
})

export const perfilSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/),
})

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8),
  confirmarNovaSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarNovaSenha, {
  message: 'Senhas não conferem',
  path: ['confirmarNovaSenha'],
})

export const recuperarSenhaSchema = z.object({
  email: z.string().email(),
})

export const denunciaSchema = z.object({
  imovelId: z.string(),
  motivo: z.enum(['INFO_FALSA', 'FOTO_INADEQUADA', 'CONTATO_INVALIDO', 'OUTRO']),
  descricao: z.string().max(500).optional(),
})
