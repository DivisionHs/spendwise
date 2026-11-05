import type { Meta } from '../../tipos.ts'
import { useMemo } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Analise from '../../components/Analise.tsx'
import CabecalhoPagina from '../../components/CabecalhoPagina.tsx'
import ListaCrud, { type ColunaLista } from '../../components/ListaCrud.tsx'
import Progresso from '../../components/Progresso.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useLista } from '../../hooks/useLista.ts'
import { metasApi } from '../../services/api.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

const COLUNAS: ColunaLista<Meta>[] = [
  { chave: 'descricao', rotulo: 'Meta' },
  { chave: 'dataLimite', rotulo: 'Prazo', formatar: (m) => dataBr(m.dataLimite) },
  {
    chave: 'progresso',
    rotulo: 'Progresso',
    formatar: (m) => (
      <div className="progresso-celula">
        <Progresso percentual={m.percentual} situacao={m.atingida ? 'ok' : 'atencao'} rotulo={`Progresso de ${m.descricao}`} />
        <small>
          {moeda(m.valorAcumulado)} de {moeda(m.valorAlvo)} ({m.percentual}%)
        </small>
      </div>
    ),
  },
  {
    chave: 'situacao',
    rotulo: 'Situação',
    formatar: (m) => (
      <span className={`etiqueta ${m.atingida ? 'etiqueta-ok' : 'etiqueta-neutra'}`}>{m.atingida ? 'Atingida' : 'Em andamento'}</span>
    ),
  },
]

const GUIA = [
  'Cada meta tem um valor alvo e um prazo. "Registrar progresso" soma o que você já juntou ao valor acumulado e a barra mostra quanto da meta foi atingido.',
  'Metas com prazo em até 30 dias que ainda não foram atingidas aparecem em "Alertas e Insights".',
]

// Consulta (GET) e exclusão (DELETE) das metas do usuário logado, com registro de progresso.
export default function MetasLista() {
  const { usuario } = useAuth()
  const { itens, carregando, erro, recarregar } = useLista(() => metasApi.listar(usuario.idUsuario), [usuario.idUsuario])

  const resumo = useMemo(() => {
    const atingidas = itens.filter((m) => m.atingida).length
    const emAndamento = itens.filter((m) => !m.atingida)
    return { atingidas, emAndamento, proxima: emAndamento[0] }
  }, [itens])

  async function excluir(meta: Meta) {
    await metasApi.excluir(meta.idMeta)
    await recarregar()
  }

  return (
    <>
      <CabecalhoPagina titulo="Metas" subtitulo="O que você quer conquistar e quanto já juntou.">
        <Link to="/metas/novo" className="botao botao-primario">
          Nova meta
        </Link>
      </CabecalhoPagina>

      {!carregando && !erro && itens.length > 0 && (
        <Analise guia={GUIA}>
          Você tem <strong>{itens.length}</strong> {itens.length === 1 ? 'meta' : 'metas'}: <strong>{resumo.atingidas}</strong>{' '}
          {resumo.atingidas === 1 ? 'atingida' : 'atingidas'} e <strong>{resumo.emAndamento.length}</strong> em andamento.
          {resumo.proxima && (
            <>
              {' '}A de prazo mais próximo é <strong>{resumo.proxima.descricao}</strong> ({dataBr(resumo.proxima.dataLimite)}), com{' '}
              {resumo.proxima.percentual}% atingido.
            </>
          )}
        </Analise>
      )}

      <ListaCrud
        colunas={COLUNAS}
        itens={itens}
        carregando={carregando}
        erro={erro}
        rotaEditar={(m) => `/metas/${m.idMeta}/editar`}
        aoExcluir={excluir}
        descricaoItem={(m) => `a meta "${m.descricao}"`}
        acoesExtras={(m) => (
          <Link className="botao botao-pequeno botao-primario" to={`/metas/${m.idMeta}/progresso`}>
            Registrar progresso
          </Link>
        )}
        vazio="Nenhuma meta cadastrada ainda."
      />

      <Outlet context={{ recarregar }} />
    </>
  )
}