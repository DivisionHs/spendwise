// Funções do extrato: junta receitas e despesas numa lista só, exporta e importa CSV.
import type { CodigoCategoria, Despesa, Lancamento, Receita } from '../tipos.ts'
import { CATEGORIAS_DESPESA, rotuloCategoria } from './categorias.ts'
import { hojeIso } from './formatar.ts'

// Receitas e despesas viram "lançamentos" do mesmo formato (como a herança Transacao do backend).
export function montarLancamentos(receitas: Receita[], despesas: Despesa[]): Lancamento[] {
  const hoje = hojeIso()
  const deReceitas: Lancamento[] = receitas.map((r) => ({
    chave: `R${r.idReceita}`,
    id: r.idReceita,
    tipo: 'RECEITA',
    data: r.data,
    descricao: r.descricao,
    categoria: 'RECEITA',
    rotuloCategoria: 'Receita',
    valorAssinado: Number(r.valor),
    status: r.data > hoje ? ('PENDENTE' as const) : ('CONCLUIDO' as const),
  }))
  const deDespesas: Lancamento[] = despesas.map((d) => ({
    chave: `D${d.idDespesa}`,
    id: d.idDespesa,
    tipo: 'DESPESA',
    data: d.data,
    descricao: d.descricao,
    categoria: d.categoria,
    rotuloCategoria: rotuloCategoria(d.categoria),
    valorAssinado: -Number(d.valor),
    status: d.data > hoje ? ('PENDENTE' as const) : ('CONCLUIDO' as const),
  }))
  return [...deReceitas, ...deDespesas].sort((a, b) => b.data.localeCompare(a.data) || b.chave.localeCompare(a.chave))
}

function celula(texto: unknown): string {
  const t = String(texto ?? '')
  return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

// Gera o texto CSV (separador ponto e vírgula) no mesmo formato aceito pela importação.
export function paraCsv(lancamentos: Lancamento[]): string {
  const linhas = ['data;descricao;valor;categoria']
  for (const l of lancamentos) {
    linhas.push(
      [l.data, celula(l.descricao), l.valorAssinado.toFixed(2), l.tipo === 'DESPESA' ? l.categoria : ''].join(';'),
    )
  }
  return linhas.join('\n')
}

export function baixarArquivo(nome: string, conteudo: string): void {
  const blob = new Blob(['\ufeff' + conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.click()
  URL.revokeObjectURL(url)
}

export const MODELO_CSV = [
  'data;descricao;valor;categoria',
  '2026-11-03;Salário da empresa;5200,00;',
  '2026-11-04;Mercado do bairro;-210,50;ALIMENTACAO',
  '05/11/2026;Passagem de ônibus;-85,00;TRANSPORTE',
].join('\n')

function normalizar(texto: unknown): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function lerData(texto: string): string | null {
  const t = texto.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

function lerValor(texto: string): number | null {
  let t = texto.replace(/R\$/gi, '').replace(/\s/g, '')
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return Number.isFinite(n) && n !== 0 ? n : null
}

export interface LinhaImportada {
  linha: number
  ok: boolean
  erro?: string
  tipo?: 'RECEITA' | 'DESPESA'
  data: string | null
  descricao: string
  valor: number | null
  categoria?: CodigoCategoria
}

// Lê o CSV do extrato: data;descricao;valor[;categoria]. Valor positivo = receita, negativo = despesa.
// Devolve uma lista de { linha, ok, erro?, tipo, data, descricao, valor, categoria }.
export function lerCsv(texto: string): LinhaImportada[] {
  const linhas = texto.replace(/^\ufeff/, '').split(/\r?\n/).filter((l) => l.trim() !== '')
  const resultado: LinhaImportada[] = []
  linhas.forEach((bruta, i) => {
    const partes = bruta.split(bruta.includes(';') ? ';' : ',').map((p) => p.trim().replace(/^"|"$/g, ''))
    if (i === 0 && /^data$/i.test(partes[0])) return // cabeçalho
    const [dataTxt = '', descricao = '', valorTxt = '', categoriaTxt = ''] = partes
    const data = lerData(dataTxt)
    const valor = lerValor(valorTxt)
    const base = { linha: i + 1, data, descricao, valor }
    if (!data) return resultado.push({ ...base, ok: false, erro: 'data inválida (use AAAA-MM-DD ou DD/MM/AAAA)' })
    if (!descricao) return resultado.push({ ...base, ok: false, erro: 'descrição vazia' })
    if (valor === null) return resultado.push({ ...base, ok: false, erro: 'valor inválido ou zero' })
    if (valor > 0) return resultado.push({ ...base, ok: true, tipo: 'RECEITA', valor })
    const alvo = normalizar(categoriaTxt)
    const categoria =
      CATEGORIAS_DESPESA.find((c) => c.valor === alvo || normalizar(c.rotulo) === alvo)?.valor ?? 'OUTROS'
    return resultado.push({ ...base, ok: true, tipo: 'DESPESA', valor: Math.abs(valor), categoria })
  })
  return resultado
}