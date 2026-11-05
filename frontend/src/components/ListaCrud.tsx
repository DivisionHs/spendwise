import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDialogos } from '../context/DialogosContext.tsx'
import Alerta from './Alerta.tsx'

// Tabela genérica de consulta com botões de editar e excluir.
// A exclusão pede confirmação num pop-up e avisa o resultado.
// Props:
//   colunas        [{ chave, rotulo, formatar?(item) }]
//   itens          lista vinda da API
//   carregando     mostra "Carregando..."
//   erro           mensagem de erro ao carregar
//   rotaEditar     (item) => caminho da página de edição
//   aoExcluir      async (item) => exclui no backend (lança erro se falhar)
//   descricaoItem  (item) => texto usado no pop-up de exclusão
//   podeExcluir    (item) => false desabilita o botão (opcional)
//   acoesExtras    (item) => botões extras na linha (ex.: "Pagar") (opcional)
//   motivoBloqueio (item) => texto mostrado ao passar o mouse no botão desabilitado (opcional)
//   vazio          texto quando a lista está vazia (opcional)
export interface ColunaLista<T> {
  chave: string
  rotulo: string
  formatar?: (item: T) => ReactNode
}

interface Props<T> {
  colunas: ColunaLista<T>[]
  itens: T[]
  carregando: boolean
  erro: string
  rotaEditar: (item: T) => string
  aoExcluir: (item: T) => Promise<void>
  descricaoItem: (item: T) => string
  podeExcluir?: (item: T) => boolean
  motivoBloqueio?: (item: T) => string
  acoesExtras?: (item: T) => ReactNode
  vazio?: string
}

export default function ListaCrud<T>({
  colunas,
  itens,
  carregando,
  erro,
  rotaEditar,
  aoExcluir,
  descricaoItem,
  podeExcluir = () => true,
  motivoBloqueio,
  acoesExtras,
  vazio = 'Nenhum registro cadastrado ainda.',
}: Props<T>) {
  const { confirmar, notificar } = useDialogos()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  async function excluir(item: T, id: string) {
    const confirmado = await confirmar({
      titulo: 'Excluir registro?',
      mensagem: `Você vai excluir ${descricaoItem(item)}. Esta ação não pode ser desfeita.`,
      textoConfirmar: 'Sim, excluir',
      perigo: true,
    })
    if (!confirmado) return

    setExcluindoId(id)
    try {
      await aoExcluir(item)
      notificar('sucesso', 'Registro excluído com sucesso.')
    } catch (e) {
      notificar('erro', e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setExcluindoId(null)
    }
  }

  if (carregando) return <p className="estado">Carregando...</p>
  if (erro) return <Alerta tipo="erro">{erro}</Alerta>

  if (itens.length === 0) return <p className="estado">{vazio}</p>

  return (
    <div className="tabela-caixa">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave}>{coluna.rotulo}</th>
            ))}
            <th className="coluna-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const id = rotaEditar(item)
            return (
              <tr key={id}>
                {colunas.map((coluna) => (
                  <td key={coluna.chave}>{coluna.formatar ? coluna.formatar(item) : (item as Record<string, ReactNode>)[coluna.chave]}</td>
                ))}
                <td className="coluna-acoes">
                  {acoesExtras?.(item)}
                  <Link className="botao botao-pequeno botao-contorno" to={id}>
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="botao botao-pequeno botao-perigo"
                    disabled={excluindoId === id || !podeExcluir(item)}
                    title={!podeExcluir(item) ? motivoBloqueio?.(item) : undefined}
                    onClick={() => excluir(item, id)}
                  >
                    {excluindoId === id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
