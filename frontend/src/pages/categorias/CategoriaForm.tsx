import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { categoriasApi } from '../../services/api.ts'

const CAMPOS: CampoFormulario[] = [
  { nome: 'nome', rotulo: 'Nome da categoria', obrigatorio: true, maximo: 50 },
  {
    nome: 'risco',
    rotulo: 'Risco',
    tipo: 'select',
    obrigatorio: true,
    opcoes: [
      { valor: 'BAIXO', rotulo: 'Baixo' },
      { valor: 'MODERADO', rotulo: 'Moderado' },
      { valor: 'ALTO', rotulo: 'Alto' },
    ],
  },
]

// Inserção (POST) e atualização (PUT) de categoria de investimento, numa janela sobre a lista.
// Antes de gravar abre um pop-up de confirmação; depois mostra um aviso de sucesso.
export default function CategoriaForm() {
  const { id } = useParams()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(categoriasApi.buscar, id)
  const titulo = id ? 'Editar categoria' : 'Nova categoria'

  async function salvar(valores: ValoresFormulario) {
    const corpo = { nome: valores.nome, risco: valores.risco }
    if (id) {
      await categoriasApi.atualizar(id, corpo)
    } else {
      await categoriasApi.criar(corpo)
    }
    await recarregar()
    navegar('/categorias')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/categorias">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { nome: registro.nome, risco: String(registro.risco ?? '').toUpperCase() }
    : { nome: '', risco: '' }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/categorias">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={CAMPOS}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/categorias"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar categoria'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da categoria?' : 'Cadastrar esta categoria?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Categoria atualizada com sucesso.' : 'Categoria cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}
