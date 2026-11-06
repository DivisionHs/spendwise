// Tipos do domínio do SpendWise: espelham o JSON que o backend (Spring Boot) devolve.
// Valores em dinheiro chegam como número; datas como texto no formato AAAA-MM-DD.

export type CodigoCategoria =
  | 'ALIMENTACAO'
  | 'TRANSPORTE'
  | 'MORADIA'
  | 'LAZER'
  | 'SAUDE'
  | 'EDUCACAO'
  | 'OUTROS'

export type TipoConta = 'CORRENTE' | 'POUPANCA'
export type SituacaoOrcamento = 'OK' | 'ATENCAO' | 'CRITICO' | 'EXCEDIDO'
export type SeveridadeAlerta = 'CRITICO' | 'ATENCAO' | 'INFORMATIVO'

export interface Usuario {
  idUsuario: number
  nome: string
  email: string
  cep: string
  papel?: 'USUARIO' | 'MASTER' // definido só pelo servidor; quem se cadastra é sempre USUARIO
  senha?: string // só vai na ida (cadastro e edição); o backend nunca devolve
}

/** Referência a um usuário no corpo de POST e PUT: basta o id. */
export interface RefUsuario {
  usuario: { idUsuario: number }
}

export interface Receita {
  idReceita: number
  usuario: Usuario
  valor: number
  data: string
  descricao: string
  tipo: 'RECEITA'
}

export interface Despesa {
  idDespesa: number
  usuario: Usuario
  valor: number
  data: string
  descricao: string
  categoria: CodigoCategoria
  tipo: 'DESPESA'
}

export interface Divida {
  idDivida: number
  usuario: Usuario
  valor: number
  vencimento: string
  descricao: string
  quitada: boolean
  vencida: boolean
}

export interface Meta {
  idMeta: number
  usuario: Usuario
  descricao: string
  valorAlvo: number
  valorAcumulado: number
  dataLimite: string
  percentual: number
  atingida: boolean
}

export interface Conta {
  idConta: number
  usuario: Usuario
  banco: string
  agencia: string
  numeroConta: string
  tipo: TipoConta
  saldo: number
}

export interface Orcamento {
  idOrcamento: number
  usuario: Usuario
  categoria: CodigoCategoria
  limite: number
}

export interface OrcamentoStatus {
  idOrcamento: number
  categoria: CodigoCategoria
  rotulo: string
  limite: number
  gasto: number
  restante: number
  percentual: number
  situacao: SituacaoOrcamento
}

export interface CategoriaInvestimento {
  idCatInvest: number
  nome: string
  risco: string
}

export interface Investimento {
  idInvest: number
  usuario: Usuario
  categoria: CategoriaInvestimento
  valorInvestido: number
  data: string
}

export interface ResumoFinanceiro {
  totalReceitas: number
  totalDespesas: number
  totalInvestido: number
  saldo: number
  saldoContas: number
  totalDividas: number
}

export interface Alerta {
  severidade: SeveridadeAlerta
  titulo: string
  descricao: string
  categoria: string
}

export interface Insight {
  titulo: string
  descricao: string
}

export interface AlertasEInsights {
  alertas: Alerta[]
  insights: Insight[]
}

/** Contexto que cada lista repassa às janelas de cadastro (rotas filhas, via Outlet). */
export interface ContextoLista {
  recarregar: () => Promise<void>
}

/** Qualquer lançamento do extrato (receita ou despesa), já no formato comum. */
export interface Lancamento {
  chave: string
  id: number
  tipo: 'RECEITA' | 'DESPESA'
  data: string
  descricao: string
  categoria: string
  rotuloCategoria: string
  valorAssinado: number
  status: 'CONCLUIDO' | 'PENDENTE'
}

/** Resposta do login: dados do usuário (sem senha) e o token de acesso. */
export type LoginResposta = Usuario & { token: string }
