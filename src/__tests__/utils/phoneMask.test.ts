import { describe, it, expect } from 'vitest'
import { applyPhoneMask } from '@/lib/phoneMask'

describe('applyPhoneMask', () => {
  it('deve formatar números com máscara de telefone fixo ou celular', () => {
    expect(applyPhoneMask('98999999999')).toBe('(98) 99999-9999')
    expect(applyPhoneMask('9899999999')).toBe('(98) 9999-9999')
    expect(applyPhoneMask('98')).toBe('(98')
    expect(applyPhoneMask('989')).toBe('(98) 9')
  })

  it('deve lidar com caracteres não numéricos', () => {
    expect(applyPhoneMask('98a9999b9999')).toBe('(98) 9999-9999')
  })

  it('deve limitar a 11 dígitos', () => {
    expect(applyPhoneMask('98999999999999')).toBe('(98) 99999-9999')
  })
})
