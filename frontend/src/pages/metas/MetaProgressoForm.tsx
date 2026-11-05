import type { ContextoLista } from '../../tipos.ts'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import FormularioCrud, { type ValoresFormulario } from '../../components/FormularioCrud.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useDialogos } from '../../context/DialogosContext.tsx'
import { useRegistro } from '../../hooks/useRegistro.ts'
import { metasApi } from '../../services/api.ts'
import { moeda } from '../../services/formatar.ts'

// Registro de progresso de uma meta (POST /api/metas/{id}/progressos).
export default function MetaProgressoForm() {
  const { id } = useParams()
  const { recarregar } = useOutletContext<ContextoLista>()
  const { notificar } = useDialogos()
  const navegar = useNavigate()
  const { registro, carregando, erro } = useRegistro(metasApi.buscar, id)

  async function salvar(valores: ValoresFormulario) {
    const atualizada = await metasApi.registrarProgresso(String(id), Number(valores.valor))
    await recarregar()
    navegar('/metas')
    if (atualizada.atingida) notificar('sucesso', `Meta "${atualizada.descricao}" atingida!`)
  }

  if (carregando || erro || !registro) {
    return (
      <JanelaFormulario titulo="Registrar progresso" rotaVoltar="/metas">
        {carregando ? <p className="estado">Carregando...</p> : <Alerta tipo="erro">{erro}</Alerta>}
      </JanelaFormulario>
    )
  }

  return (
    <JanelaFormulario titulo="Registrar progresso" rotaVoltar="/metas">
      <p className="estado">
        {registro.descricao}: {moeda(registro.valorAcumulado)} de {moeda(registro.valorAlvo)} ({registro.percentual}%).
      </p>
      <FormularioCrud
        campos={[{ nome: 'valor', rotulo: 'Valor guardado agora (R$)', tipo: 'number', passo: '0.01', minimo: '0.01', obrigatorio: true, formatar: moeda }]}
        valoresIniciais={{ valor: '' }}
        aoSalvar={salvar}
        rotaVoltar="/metas"
        textoBotao="Registrar progresso"
        confirmacao={{ titulo: 'Registrar este progresso?', mensagem: 'O valor será somado ao que você já juntou.', textoConfirmar: 'Sim, registrar' }}
        mensagemSucesso="Progresso registrado."
      />
    </JanelaFormulario>
  )
}