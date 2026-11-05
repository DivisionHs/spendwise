// Camada de acesso à API REST do backend (Spring Boot).
// Todas as páginas falam com o backend por aqui, usando fetch.
import type {
  AlertasEInsights,
  CategoriaInvestimento,
  Conta,
  Despesa,
  Divida,
  Investimento,
  Meta,
  Orcamento,
  OrcamentoStatus,
  Receita,
  ResumoFinanceiro,
  Usuario,
} from '../tipos.ts'

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export class ErroApi extends Error {
  status: number

  constructor(mensagem: string, status: number) {
    super(mensagem)
    this.status = status
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  corpo?: unknown
}

async function requisitar<T>(caminho: string, { metodo = 'GET', corpo }: Opcoes = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 0)
  }

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status} ao falar com o servidor.`
    try {
      const dados = await resposta.json()
      if (dados?.mensagem) mensagem = dados.mensagem
    } catch {
      // resposta sem corpo JSON: mantém a mensagem padrão
    }
    throw new ErroApi(mensagem, resposta.status)
  }

  // DELETE devolve 204 sem corpo
  if (resposta.status === 204) return null as T
  return resposta.json() as Promise<T>
}

export const api = {
  get: <T>(caminho: string) => requisitar<T>(caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisitar<T>(caminho, { metodo: 'POST', corpo }),
  put: <T>(caminho: string, corpo?: unknown) => requisitar<T>(caminho, { metodo: 'PUT', corpo }),
  delete: (caminho: string) => requisitar<null>(caminho, { metodo: 'DELETE' }),
}

// Atalhos por entidade (um por controller do backend)
export const authApi = {
  login: (email: string, senha: string) => api.post<Usuario>('/auth/login', { email, senha }),
}

export const usuariosApi = {
  listar: () => api.get<Usuario[]>('/usuarios'),
  buscar: (id: number | string) => api.get<Usuario>(`/usuarios/${id}`),
  criar: (dados: unknown) => api.post<Usuario>('/usuarios', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Usuario>(`/usuarios/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/usuarios/${id}`),
}

export const receitasApi = {
  listarTodas: () => api.get<Receita[]>('/receitas'),
  listar: (idUsuario: number) => api.get<Receita[]>(`/receitas?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Receita>(`/receitas/${id}`),
  criar: (dados: unknown) => api.post<Receita>('/receitas', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Receita>(`/receitas/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/receitas/${id}`),
}

export const despesasApi = {
  listarTodas: () => api.get<Despesa[]>('/despesas'),
  listar: (idUsuario: number) => api.get<Despesa[]>(`/despesas?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Despesa>(`/despesas/${id}`),
  criar: (dados: unknown) => api.post<Despesa>('/despesas', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Despesa>(`/despesas/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/despesas/${id}`),
}

export const categoriasApi = {
  listar: () => api.get<CategoriaInvestimento[]>('/categorias-investimento'),
  buscar: (id: number | string) => api.get<CategoriaInvestimento>(`/categorias-investimento/${id}`),
  criar: (dados: unknown) => api.post<CategoriaInvestimento>('/categorias-investimento', dados),
  atualizar: (id: number | string, dados: unknown) =>
    api.put<CategoriaInvestimento>(`/categorias-investimento/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/categorias-investimento/${id}`),
}

export const investimentosApi = {
  listarTodos: () => api.get<Investimento[]>('/investimentos'),
  listar: (idUsuario: number) => api.get<Investimento[]>(`/investimentos?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Investimento>(`/investimentos/${id}`),
  criar: (dados: unknown) => api.post<Investimento>('/investimentos', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Investimento>(`/investimentos/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/investimentos/${id}`),
}

export const resumoApi = {
  buscar: (idUsuario: number) => api.get<ResumoFinanceiro>(`/resumo/${idUsuario}`),
}

export const contasApi = {
  listar: (idUsuario: number) => api.get<Conta[]>(`/contas?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Conta>(`/contas/${id}`),
  criar: (dados: unknown) => api.post<Conta>('/contas', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Conta>(`/contas/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/contas/${id}`),
}

export const dividasApi = {
  listar: (idUsuario: number) => api.get<Divida[]>(`/dividas?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Divida>(`/dividas/${id}`),
  criar: (dados: unknown) => api.post<Divida>('/dividas', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Divida>(`/dividas/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/dividas/${id}`),
  pagar: (id: number | string, valor: number) => api.post<Divida>(`/dividas/${id}/pagamentos`, { valor }),
}

export const metasApi = {
  listar: (idUsuario: number) => api.get<Meta[]>(`/metas?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Meta>(`/metas/${id}`),
  criar: (dados: unknown) => api.post<Meta>('/metas', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Meta>(`/metas/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/metas/${id}`),
  registrarProgresso: (id: number | string, valor: number) =>
    api.post<Meta>(`/metas/${id}/progressos`, { valor }),
}

export const orcamentosApi = {
  listar: (idUsuario: number) => api.get<Orcamento[]>(`/orcamentos?idUsuario=${idUsuario}`),
  status: (idUsuario: number) => api.get<OrcamentoStatus[]>(`/orcamentos/status?idUsuario=${idUsuario}`),
  buscar: (id: number | string) => api.get<Orcamento>(`/orcamentos/${id}`),
  criar: (dados: unknown) => api.post<Orcamento>('/orcamentos', dados),
  atualizar: (id: number | string, dados: unknown) => api.put<Orcamento>(`/orcamentos/${id}`, dados),
  excluir: (id: number | string) => api.delete(`/orcamentos/${id}`),
}

export const analiseApi = {
  alertasEInsights: (idUsuario: number) => api.get<AlertasEInsights>(`/analise/${idUsuario}`),
}