import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { receitasApi } from '../../services/api.ts'
import { dataBr, hojeIso, moeda } from '../../services/formatar.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'descricao', rotulo: 'Descrição', obrigatorio: true, maximo: 255 },
  { nome: 'valor', rotulo: 'Valor (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda },
  { nome: 'data', rotulo: 'Data', tipo: 'date', obrigatorio: true, formatar: dataBr },
]

// Inserção (POST) e atualização (PUT) de receita, numa janela sobre a lista. Com :id na rota é edição.
// Antes de gravar abre um pop-up de confirmação; depois mostra um aviso de sucesso.
export default function ReceitaForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(receitasApi.buscar, id)
  const titulo = id ? 'Editar receita' : 'Nova receita'

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      descricao: valores.descricao,
      valor: Number(valores.valor),
      data: valores.data,
    }
    if (id) {
      await receitasApi.atualizar(id, corpo)
    } else {
      await receitasApi.criar(corpo)
    }
    await recarregar()
    navegar('/receitas')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/receitas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { descricao: registro.descricao, valor: registro.valor, data: registro.data }
    : { descricao: '', valor: '', data: hojeIso() }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/receitas">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={CAMPOS}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/receitas"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar receita'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da receita?' : 'Cadastrar esta receita?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Receita atualizada com sucesso.' : 'Receita cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}
