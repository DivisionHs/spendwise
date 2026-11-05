import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useDialogos } from '../../context/DialogosContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { despesasApi, orcamentosApi } from '../../services/api.ts'
import { OPCOES_CATEGORIA } from '../../services/categorias.ts'
import { dataBr, hojeIso, moeda } from '../../services/formatar.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'descricao', rotulo: 'Descrição', obrigatorio: true, maximo: 255 },
  { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', obrigatorio: true, opcoes: OPCOES_CATEGORIA },
  { nome: 'valor', rotulo: 'Valor (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda },
  { nome: 'data', rotulo: 'Data', tipo: 'date', obrigatorio: true, formatar: dataBr },
]

// Inserção (POST) e atualização (PUT) de despesa, numa janela sobre a lista. Com :id na rota é edição.
// Antes de gravar abre um pop-up de confirmação. Depois de gravar, avisa se a despesa levou o orçamento
// da categoria perto do limite ou acima dele (user story US03).
export default function DespesaForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const { notificar } = useDialogos()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(despesasApi.buscar, id)
  const titulo = id ? 'Editar despesa' : 'Nova despesa'

  async function avisarOrcamento(categoria: string) {
    try {
      const status = await orcamentosApi.status(usuario.idUsuario)
      const orcamento = status.find((o) => o.categoria === categoria)
      if (!orcamento) return
      if (orcamento.situacao === 'EXCEDIDO') {
        notificar('erro', `Você ultrapassou o orçamento de ${orcamento.rotulo} (${orcamento.percentual}% do limite do mês).`)
      } else if (orcamento.situacao === 'CRITICO' || orcamento.situacao === 'ATENCAO') {
        notificar('aviso', `Seu orçamento de ${orcamento.rotulo} chegou a ${orcamento.percentual}% do limite do mês.`)
      }
    } catch {
      // o aviso de orçamento é um extra: se falhar, a despesa já foi gravada e segue normal
    }
  }

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      descricao: valores.descricao,
      categoria: valores.categoria,
      valor: Number(valores.valor),
      data: valores.data,
    }
    if (id) {
      await despesasApi.atualizar(id, corpo)
    } else {
      await despesasApi.criar(corpo)
    }
    await recarregar()
    navegar('/despesas')
    await avisarOrcamento(String(valores.categoria))
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/despesas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { descricao: registro.descricao, categoria: registro.categoria, valor: registro.valor, data: registro.data }
    : { descricao: '', categoria: '', valor: '', data: hojeIso() }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/despesas">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={CAMPOS}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/despesas"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar despesa'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da despesa?' : 'Cadastrar esta despesa?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Despesa atualizada com sucesso.' : 'Despesa cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}