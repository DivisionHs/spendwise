// Cálculos usados pelos gráficos: tudo é feito no navegador a partir das listas da API.

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export interface Mes {
  chave: string // "2026-11"
  rotulo: string // "nov/26"
}

export interface ItemRanking {
  rotulo: string
  valor: number
}

// "2026-11-05" -> "2026-11"
export function chaveMes(iso: string | null | undefined): string {
  return String(iso ?? '').slice(0, 7)
}

// "2026-11" -> "nov/26"
export function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split('-')
  return `${MESES_CURTOS[Number(mes) - 1]}/${ano.slice(2)}`
}

// Os últimos `quantidade` meses, do mais antigo ao mês atual (relógio local).
export function ultimosMeses(quantidade: number): Mes[] {
  const hoje = new Date()
  const lista: Mes[] = []
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    lista.push({ chave, rotulo: rotuloMes(chave) })
  }
  return lista
}

export function somar<T>(lista: T[], campo: keyof T): number {
  return lista.reduce((total, item) => total + Number(item[campo] ?? 0), 0)
}

// Soma `campo` por mês. Devolve { '2026-11': 1234.5, ... }
export function somarPorMes<T extends { data: string }>(lista: T[], campo: keyof T): Record<string, number> {
  const resultado: Record<string, number> = {}
  for (const item of lista) {
    const chave = chaveMes(item.data)
    resultado[chave] = (resultado[chave] ?? 0) + Number(item[campo] ?? 0)
  }
  return resultado
}

// Agrupa por um texto (descrição ou categoria) e ordena do maior para o menor.
export function agruparPor<T>(lista: T[], funcaoChave: (item: T) => string | undefined, campo: keyof T): ItemRanking[] {
  const mapa = new Map<string, number>()
  for (const item of lista) {
    const chave = funcaoChave(item) || 'Outros'
    mapa.set(chave, (mapa.get(chave) ?? 0) + Number(item[campo] ?? 0))
  }
  return [...mapa.entries()].map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor)
}

// Mantém só os lançamentos dos meses informados (lista de chaves "AAAA-MM").
export function filtrarPorMeses<T extends { data: string }>(lista: T[], chaves: string[]): T[] {
  const conjunto = new Set(chaves)
  return lista.filter((item) => conjunto.has(chaveMes(item.data)))
}

// Valor em reais abreviado para os eixos: 1500 -> "1,5 mil"
export function moedaCurta(valor: number): string {
  const abs = Math.abs(valor)
  const sinal = valor < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sinal}${(abs / 1_000_000).toFixed(1).replace('.', ',')} mi`
  if (abs >= 1000) return `${sinal}${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1).replace('.', ',')} mil`
  return `${sinal}${Math.round(abs)}`
}

// Escala "bonita" para o eixo Y: devolve { max, passos: [0, 1000, 2000...] }
export function escalaEixo(maior: number, quantidade = 4): { max: number; passos: number[] } {
  if (maior <= 0) return { max: 1, passos: [0, 1] }
  const bruto = maior / quantidade
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const fracao = bruto / potencia
  const bonito = fracao <= 1 ? 1 : fracao <= 2 ? 2 : fracao <= 5 ? 5 : 10
  const passo = bonito * potencia
  const max = Math.ceil(maior / passo) * passo
  const passos: number[] = []
  for (let v = 0; v <= max + passo / 2; v += passo) passos.push(v)
  return { max, passos }
}