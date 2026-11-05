import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { categoriasApi, investimentosApi } from '../../services/api.ts'
import { dataBr, hojeIso, moeda, risco } from '../../services/formatar.ts'

// Inserção (POST) e atualização (PUT) de investimento, numa janela sobre a lista.
// A categoria vem de um select alimentado por GET /api/categorias-investimento.
// Antes de gravar abre um pop-up de confirmação; depois mostra um aviso de sucesso.
export default function InvestimentoForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(investimentosApi.buscar, id)
  const categorias = useLista(() => categoriasApi.listar(), [])
  const titulo = id ? 'Editar investimento' : 'Novo investimento'

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      categoria: { idCatInvest: Number(valores.idCatInvest) },
      valorInvestido: Number(valores.valorInvestido),
      data: valores.data,
    }
    if (id) {
      await investimentosApi.atualizar(id, corpo)
    } else {
      await investimentosApi.criar(corpo)
    }
    await recarregar()
    navegar('/investimentos')
  }

  if (carregando || categorias.carregando || erro || categorias.erro) {
    const problema = erro || categorias.erro
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/investimentos">
        {problema ? <Alerta tipo="erro">{problema}</Alerta> : <p className="estado">Carregando...</p>}
      </JanelaFormulario>
    )
  }

  const campos: CampoFormulario[] = [
    {
      nome: 'idCatInvest',
      rotulo: 'Categoria',
      tipo: 'select',
      obrigatorio: true,
      opcoes: categorias.itens.map((c) => ({ valor: String(c.idCatInvest), rotulo: `${c.nome} (risco ${risco(c.risco)})` })),
      dica: categorias.itens.length === 0 ? 'Cadastre uma categoria antes de investir.' : undefined,
    },
    {
      nome: 'valorInvestido',
      rotulo: 'Valor investido (R$)',
      tipo: 'number',
      passo: '0.01',
      minimo: '0.01',
      obrigatorio: true,
      formatar: moeda,
    },
    { nome: 'data', rotulo: 'Data', tipo: 'date', obrigatorio: true, formatar: dataBr, dica: 'Não pode ser uma data futura.' },
  ]

  const iniciais = registro
    ? {
        idCatInvest: String(registro.categoria.idCatInvest),
        valorInvestido: registro.valorInvestido,
        data: registro.data,
      }
    : { idCatInvest: '', valorInvestido: '', data: hojeIso() }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/investimentos">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={campos}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/investimentos"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar investimento'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações do investimento?' : 'Cadastrar este investimento?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Investimento atualizado com sucesso.' : 'Investimento cadastrado com sucesso.'}
      />
    </JanelaFormulario>
  )
}
