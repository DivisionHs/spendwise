// Cálculos que alimentam os textos de "O que os números dizem" em cada página.
// São regras simples sobre os dados (nada de previsão): somas, proporções e comparações.
import { chaveMes, rotuloMes, somar, somarPorMes, ultimosMeses } from './agregar.ts'

export interface VariacaoMensal {
  rotuloRecente: string
  rotuloAnterior: string
  valorRecente: number
  valorAnterior: number
  pct: number
}

export const porcentagem = (parte: number, todo: number): number => (todo > 0 ? Math.round((parte / todo) * 100) : 0)

// Quantos meses diferentes têm lançamentos (para calcular a média mensal)
export function mesesComDados<T extends { data: string }>(itens: T[]): number {
  return new Set(itens.map((i) => chaveMes(i.data))).size
}

export function mediaMensal<T extends { data: string }>(itens: T[], campo: keyof T): number {
  const meses = mesesComDados(itens)
  return meses > 0 ? somar(itens, campo) / meses : 0
}

// Compara os dois últimos meses COMPLETOS (o mês atual ainda está em andamento).
// Devolve null se faltar dado em algum dos dois.
export function variacaoMensal<T extends { data: string }>(itens: T[], campo: keyof T): VariacaoMensal | null {
  const meses = ultimosMeses(3) // [antepenúltimo, último completo, mês atual]
  const anterior = meses[0]
  const recente = meses[1]
  const porMes = somarPorMes(itens, campo)
  const valorRecente = porMes[recente.chave] ?? 0
  const valorAnterior = porMes[anterior.chave] ?? 0
  if (valorRecente <= 0 || valorAnterior <= 0) return null
  return {
    rotuloRecente: rotuloMes(recente.chave),
    rotuloAnterior: rotuloMes(anterior.chave),
    valorRecente,
    valorAnterior,
    pct: Math.round(((valorRecente - valorAnterior) / valorAnterior) * 100),
  }
}

// "12% a mais" / "8% a menos" / "o mesmo valor", para frases de comparação
export function fraseVariacao(variacao: VariacaoMensal): string {
  if (variacao.pct === 0) return 'o mesmo valor'
  return variacao.pct > 0 ? `${variacao.pct}% a mais` : `${-variacao.pct}% a menos`
}

// Perfil da carteira pelo peso de cada nível de risco (valores em reais)
export function perfilCarteira({ baixo, moderado, alto }: { baixo: number; moderado: number; alto: number }): string | null {
  const total = baixo + moderado + alto
  if (total <= 0) return null
  if (baixo / total >= 0.6) return 'conservador'
  if (alto / total >= 0.4) return 'arrojado'
  return 'equilibrado'
}