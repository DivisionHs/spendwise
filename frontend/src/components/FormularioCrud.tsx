import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useDialogos } from '../context/DialogosContext.tsx'
import Alerta from './Alerta.tsx'

// Formulário genérico de inserção/edição, montado a partir de uma lista de campos.
// Ao enviar, pode abrir um pop-up de confirmação com um resumo dos dados e, depois de gravar,
// mostra um aviso de sucesso.
// Props:
//   campos            [{ nome, rotulo, tipo?('text'|'number'|'date'|'email'|'password'|'select'),
//                        opcoes?[{valor, rotulo}], obrigatorio?, dica?, passo?, maximo?, formatar?(valor) }]
//   valoresIniciais   objeto { [nome]: valor } para preencher (edição) ou padrão (novo)
//   aoSalvar          async (valores) => grava no backend (lança erro se falhar)
//   rotaVoltar        para onde o botão Cancelar leva
//   textoBotao        rótulo do botão de salvar
//   confirmacao       { titulo, mensagem?, textoConfirmar? }  (opcional) pede confirmação antes de gravar
//   mensagemSucesso   texto do aviso depois de gravar (opcional)
export type ValoresFormulario = Record<string, string | number>

export interface CampoFormulario {
  nome: string
  rotulo: string
  tipo?: 'text' | 'number' | 'date' | 'email' | 'password' | 'select'
  opcoes?: { valor: string; rotulo: string }[]
  obrigatorio?: boolean
  dica?: string
  passo?: string
  minimo?: string
  maximo?: number
  formatar?: (valor: string) => string
}

interface Props {
  campos: CampoFormulario[]
  valoresIniciais: ValoresFormulario
  aoSalvar: (valores: ValoresFormulario) => Promise<unknown>
  rotaVoltar: string
  textoBotao?: string
  confirmacao?: { titulo: string; mensagem?: string; textoConfirmar?: string }
  mensagemSucesso?: string
}

export default function FormularioCrud({
  campos,
  valoresIniciais,
  aoSalvar,
  rotaVoltar,
  textoBotao = 'Salvar',
  confirmacao,
  mensagemSucesso,
}: Props) {
  const { confirmar, notificar } = useDialogos()
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciais)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function alterar(nome: string, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [nome]: valor }))
  }

  // Resumo mostrado no pop-up de confirmação (senhas aparecem mascaradas)
  function montarDetalhes() {
    return campos
      .filter((campo) => valores[campo.nome] !== '' && valores[campo.nome] != null)
      .map((campo) => {
        const bruto = valores[campo.nome]
        let texto = bruto
        if (campo.tipo === 'password') texto = '••••••'
        else if (campo.tipo === 'select') texto = (campo.opcoes ?? []).find((o) => o.valor === bruto)?.rotulo ?? bruto
        else if (campo.formatar) texto = campo.formatar(String(bruto))
        return { rotulo: campo.rotulo.replace(/\s*\(.*\)$/, ''), valor: String(texto) }
      })
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro('')

    if (confirmacao) {
      const confirmado = await confirmar({
        titulo: confirmacao.titulo,
        mensagem: confirmacao.mensagem,
        textoConfirmar: confirmacao.textoConfirmar ?? 'Confirmar',
        detalhes: montarDetalhes(),
      })
      if (!confirmado) return
    }

    setSalvando(true)
    try {
      await aoSalvar(valores)
      if (mensagemSucesso) notificar('sucesso', mensagemSucesso)
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : 'Erro inesperado.'
      setErro(mensagem)
      notificar('erro', mensagem)
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <Alerta tipo="erro">{erro}</Alerta>

      {campos.map((campo, indice) => (
        <div className="campo" key={campo.nome}>
          <label htmlFor={campo.nome}>
            {campo.rotulo}
            {campo.obrigatorio && <span className="obrigatorio"> *</span>}
          </label>

          {campo.tipo === 'select' ? (
            <select
              id={campo.nome}
              value={valores[campo.nome] ?? ''}
              required={campo.obrigatorio}
              autoFocus={indice === 0}
              onChange={(e) => alterar(campo.nome, e.target.value)}
            >
              <option value="">Selecione...</option>
              {(campo.opcoes ?? []).map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={campo.nome}
              type={campo.tipo ?? 'text'}
              value={valores[campo.nome] ?? ''}
              required={campo.obrigatorio}
              step={campo.passo}
              min={campo.minimo}
              maxLength={campo.maximo}
              autoFocus={indice === 0}
              autoComplete={campo.tipo === 'password' ? 'new-password' : 'off'}
              onChange={(e) => alterar(campo.nome, e.target.value)}
            />
          )}

          {campo.dica && <small>{campo.dica}</small>}
        </div>
      ))}

      <div className="formulario-botoes">
        <button type="submit" className="botao botao-primario" disabled={salvando}>
          {salvando ? 'Salvando...' : textoBotao}
        </button>
        <Link to={rotaVoltar} className="botao botao-contorno">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
