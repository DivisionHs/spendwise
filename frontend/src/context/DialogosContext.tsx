import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// Pop-ups do sistema, disponíveis em qualquer página:
//   confirmar({ titulo, mensagem, detalhes, textoConfirmar, perigo })  -> Promise<boolean>
//       abre uma janela de confirmação e espera o clique do usuário
//   notificar('sucesso' | 'aviso' | 'erro', 'texto')
//       mostra um aviso no canto da tela que some sozinho
export type TipoAviso = 'sucesso' | 'aviso' | 'erro'

export interface OpcoesConfirmacao {
  titulo: string
  mensagem?: string
  detalhes?: { rotulo: string; valor: string }[]
  textoConfirmar?: string
  perigo?: boolean
}

interface Aviso {
  id: number
  tipo: TipoAviso
  texto: string
}

interface PedidoConfirmacao {
  opcoes: OpcoesConfirmacao
  resolver: (resposta: boolean) => void
}

interface ContextoDialogos {
  confirmar: (opcoes: OpcoesConfirmacao) => Promise<boolean>
  notificar: (tipo: TipoAviso, texto: string) => void
}

const DialogosContext = createContext<ContextoDialogos | null>(null)
let proximoId = 1

export function DialogosProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null)

  const fecharAviso = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((a) => a.id !== id))
  }, [])

  const notificar = useCallback(
    (tipo: TipoAviso, texto: string) => {
      const id = proximoId++
      setAvisos((atuais) => [...atuais, { id, tipo, texto }])
      setTimeout(() => fecharAviso(id), tipo === 'erro' ? 6500 : 4200)
    },
    [fecharAviso],
  )

  const confirmar = useCallback(
    (opcoes: OpcoesConfirmacao) => new Promise<boolean>((resolver) => setPedido({ opcoes, resolver })),
    [],
  )

  const responder = useCallback((resposta: boolean) => {
    setPedido((atual) => {
      atual?.resolver(resposta)
      return null
    })
  }, [])

  const valor = useMemo(() => ({ confirmar, notificar }), [confirmar, notificar])

  return (
    <DialogosContext.Provider value={valor}>
      {children}
      {pedido && <CaixaConfirmacao opcoes={pedido.opcoes} aoResponder={responder} />}
      <div className="avisos" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
            <span className="aviso-icone" aria-hidden="true">
              {aviso.tipo === 'sucesso' ? '✓' : '!'}
            </span>
            <span className="aviso-texto">{aviso.texto}</span>
            <button type="button" className="aviso-fechar" aria-label="Fechar aviso" onClick={() => fecharAviso(aviso.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </DialogosContext.Provider>
  )
}

interface PropsCaixa {
  opcoes: OpcoesConfirmacao
  aoResponder: (resposta: boolean) => void
}

// Janela modal de confirmação. Esc ou clique fora cancelam.
function CaixaConfirmacao({ opcoes, aoResponder }: PropsCaixa) {
  const { titulo, mensagem, detalhes, textoConfirmar = 'Confirmar', perigo = false } = opcoes
  const botaoCancelar = useRef<HTMLButtonElement>(null)
  const botaoConfirmar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Em exclusões o foco começa no "Cancelar", para não apagar por acidente com Enter
    ;(perigo ? botaoCancelar : botaoConfirmar).current?.focus()
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') aoResponder(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [perigo, aoResponder])

  return (
    <div className="modal-fundo confirmacao" onMouseDown={(e) => e.target === e.currentTarget && aoResponder(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div className={perigo ? 'modal-icone modal-icone-perigo' : 'modal-icone'} aria-hidden="true">
          {perigo ? '!' : '?'}
        </div>
        <h2 id="modal-titulo">{titulo}</h2>
        {mensagem && <p className="modal-mensagem">{mensagem}</p>}

        {detalhes && detalhes.length > 0 && (
          <dl className="modal-detalhes">
            {detalhes.map((d) => (
              <div key={d.rotulo}>
                <dt>{d.rotulo}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="modal-botoes">
          <button ref={botaoCancelar} type="button" className="botao botao-contorno" onClick={() => aoResponder(false)}>
            Cancelar
          </button>
          <button
            ref={botaoConfirmar}
            type="button"
            className={perigo ? 'botao botao-perigo-cheio' : 'botao botao-primario'}
            onClick={() => aoResponder(true)}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useDialogos(): ContextoDialogos {
  const contexto = useContext(DialogosContext)
  if (!contexto) throw new Error('useDialogos deve ser usado dentro de <DialogosProvider>.')
  return contexto
}
