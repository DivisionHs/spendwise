import { Link, useNavigate } from 'react-router-dom'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../components/FormularioCrud.tsx'
import { usuariosApi } from '../services/api.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'nome', rotulo: 'Nome', obrigatorio: true, maximo: 100 },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, maximo: 100 },
  { nome: 'cep', rotulo: 'CEP', obrigatorio: true, maximo: 9, dica: 'Ex.: 01310-100' },
  { nome: 'senha', rotulo: 'Senha', tipo: 'password', obrigatorio: true, dica: 'Mínimo de 6 caracteres.' },
]

// Página pública para criar uma conta nova (POST /api/usuarios) e depois ir ao login.
export default function Cadastro() {
  const navegar = useNavigate()

  async function salvar(valores: ValoresFormulario) {
    await usuariosApi.criar(valores)
    navegar('/login')
  }

  return (
    <div className="pagina-centro">
      <div className="cartao-login">
        <div className="marca-grande">
          Spend<span>Wise</span>
        </div>
        <p className="subtitulo-login">Crie sua conta.</p>
        <FormularioCrud
          campos={CAMPOS}
          valoresIniciais={{ nome: '', email: '', cep: '', senha: '' }}
          aoSalvar={salvar}
          rotaVoltar="/login"
          textoBotao="Criar conta"
          mensagemSucesso="Conta criada com sucesso. Faça o login."
        />
        <p className="rodape-login">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
