import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { dividasApi } from '../../services/api.ts'
import { dataBr, hojeIso, moeda } from '../../services/formatar.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'descricao', rotulo: 'Descrição (credor e tipo)', obrigatorio: true, maximo: 255 },
  { nome: 'valor', rotulo: 'Valor em aberto (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda },
  { nome: 'vencimento', rotulo: 'Vencimento', tipo: 'date', obrigatorio: true, formatar: dataBr },
]

// Inserção (POST) e atualização (PUT) de dívida, numa janela sobre a lista.
export default function DividaForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(dividasApi.buscar, id)
  const titulo = id ? 'Editar dívida' : 'Nova dívida'

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      descricao: valores.descricao,
      valor: Number(valores.valor),
      vencimento: valores.vencimento,
    }
    if (id) {
      await dividasApi.atualizar(id, corpo)
    } else {
      await dividasApi.criar(corpo)
    }
    await recarregar()
    navegar('/dividas')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/dividas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { descricao: registro.descricao, valor: registro.valor, vencimento: registro.vencimento }
    : { descricao: '', valor: '', vencimento: hojeIso() }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/dividas">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={CAMPOS}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/dividas"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar dívida'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da dívida?' : 'Cadastrar esta dívida?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Dívida atualizada com sucesso.' : 'Dívida cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}