import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { orcamentosApi } from '../../services/api.ts'
import { OPCOES_CATEGORIA } from '../../services/categorias.ts'
import { moeda } from '../../services/formatar.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', obrigatorio: true, opcoes: OPCOES_CATEGORIA },
  { nome: 'limite', rotulo: 'Limite mensal (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda, dica: 'Quanto você quer gastar, no máximo, por mês nesta categoria.' },
]

// Inserção (POST) e atualização (PUT) de orçamento, numa janela sobre a página.
export default function OrcamentoForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(orcamentosApi.buscar, id)
  const titulo = id ? 'Editar orçamento' : 'Novo orçamento'

  async function salvar(valores: ValoresFormulario) {
    const corpo = { usuario: { idUsuario: usuario.idUsuario }, categoria: valores.categoria, limite: Number(valores.limite) }
    if (id) {
      await orcamentosApi.atualizar(id, corpo)
    } else {
      await orcamentosApi.criar(corpo)
    }
    await recarregar()
    navegar('/orcamentos')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/orcamentos">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro ? { categoria: registro.categoria, limite: registro.limite } : { categoria: '', limite: '' }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/orcamentos">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={CAMPOS}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/orcamentos"
        textoBotao={id ? 'Salvar alterações' : 'Criar orçamento'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações do orçamento?' : 'Criar este orçamento?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, criar',
        }}
        mensagemSucesso={id ? 'Orçamento atualizado com sucesso.' : 'Orçamento criado com sucesso.'}
      />
    </JanelaFormulario>
  )
}