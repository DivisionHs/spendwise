// Barra de progresso. situacao: 'ok' | 'atencao' | 'critico' | 'excedido' (muda a cor).
interface Props {
  percentual: number
  situacao?: 'ok' | 'atencao' | 'critico' | 'excedido'
  rotulo: string
}

export default function Progresso({ percentual, situacao = 'ok', rotulo }: Props) {
  const largura = Math.max(0, Math.min(100, Number(percentual) || 0))
  return (
    <div className="progresso" role="progressbar" aria-valuenow={Math.round(largura)} aria-valuemin={0} aria-valuemax={100} aria-label={rotulo}>
      <span className={`progresso-barra situacao-${situacao}`} style={{ width: `${largura}%` }} />
    </div>
  )
}