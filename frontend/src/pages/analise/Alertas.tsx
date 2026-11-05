import Alerta from '../../components/Alerta.tsx'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import CartaoResumo from '../../components/CartaoResumo.tsx'
import Cartao from '../../components/graficos/Cartao.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { analiseApi } from '../../services/api.ts'

const ROTULO = { CRITICO: 'Crítico', ATENCAO: 'Atenção', INFORMATIVO: 'Informativo' }

const GUIA = [
  'Os alertas são gerados automaticamente a partir dos seus dados: orçamento de uma categoria perto do limite (80%) ou acima dele, categoria que cresceu mais de 12% em relação à média dos 3 meses anteriores, dívidas vencidas ou a vencer em 7 dias e metas com prazo nos próximos 30 dias.',
  'Os insights descrevem o seu mês anterior completo: a categoria que mais pesa, quanto da renda você guardou, uma ideia de economia em Lazer e o andamento das metas.',
  'É uma leitura dos seus números, não uma recomendação financeira.',
]

// Alertas e Insights (tela da Fase 2): alertas por regra e observações sobre os seus gastos.
export default function Alertas() {
  const { usuario } = useAuth()
  const { itens, carregando, erro } = useLista(async () => [await analiseApi.alertasEInsights(usuario.idUsuario)], [usuario.idUsuario])
  const dados = itens[0]
  const alertas = dados?.alertas ?? []
  const insights = dados?.insights ?? []
  const criticos = alertas.filter((a) => a.severidade === 'CRITICO').length
  const atencao = alertas.filter((a) => a.severidade === 'ATENCAO').length

  return (
    <>
      <CabecalhoPagina titulo="Alertas e Insights" subtitulo="O que merece a sua atenção agora." />

      {carregando && <p className="estado">Carregando...</p>}
      <Alerta tipo="erro">{erro}</Alerta>

      {dados && (
        <>
          <Analise guia={GUIA}>
            {alertas.length === 0 ? (
              <>Nenhum alerta no momento: seus orçamentos, dívidas e metas estão em ordem.</>
            ) : (
              <>
                Você tem <strong>{alertas.length}</strong> {alertas.length === 1 ? 'alerta' : 'alertas'}: <strong>{criticos}</strong>{' '}
                {criticos === 1 ? 'crítico' : 'críticos'}, <strong>{atencao}</strong> de atenção e{' '}
                <strong>{alertas.length - criticos - atencao}</strong> informativo(s).
              </>
            )}
          </Analise>

          <section className="grade-cartoes">
            <CartaoResumo titulo="Alertas ativos" valor={String(alertas.length)} cor="azul" />
            <CartaoResumo titulo="Críticos" valor={String(criticos)} cor="rosa" />
            <CartaoResumo titulo="Atenção" valor={String(atencao)} cor="ambar" />
            <CartaoResumo titulo="Insights" valor={String(insights.length)} cor="verde" />
          </section>

          <div className="grade-painel">
            <Cartao className="largo" titulo="Alertas recentes" subtitulo="Sinais identificados nos seus gastos, orçamentos, dívidas e metas">
              {alertas.length === 0 ? (
                <p className="estado">Tudo em ordem por aqui.</p>
              ) : (
                <ul className="lista-alertas">
                  {alertas.map((a) => (
                    <li key={`${a.titulo}-${a.categoria}`}>
                      <span className={`etiqueta etiqueta-${a.severidade.toLowerCase()}`}>{ROTULO[a.severidade]}</span>
                      <div>
                        <strong>{a.titulo}</strong>
                        <p>{a.descricao}</p>
                      </div>
                      {a.categoria && <small>{a.categoria}</small>}
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>

            <Cartao titulo="Insights personalizados" subtitulo="Observações sobre o seu padrão financeiro">
              {insights.length === 0 ? (
                <p className="estado">Cadastre mais lançamentos para ver insights.</p>
              ) : (
                <ul className="lista-insights">
                  {insights.map((i) => (
                    <li key={i.titulo}>
                      <strong>{i.titulo}</strong>
                      <p>{i.descricao}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          </div>
        </>
      )}
    </>
  )
}
