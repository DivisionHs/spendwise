import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, registrarAoSessaoExpirar, sessaoToken } from '../services/api.ts'
import type { Usuario } from '../tipos.ts'

// Guarda o usuário logado (estado global) e oferece login e logout para as páginas.
// A sessão fica no localStorage (vale por dias, como o token): o usuário não precisa entrar toda vez.
// Se o token vencer ou for recusado pela API (401), a sessão é encerrada e a pessoa volta ao login.
interface ContextoAuth {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<Usuario>
  sair: () => void
  atualizar: (dados: Usuario) => void
}

const AuthContext = createContext<ContextoAuth | null>(null)
const CHAVE = 'spendwise.usuario'
export const CHAVE_SESSAO_EXPIRADA = 'spendwise.sessaoExpirada'

function lerUsuarioSalvo(): Usuario | null {
  try {
    // Sem token não há sessão válida (ex.: sessão antiga, de antes do login por token)
    if (!sessaoToken.ler()) return null
    return JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo)

  const entrar = useCallback(async (email: string, senha: string) => {
    const { token, ...dados } = await authApi.login(email, senha)
    sessaoToken.gravar(token)
    localStorage.setItem(CHAVE, JSON.stringify(dados))
    setUsuario(dados)
    return dados
  }, [])

  const sair = useCallback(() => {
    sessaoToken.limpar()
    localStorage.removeItem(CHAVE)
    setUsuario(null)
  }, [])

  // Usado quando o próprio usuário edita seus dados (mantém o nome do menu em dia)
  const atualizar = useCallback((dados: Usuario) => {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
    setUsuario(dados)
  }, [])

  // API respondeu 401: token vencido ou inválido. Encerra a sessão e avisa na tela de login.
  useEffect(() => {
    registrarAoSessaoExpirar(() => {
      sessionStorage.setItem(CHAVE_SESSAO_EXPIRADA, '1')
      sair()
    })
    return () => registrarAoSessaoExpirar(null)
  }, [sair])

  const valor = useMemo(() => ({ usuario, entrar, sair, atualizar }), [usuario, entrar, sair, atualizar])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

/** Usuário logado, garantido: só deve ser usado em páginas protegidas por RotaProtegida. */
export function useAuth(): ContextoAuth & { usuario: Usuario } {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return contexto as ContextoAuth & { usuario: Usuario }
}

/** Versão para telas públicas (login), onde o usuário pode ser nulo. */
export function useAuthPublico(): ContextoAuth {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuthPublico deve ser usado dentro de <AuthProvider>.')
  return contexto
}