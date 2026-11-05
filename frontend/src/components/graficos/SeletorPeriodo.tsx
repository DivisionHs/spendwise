// Botões para escolher quantos meses o painel mostra. opcoes: [3, 6, 12]
interface Props {
  valor: number
  opcoes: number[]
  aoMudar: (meses: number) => void
}

export default function SeletorPeriodo({ valor, opcoes, aoMudar }: Props) {
  return (
    <div className="seletor" role="group" aria-label="Período">
      {opcoes.map((meses) => (
        <button
          key={meses}
          type="button"
          className={valor === meses ? 'seletor-botao ativo' : 'seletor-botao'}
          aria-pressed={valor === meses}
          onClick={() => aoMudar(meses)}
        >
          {meses} meses
        </button>
      ))}
    </div>
  )
}
