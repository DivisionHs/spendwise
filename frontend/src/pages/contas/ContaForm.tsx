import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type CampoFormulario, type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { contasApi } from '../../services/api.ts'
import { moeda } from '../../services/formatar.ts'

const TIPOS = [
  { valor: 'CORRENTE', rotulo: 'Conta corrente' },
  { valor: 'POUPANCA', rotulo: 'Poupança' },
]

// Inserção (POST) e atualização (PUT) de conta bancária, numa janela sobre a lista.
export default function ContaForm() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(contasApi.buscar, id)
  const titulo = id ? 'Editar conta' : 'Nova conta'

  const campos: CampoFormulario[] = [
    { nome: 'banco', rotulo: 'Banco', obrigatorio: true, maximo: 100 },
    { nome: 'agencia', rotulo: 'Agência', obrigatorio: true, maximo: 10 },
    { nome: 'numeroConta', rotulo: 'Número da conta', obrigatorio: true, maximo: 20, dica: 'Com dígito verificador. Ex.: 98765-4' },
    { nome: 'tipo', rotulo: 'Tipo da conta', tipo: 'select', obrigatorio: true, opcoes: TIPOS },
    {
      nome: 'saldo',
      rotulo: 'Saldo atual (R$)',
      tipo: 'number',
      passo: '0.01',
      minimo: id ? undefined : '0',
      obrigatorio: true,
      formatar: moeda,
      dica: id ? 'Receitas e despesas já ajustam este saldo sozinhas.' : 'Saldo inicial da conta.',
    },
  ]

  async function salvar(valores: ValoresFormulario) {
    const corpo = {
      usuario: { idUsuario: usuario.idUsuario },
      banco: valores.banco,
      agencia: valores.agencia,
      numeroConta: valores.numeroConta,
      tipo: valores.tipo,
      saldo: Number(valores.saldo),
    }
    if (id) {
      await contasApi.atualizar(id, corpo)
    } else {
      await contasApi.criar(corpo)
    }
    await recarregar()
    navegar('/contas')
  }

  if (carregando || erro) {
    return (
      <JanelaFormulario titulo={titulo} rotaVoltar="/contas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  const iniciais = registro
    ? { banco: registro.banco, agencia: registro.agencia, numeroConta: registro.numeroConta, tipo: registro.tipo, saldo: registro.saldo }
    : { banco: '', agencia: '', numeroConta: '', tipo: 'CORRENTE', saldo: '' }

  return (
    <JanelaFormulario titulo={titulo} rotaVoltar="/contas">
      <FormularioCrud
        key={id ?? 'novo'}
        campos={campos}
        valoresIniciais={iniciais}
        aoSalvar={salvar}
        rotaVoltar="/contas"
        textoBotao={id ? 'Salvar alterações' : 'Cadastrar conta'}
        confirmacao={{
          titulo: id ? 'Salvar as alterações da conta?' : 'Cadastrar esta conta?',
          mensagem: 'Confira os dados antes de gravar.',
          textoConfirmar: id ? 'Sim, salvar' : 'Sim, cadastrar',
        }}
        mensagemSucesso={id ? 'Conta atualizada com sucesso.' : 'Conta cadastrada com sucesso.'}
      />
    </JanelaFormulario>
  )
}