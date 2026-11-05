import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import Icone from '../../components/Icone.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useFinancas } from '../../hooks/useFinancas.ts'
import { CATEGORIAS_DESPESA, corCategoria } from '../../services/categorias.ts'
import { baixarArquivo, montarLancamentos, paraCsv } from '../../services/extrato.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

const POR_PAGINA = 10

const GUIA = [
  'O extrato junta todas as suas receitas e despesas numa lista só, da mais recente para a mais antiga. Valores em verde entraram e valores em rosa saíram.',
  '"Pendente" é um lançamento com data no futuro (agendado); "Concluído" já aconteceu.',
  'Use os filtros de período, categoria, tipo e status, e a busca. Os totais acima mudam junto com os filtros.',
  '"Exportar" baixa o que está na tela em CSV. "Importar extrato" lê um CSV do seu banco (data;descricao;valor;categoria) e cadastra tudo de uma vez: valor positivo vira receita e negativo vira despesa.',
]

function inicioDoPeriodo(periodo: string) {
  const hoje = new Date()
  if (periodo === 'tudo') return ''
  if (periodo === 'ano') return `${hoje.getFullYear()}-01-01`
  const d = new Date(hoje)
  d.setDate(d.getDate() - Number(periodo))
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Extrato (tela da Fase 2): receitas e despesas juntas, com filtros, paginação, exportação e importação.
export default function Extrato() {
  const { usuario } = useAuth()
  const { receitas, despesas, carregando, erro, recarregar } = useFinancas(usuario.idUsuario)
  const [periodo, setPeriodo] = useState('90')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const todos = useMemo(() => montarLancamentos(receitas, despesas), [receitas, despesas])

  const filtrados = useMemo(() => {
    const inicio = inicioDoPeriodo(periodo)
    const termo = busca.trim().toLowerCase()
    return todos.filter(
      (l) =>
        (!inicio || l.data >= inicio) &&
        (!categoria || l.categoria === categoria) &&
        (!tipo || l.tipo === tipo) &&
        (!status || l.status === status) &&
        (!termo || l.descricao.toLowerCase().includes(termo)),
    )
  }, [todos, periodo, categoria, tipo, status, busca])

  const totais = useMemo(() => {
    const entradas = filtrados.filter((l) => l.valorAssinado > 0).reduce((s, l) => s + l.valorAssinado, 0)
    const saidas = filtrados.filter((l) => l.valorAssinado < 0).reduce((s, l) => s - l.valorAssinado, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [filtrados])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA)

  // Qualquer filtro novo volta para a primeira página
  function mudar<T>(setter: (valor: T) => void) {
    return (valor: T) => {
      setter(valor)
      setPagina(1)
    }
  }

  return (
    <>
      <CabecalhoPagina titulo="Extrato" subtitulo="Todas as suas transações, com filtros.">
        <Link to="/extrato/importar" className="botao botao-contorno">
          <Icone nome="importar" tamanho={18} />
          Importar extrato
        </Link>
        <button
          type="button"
          className="botao botao-contorno"
          disabled={filtrados.length === 0}
          onClick={() => baixarArquivo('extrato-spendwise.csv', paraCsv(filtrados))}
        >
          <Icone nome="exportar" tamanho={18} />
          Exportar
        </button>
        <span className="cabecalho-separador" aria-hidden="true" />
        <Link to="/receitas/novo" className="botao botao-primario">
          <Icone nome="mais" tamanho={18} />
          Nova receita
        </Link>
        <Link to="/despesas/novo" className="botao botao-rosa">
          <Icone nome="mais" tamanho={18} />
          Nova despesa
        </Link>
      </CabecalhoPagina>

      {carregando && <p className="estado">Carregando...</p>}
      <Alerta tipo="erro">{erro}</Alerta>

      {!carregando && !erro && (
        <>
          <Analise guia={GUIA}>
            {filtrados.length === 0 ? (
              <>Nenhuma transação encontrada com esses filtros.</>
            ) : (
              <>
                Foram encontradas <strong>{filtrados.length}</strong> {filtrados.length === 1 ? 'transação' : 'transações'}: entraram{' '}
                <strong>{moeda(totais.entradas)}</strong> e saíram <strong>{moeda(totais.saidas)}</strong>, um saldo de{' '}
                <strong>{moeda(totais.saldo)}</strong> no período.
              </>
            )}
          </Analise>

          <section className="faixa-metricas">
            <div className="metrica metrica-verde">
              <span>Entradas</span>
              <strong>{moeda(totais.entradas)}</strong>
            </div>
            <div className="metrica metrica-rosa">
              <span>Saídas</span>
              <strong>{moeda(totais.saidas)}</strong>
            </div>
            <div className="metrica">
              <span>Saldo do período</span>
              <strong>{moeda(totais.saldo)}</strong>
            </div>
            <div className="metrica">
              <span>Transações</span>
              <strong>{filtrados.length}</strong>
            </div>
          </section>

          <div className="barra-filtros">
            <select value={periodo} onChange={(e) => mudar(setPeriodo)(e.target.value)} aria-label="Período" className="filtro-select">
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="ano">Este ano</option>
              <option value="tudo">Todo o período</option>
            </select>
            <select value={categoria} onChange={(e) => mudar(setCategoria)(e.target.value)} aria-label="Categoria" className="filtro-select">
              <option value="">Todas as categorias</option>
              <option value="RECEITA">Receitas</option>
              {CATEGORIAS_DESPESA.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
            <select value={tipo} onChange={(e) => mudar(setTipo)(e.target.value)} aria-label="Tipo" className="filtro-select">
              <option value="">Todos os tipos</option>
              <option value="RECEITA">Receitas</option>
              <option value="DESPESA">Despesas</option>
            </select>
            <select value={status} onChange={(e) => mudar(setStatus)(e.target.value)} aria-label="Status" className="filtro-select">
              <option value="">Todos os status</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="PENDENTE">Pendente</option>
            </select>
            <input
              type="search"
              value={busca}
              onChange={(e) => mudar(setBusca)(e.target.value)}
              placeholder="Buscar por descrição"
              aria-label="Buscar por descrição"
              className="filtro-busca"
            />
          </div>

          {filtrados.length === 0 ? (
            <p className="estado">Nenhuma transação para esses filtros.</p>
          ) : (
            <div className="tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th className="coluna-acoes">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((l) => (
                    <tr key={l.chave}>
                      <td>{l.descricao}</td>
                      <td>{dataBr(l.data)}</td>
                      <td>
                        <span className="cartao-categoria">
                          <span className="ponto" style={{ background: l.tipo === 'RECEITA' ? '#10b981' : corCategoria(l.categoria) }} />
                          {l.rotuloCategoria}
                        </span>
                      </td>
                      <td>
                        <span className={l.valorAssinado > 0 ? 'celula-valor-verde' : 'celula-valor-rosa'}>
                          {l.valorAssinado > 0 ? '+' : '-'} {moeda(Math.abs(l.valorAssinado))}
                        </span>
                      </td>
                      <td>
                        <span className={`etiqueta ${l.status === 'CONCLUIDO' ? 'etiqueta-ok' : 'etiqueta-atencao'}`}>
                          {l.status === 'CONCLUIDO' ? 'Concluído' : 'Pendente'}
                        </span>
                      </td>
                      <td className="coluna-acoes">
                        <Link
                          className="botao botao-pequeno botao-contorno"
                          to={l.tipo === 'RECEITA' ? `/receitas/${l.id}/editar` : `/despesas/${l.id}/editar`}
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtrados.length > POR_PAGINA && (
            <nav className="paginacao" aria-label="Paginação">
              <span>
                Mostrando {(paginaAtual - 1) * POR_PAGINA + 1} a {Math.min(paginaAtual * POR_PAGINA, filtrados.length)} de {filtrados.length}
              </span>
              <button type="button" className="botao botao-pequeno botao-contorno" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}>
                Anterior
              </button>
              <span className="paginacao-atual">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                type="button"
                className="botao botao-pequeno botao-contorno"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPagina(paginaAtual + 1)}
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}

      <Outlet context={{ recarregar }} />
    </>
  )
}
