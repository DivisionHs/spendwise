// Categorias de despesa da user story US01 (Fase 1). As cores seguem as telas do protótipo (Fase 2).
import type { CodigoCategoria } from '../tipos.ts'

export interface CategoriaDespesaInfo {
  valor: CodigoCategoria
  rotulo: string
  cor: string
}

export const CATEGORIAS_DESPESA: CategoriaDespesaInfo[] = [
  { valor: 'ALIMENTACAO', rotulo: 'Alimentação', cor: '#f59e0b' },
  { valor: 'TRANSPORTE', rotulo: 'Transporte', cor: '#0ea5e9' },
  { valor: 'MORADIA', rotulo: 'Moradia', cor: '#1e3a8a' },
  { valor: 'LAZER', rotulo: 'Lazer', cor: '#a855f7' },
  { valor: 'SAUDE', rotulo: 'Saúde', cor: '#ef4444' },
  { valor: 'EDUCACAO', rotulo: 'Educação', cor: '#10b981' },
  { valor: 'OUTROS', rotulo: 'Outros', cor: '#64748b' },
]

export const OPCOES_CATEGORIA = CATEGORIAS_DESPESA.map((c) => ({ valor: c.valor as string, rotulo: c.rotulo }))

export function rotuloCategoria(valor: string | undefined): string {
  return CATEGORIAS_DESPESA.find((c) => c.valor === valor)?.rotulo ?? valor ?? ''
}

export function corCategoria(valor: string | undefined): string {
  return CATEGORIAS_DESPESA.find((c) => c.valor === valor)?.cor ?? '#64748b'
}