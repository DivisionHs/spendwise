import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { metasApi } from '../../services/api.ts'
import { dataBr, hojeIso, moeda } from '../../services/formatar.ts'

// Inserção (POST) e atualização (PUT) de meta, numa janela sobre a lista.
export default function MetaForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(metasApi.buscar, id)
  const titulo = id ? 'Editar meta' : 'Nova meta'

  const campos: CampoFormulario[] = [
    { nome: 'descricao', rotulo: 'Nome da meta', obrigatorio: true, maximo: 100 },
    { nome: 'valorAlvo', rotulo: 'Valor alvo (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda },
    { nome: 'dataLimite', rotulo: 'Prazo', tipo: 'date', obrigatorio: true, formatar: dataBr, dica: id ? undefined : 'Não pode estar no passado.' },
  ]

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      descricao: valores.descricao,
      valorAlvo: Number(valores.valorAlvo),
      dataLimite: valores.dataLimite,
    }
    if (id) {
      await metasApi.atualizar(id, corpo)
    } else {
      await metasApi.criar(corpo)
    }
    await recarregar()
    navegar('/metas')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/metas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { descricao: registro.descricao, valorAlvo: registro.valorAlvo, dataLimite: registro.dataLimite }
    : { descricao: '', valorAlvo: '', dataLimite: hojeIso() }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/metas">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={campos}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/metas"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar meta'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da meta?' : 'Cadastrar esta meta?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Meta atualizada com sucesso.' : 'Meta cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}