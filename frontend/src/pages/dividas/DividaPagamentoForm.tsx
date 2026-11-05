import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useDialogos } from '../../context/DialogosContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { dividasApi } from '../../services/api.ts'
import { moeda } from '../../services/formatar.ts'

// Pagamento parcial ou total de uma dívida (POST /api/dividas/{id}/pagamentos).
export default function DividaPagamentoForm() {
  const { id } = useParams()
  const { recarregar } = useOutletContext<ContextoLista>()
  const { notificar } = useDialogos()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(dividasApi.buscar, id)

  async function salvar(valores: ValoresFormulario) {
    const atualizada = await dividasApi.pagar(String(id), Number(valores.valor))
    await recarregar()
    navegar('/dividas')
    if (atualizada.quitada) notificar('sucesso', 'Dívida quitada. Parabéns!')
  }

  if (carregando || erro || !registro) {
    return (
      <JanelaFormulario titulo="Pagar dívida" rotaVoltar="/dividas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  return (
    <JanelaFormulario titulo="Pagar dívida" rotaVoltar="/dividas">
      <p className="estado">
        {registro.descricao}: faltam <strong>{moeda(registro.valor)}</strong>. Pagando esse valor ou mais, a dívida fica quitada.
      </p>
      <FormularioCrud
        campos={[{ nome: 'valor', rotulo: 'Valor do pagamento (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda }]}
        valoresIniciais={{ valor: '' }}
        aoSalvar={salvar}
        rotaVoltar="/dividas"
        textoBotao="Registrar pagamento"
        confirmacao={{ titulo: 'Registrar este pagamento?', mensagem: 'Confira o valor antes de gravar.', textoConfirmar: 'Sim, registrar' }}
        mensagemSucesso="Pagamento registrado."
      />
    </JanelaFormulario>
  )
}