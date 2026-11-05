import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../services/api.ts'
import type { Usuario } from '../tipos.ts'

// Guarda o usuário logado (estado global) e oferece login e logout para as páginas.
// A sessão fica no sessionStorage: some ao fechar a aba.
interface ContextoAuth {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<Usuario>
  sair: () => void
  atualizar: (dados: Usuario) => void
}

const AuthContext = createContext<ContextoAuth | null>(null)
const CHAVE = 'spendwise.usuario'

function lerUsuarioSalvo(): Usuario | null {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo)

  const entrar = useCallback(async (email: string, senha: string) => {
    const dados = await authApi.login(email, senha)
    sessionStorage.setItem(CHAVE, JSON.stringify(dados))
    setUsuario(dados)
    return dados
  }, [])

  const sair = useCallback(() => {
    sessionStorage.removeItem(CHAVE)
    setUsuario(null)
  }, [])

  // Usado quando o próprio usuário edita seus dados (mantém o nome do menu em dia)
  const atualizar = useCallback((dados: Usuario) => {
    sessionStorage.setItem(CHAVE, JSON.stringify(dados))
    setUsuario(dados)
  }, [])

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