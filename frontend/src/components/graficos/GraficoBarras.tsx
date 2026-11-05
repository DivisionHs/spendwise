import { useState } from 'react'
import { escalaEixo, moedaCurta, type Mes } from '../../services/agregar.ts'
import { moeda } from '../../services/formatar.ts'
import { useDica } from './useDica.tsx'

const L = 680
const A = 290
const MARGEM = { esq: 52, dir: 12, topo: 14, base: 34 }

// Barras agrupadas por mês, com várias séries.
// Interações: passar o mouse mostra os valores; clicar numa legenda liga/desliga a série;
// clicar num mês seleciona esse mês (aoSelecionar) e o resto da tela se ajusta.
// Props:
//   meses         [{ chave: '2026-11', rotulo: 'nov/26' }]
//   series        [{ chave, rotulo, cor }]
//   valores       { [chaveSerie]: { [chaveMes]: numero } }
//   selecionado   chave do mês selecionado (ou null)
//   aoSelecionar  (chaveMes | null) => void   (opcional)
export interface SerieBarra {
  chave: string
  rotulo: string
  cor: string
}

interface Props {
  meses: Mes[]
  series: SerieBarra[]
  valores: Record<string, Record<string, number>>
  selecionado?: string | null
  aoSelecionar?: (chave: string | null) => void
  titulo: string
}

export default function GraficoBarras({ meses, series, valores, selecionado = null, aoSelecionar, titulo }: Props) {
  const [ocultas, setOcultas] = useState<string[]>([])
  const dica = useDica()

  const visiveis = series.filter((s) => !ocultas.includes(s.chave))
  const maior = Math.max(0, ...visiveis.flatMap((s) => meses.map((m) => valores[s.chave]?.[m.chave] ?? 0)))
  const escala = escalaEixo(maior)

  const larguraUtil = L - MARGEM.esq - MARGEM.dir
  const alturaUtil = A - MARGEM.topo - MARGEM.base
  const larguraGrupo = larguraUtil / meses.length
  const larguraBarra = Math.min(30, (larguraGrupo * 0.72) / Math.max(1, visiveis.length))
  const yDe = (valor: number) => MARGEM.topo + alturaUtil - (valor / escala.max) * alturaUtil

  function alternar(chave: string) {
    setOcultas((atuais) => (atuais.includes(chave) ? atuais.filter((c) => c !== chave) : [...atuais, chave]))
  }

  function conteudoDica(mes: Mes) {
    return (
      <>
        <strong>{mes.rotulo}</strong>
        {visiveis.map((s) => (
          <div key={s.chave} className="dica-linha">
            <span className="ponto" style={{ background: s.cor }} />
            {s.rotulo}: <b>{moeda(valores[s.chave]?.[mes.chave] ?? 0)}</b>
          </div>
        ))}
        {aoSelecionar && <small>Clique para focar neste mês</small>}
      </>
    )
  }

  return (
    <div className="grafico">
      <div className="legenda">
        {series.map((s) => (
          <button
            key={s.chave}
            type="button"
            className={ocultas.includes(s.chave) ? 'legenda-item desligada' : 'legenda-item'}
            aria-pressed={!ocultas.includes(s.chave)}
            onClick={() => alternar(s.chave)}
            title="Clique para mostrar ou esconder"
          >
            <span className="ponto" style={{ background: s.cor }} />
            {s.rotulo}
          </button>
        ))}
      </div>

      <div className="grafico-caixa" ref={dica.ref}>
        <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={titulo} onMouseLeave={dica.esconder}>
          {escala.passos.map((passo) => (
            <g key={passo}>
              <line x1={MARGEM.esq} x2={L - MARGEM.dir} y1={yDe(passo)} y2={yDe(passo)} className="grade" />
              <text x={MARGEM.esq - 8} y={yDe(passo) + 4} className="eixo eixo-y">
                {moedaCurta(passo)}
              </text>
            </g>
          ))}

          {meses.map((mes, i) => {
            const x0 = MARGEM.esq + i * larguraGrupo
            const ativo = selecionado === mes.chave
            const apagado = selecionado && !ativo
            const inicioBarras = x0 + (larguraGrupo - larguraBarra * visiveis.length) / 2
            return (
              <g key={mes.chave} className={apagado ? 'grupo apagado' : 'grupo'}>
                {ativo && (
                  <rect x={x0 + 3} y={MARGEM.topo} width={larguraGrupo - 6} height={alturaUtil} className="grupo-destaque" />
                )}
                {visiveis.map((s, j) => {
                  const valor = valores[s.chave]?.[mes.chave] ?? 0
                  const y = yDe(valor)
                  return (
                    <rect
                      key={s.chave}
                      x={inicioBarras + j * larguraBarra + 1}
                      y={y}
                      width={Math.max(2, larguraBarra - 2)}
                      height={Math.max(0, MARGEM.topo + alturaUtil - y)}
                      rx="3"
                      fill={s.cor}
                      className="barra"
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  )
                })}
                <text x={x0 + larguraGrupo / 2} y={A - 12} className={ativo ? 'eixo eixo-x ativo' : 'eixo eixo-x'}>
                  {mes.rotulo}
                </text>
                <rect
                  x={x0}
                  y={MARGEM.topo}
                  width={larguraGrupo}
                  height={alturaUtil + MARGEM.base}
                  fill="transparent"
                  className={aoSelecionar ? 'area-clicavel' : undefined}
                  onMouseMove={(e) => dica.mostrar(e, conteudoDica(mes))}
                  onClick={() => aoSelecionar?.(ativo ? null : mes.chave)}
                />
              </g>
            )
          })}
        </svg>
        {dica.elemento}
      </div>
    </div>
  )
}
