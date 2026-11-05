// Funções de formatação usadas nas tabelas e nos cartões.

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function moeda(valor: number | string | null | undefined): string {
  return formatadorMoeda.format(Number(valor ?? 0))
}

// "2026-11-05" -> "05/11/2026" (sem passar por Date, para não deslocar o dia por fuso)
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return ''
  const [ano, mes, dia] = String(iso).split('-')
  return `${dia}/${mes}/${ano}`
}

// "ALTO" ou "alto" -> "Alto" (o banco tem registros antigos em formatos diferentes)
export function risco(valor: string | null | undefined): string {
  const texto = String(valor ?? '').toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "01310100" -> "01310-100"
export function cep(valor: string | null | undefined): string {
  const digitos = String(valor ?? '').replace(/\D/g, '')
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : String(valor ?? '')
}

// Data de hoje no formato do input type="date" (AAAA-MM-DD), pelo relógio local
export function hojeIso(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}