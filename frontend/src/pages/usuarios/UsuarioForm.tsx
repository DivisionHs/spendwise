import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { usuariosApi } from '../../services/api.ts'

// Inserção (POST) e atualização (PUT) de usuário, numa janela sobre a lista.
// A senha é opcional na edição: em branco mantém a atual.
// Antes de gravar abre um pop-up de confirmação; depois mostra um aviso de sucesso.
export default function UsuarioForm() {
  const { id } = useParams()
  const { usuario, atualizar } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(usuariosApi.buscar, id)
  const titulo = id ? 'Editar usuário' : 'Novo usuário'

  const campos: CampoFormulario[] = [
    { nome: 'nome', rotulo: 'Nome', obrigatorio: true, maximo: 100 },
    { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true, maximo: 100 },
    { nome: 'cep', rotulo: 'CEP', obrigatorio: true, maximo: 9, dica: 'Ex.: 01310-100' },
    {
      nome: 'senha',
      rotulo: 'Nova senha',
      tipo: 'password',
      obrigatorio: !id,
      dica: id ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.',
    },
  ]

  async function salvar(valores: ValoresFormulario) {
    const atualizado = id
      ? await usuariosApi.atualizar(id, valores)
      : await usuariosApi.criar(valores)
    // Se editou a si mesmo, atualiza o nome mostrado no menu
    if (atualizado.idUsuario === usuario.idUsuario) atualizar(atualizado)
    await recarregar()
    navegar('/usuarios')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/usuarios">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { nome: registro.nome, email: registro.email, cep: registro.cep, senha: '' }
    : { nome: '', email: '', cep: '', senha: '' }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/usuarios">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={campos}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/usuarios"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar usuário'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações do usuário?' : 'Cadastrar este usuário?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.'}
      />
    </JanelaFormulario>
  )
}
