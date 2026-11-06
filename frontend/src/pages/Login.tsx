import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alerta from '../components/Alerta.tsx'
import BotaoTema from '../components/BotaoTema.tsx'
import { CHAVE_SESSAO_EXPIRADA, useAuthPublico } from '../context/AuthContext.tsx'

// Página de autenticação: valida e-mail e senha no backend (POST /api/auth/login).
export default function Login() {
  const { usuario, entrar } = useAuthPublico()
  const navegar = useNavigate()
  const local = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  // Se a API recusou o token (sessão vencida), avisa uma vez ao chegar aqui
  const [erro, setErro] = useState(() => {
    if (!sessionStorage.getItem(CHAVE_SESSAO_EXPIRADA)) return ''
    sessionStorage.removeItem(CHAVE_SESSAO_EXPIRADA)
    return 'Sua sessão expirou. Entre novamente.'
  })
  const [entrando, setEntrando] = useState(false)

  // Já logado: não precisa ver a tela de login
  if (usuario) return <Navigate to="/" replace />

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')
    setEntrando(true)
    try {
      await entrar(email, senha)
      navegar(local.state?.de ?? '/', { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
      setEntrando(false)
    }
  }

  return (
    <div className="pagina-centro">
      <BotaoTema flutuante />
      <form className="cartao-login" onSubmit={enviar}>
        <div className="marca-grande">
          Spend<span>Wise</span>
        </div>
        <p className="subtitulo-login">Entre para acompanhar suas finanças.</p>

        <Alerta tipo="erro">{erro}</Alerta>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            required
            autoComplete="current-password"
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="botao botao-primario botao-bloco" disabled={entrando}>
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="rodape-login">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  )
}
