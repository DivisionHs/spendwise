import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import BotaoTema from './BotaoTema.tsx'
import Icone, { type NomeIcone } from './Icone.tsx'

// Estrutura das páginas internas, adaptada a cada tamanho de tela:
//   computador: menu lateral que pode ser recolhido (só ícones; o nome aparece ao passar o mouse);
//               a escolha fica guardada no navegador. Em telas médias, começa recolhido.
//   celular:    barra no topo com o botão "hambúrguer", que abre o menu como uma gaveta lateral.
interface ItemMenu {
  para: string
  rotulo: string
  icone: NomeIcone
  fim?: boolean
  tambem?: string // outra rota que também deixa o item marcado (ex.: categorias, aberta por dentro de Investimentos)
}

interface SecaoMenu {
  titulo: string
  itens: ItemMenu[]
}

const SECOES_MENU: SecaoMenu[] = [
  {
    titulo: 'Principal',
    itens: [
      { para: '/', rotulo: 'Dashboard', icone: 'inicio', fim: true },
      { para: '/extrato', rotulo: 'Extrato', icone: 'extrato' },
      { para: '/analise', rotulo: 'Centro de Análise', icone: 'analise' },
      { para: '/orcamentos', rotulo: 'Orçamentos', icone: 'orcamentos' },
      { para: '/alertas', rotulo: 'Alertas e Insights', icone: 'alertas' },
      { para: '/relatorio', rotulo: 'Relatório mensal', icone: 'relatorio' },
    ],
  },
  {
    titulo: 'Cadastros',
    itens: [
      { para: '/receitas', rotulo: 'Receitas', icone: 'receitas' },
      { para: '/despesas', rotulo: 'Despesas', icone: 'despesas' },
      { para: '/dividas', rotulo: 'Dívidas', icone: 'dividas' },
      { para: '/metas', rotulo: 'Metas', icone: 'metas' },
      { para: '/contas', rotulo: 'Contas', icone: 'contas' },
      { para: '/investimentos', rotulo: 'Investimentos', icone: 'investimentos', tambem: '/categorias' },
      { para: '/usuarios', rotulo: 'Usuários', icone: 'usuarios' },
    ],
  },
]

const CHAVE_MENU = 'spendwise.menuRecolhido'

function menuComecaRecolhido() {
  const salvo = localStorage.getItem(CHAVE_MENU)
  // Sem escolha guardada: recolhido em telas médias (tablet), aberto nas grandes
  return salvo === null ? window.innerWidth < 1100 : salvo === '1'
}

export default function Layout() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()
  const [recolhido, setRecolhido] = useState(menuComecaRecolhido)
  const [gavetaAberta, setGavetaAberta] = useState(false) // só vale no celular

  function alternarMenu() {
    setRecolhido((atual) => {
      localStorage.setItem(CHAVE_MENU, atual ? '0' : '1')
      return !atual
    })
  }

  // A gaveta do celular fecha ao navegar para outra página...
  useEffect(() => {
    setGavetaAberta(false)
  }, [local.pathname])

  // ...e com a tecla Esc
  useEffect(() => {
    if (!gavetaAberta) return undefined
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setGavetaAberta(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [gavetaAberta])

  function aoSair() {
    sair()
    navegar('/login')
  }

  // Quem nao e MASTER nao tem lista de usuarios: o mesmo item abre o proprio perfil (Meu perfil)
  const secoes = SECOES_MENU.map((secao) => ({
    ...secao,
    itens: secao.itens.map((item) =>
      item.para === '/usuarios' && usuario?.papel !== 'MASTER' ? { ...item, rotulo: 'Meu perfil' } : item,
    ),
  }))

  const classesMenu = ['menu', recolhido ? 'recolhido' : '', gavetaAberta ? 'aberto' : ''].join(' ').trim()

  return (
    <div className="layout">
      {/* Barra do topo: aparece só no celular */}
      <header className="barra-mobile">
        <button
          type="button"
          className="barra-mobile-botao"
          onClick={() => setGavetaAberta(true)}
          aria-label="Abrir o menu"
          aria-expanded={gavetaAberta}
        >
          <Icone nome="menu" />
        </button>
        <div className="menu-marca">
          Spend<span className="marca-verde">Wise</span>
        </div>
      </header>

      {gavetaAberta && <div className="menu-fundo" onClick={() => setGavetaAberta(false)} aria-hidden="true" />}

      <aside className={classesMenu}>
        <div className="menu-topo">
          <div className="menu-marca" aria-label="SpendWise">
            S<span className="marca-extra">pend</span>
            <span className="marca-verde">
              W<span className="marca-extra">ise</span>
            </span>
          </div>
          <button
            type="button"
            className="menu-alternar"
            onClick={alternarMenu}
            aria-expanded={!recolhido}
            aria-label={recolhido ? 'Expandir o menu' : 'Recolher o menu'}
            data-rotulo={recolhido ? 'Expandir menu' : undefined}
          >
            <Icone nome="recolher" tamanho={18} />
          </button>
          <button type="button" className="menu-fechar" onClick={() => setGavetaAberta(false)} aria-label="Fechar o menu">
            <Icone nome="fechar" tamanho={18} />
          </button>
        </div>

        <nav className="menu-itens">
          {secoes.map((secao) => (
            <div className="menu-secao" key={secao.titulo}>
              <span className="menu-secao-titulo menu-texto">{secao.titulo}</span>
              {secao.itens.map((item) => (
                <NavLink
                  key={item.para}
                  to={item.para}
                  end={item.fim}
                  aria-label={item.rotulo}
                  data-rotulo={item.rotulo}
                  className={({ isActive }) =>
                    isActive || (item.tambem && local.pathname.startsWith(item.tambem)) ? 'menu-link ativo' : 'menu-link'
                  }
                >
                  <Icone nome={item.icone} />
                  <span className="menu-texto">{item.rotulo}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="menu-usuario">
          <Link to="/usuarios" className="menu-usuario-dados" aria-label="Abrir meu perfil" title="Meu perfil">
            <span className="menu-avatar" data-rotulo={usuario?.nome}>
              {usuario?.nome?.trim().charAt(0).toUpperCase()}
            </span>
            <div className="menu-texto">
              <div className="menu-usuario-nome">
                {usuario?.nome}
                {usuario?.papel === 'MASTER' && <span className="etiqueta-master">Master</span>}
              </div>
              <div className="menu-usuario-email">{usuario?.email}</div>
            </div>
          </Link>
          <div className="menu-acoes">
            <BotaoTema />
            <button
            type="button"
            className="botao botao-contorno botao-bloco menu-sair"
            onClick={aoSair}
            aria-label="Sair"
            data-rotulo="Sair"
          >
            <Icone nome="sair" tamanho={18} />
            <span className="menu-texto">Sair</span>
          </button>
          </div>
        </div>
      </aside>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
