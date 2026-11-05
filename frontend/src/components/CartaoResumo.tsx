// Cartão de total da página inicial. cor: 'verde' | 'rosa' | 'ambar' | 'azul'
interface Props {
  titulo: string
  valor: string
  cor?: 'verde' | 'rosa' | 'ambar' | 'azul'
  detalhe?: string
}

export default function CartaoResumo({ titulo, valor, cor = 'azul', detalhe }: Props) {
  return (
    <div className={`cartao-resumo cartao-${cor}`}>
      <span className="cartao-titulo">{titulo}</span>
      <strong className="cartao-valor">{valor}</strong>
      {detalhe && <span className="cartao-detalhe">{detalhe}</span>}
    </div>
  )
}
