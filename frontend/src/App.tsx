import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import RotaProtegida from './components/RotaProtegida.tsx'
import Cadastro from './pages/Cadastro.tsx'
import Alertas from './pages/analise/Alertas.tsx'
import CentroAnalise from './pages/analise/CentroAnalise.tsx'
import Relatorio from './pages/analise/Relatorio.tsx'
import CategoriaForm from './pages/categorias/CategoriaForm.tsx'
import CategoriasLista from './pages/categorias/CategoriasLista.tsx'
import ContaForm from './pages/contas/ContaForm.tsx'
import ContasLista from './pages/contas/ContasLista.tsx'
import DespesaForm from './pages/despesas/DespesaForm.tsx'
import DespesasLista from './pages/despesas/DespesasLista.tsx'
import DividaForm from './pages/dividas/DividaForm.tsx'
import DividaPagamentoForm from './pages/dividas/DividaPagamentoForm.tsx'
import DividasLista from './pages/dividas/DividasLista.tsx'
import Extrato from './pages/extrato/Extrato.tsx'
import ImportarExtrato from './pages/extrato/ImportarExtrato.tsx'
import Home from './pages/Home.tsx'
import InvestimentoForm from './pages/investimentos/InvestimentoForm.tsx'
import InvestimentosLista from './pages/investimentos/InvestimentosLista.tsx'
import Login from './pages/Login.tsx'
import MetaForm from './pages/metas/MetaForm.tsx'
import MetaProgressoForm from './pages/metas/MetaProgressoForm.tsx'
import MetasLista from './pages/metas/MetasLista.tsx'
import OrcamentoForm from './pages/orcamentos/OrcamentoForm.tsx'
import OrcamentosPagina from './pages/orcamentos/OrcamentosPagina.tsx'
import PaginaErro from './pages/PaginaErro.tsx'
import ReceitaForm from './pages/receitas/ReceitaForm.tsx'
import ReceitasLista from './pages/receitas/ReceitasLista.tsx'
import UsuarioForm from './pages/usuarios/UsuarioForm.tsx'
import UsuariosLista from './pages/usuarios/UsuariosLista.tsx'

// Rotas da SPA. /login e /cadastro são públicas; o resto exige login (RotaProtegida).
// As telas de cadastro têm rotas filhas: o formulário abre como janela por cima da lista (Outlet).
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        {/* Principal: as telas do protótipo da Fase 2 */}
        <Route path="/" element={<Home />} />
        <Route path="/extrato" element={<Extrato />}>
          <Route path="importar" element={<ImportarExtrato />} />
        </Route>
        <Route path="/analise" element={<CentroAnalise />} />
        <Route path="/orcamentos" element={<OrcamentosPagina />}>
          <Route path="novo" element={<OrcamentoForm />} />
          <Route path=":id/editar" element={<OrcamentoForm />} />
        </Route>
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/relatorio" element={<Relatorio />} />

        {/* Cadastros: uma tela por controller do backend */}
        <Route path="/receitas" element={<ReceitasLista />}>
          <Route path="novo" element={<ReceitaForm />} />
          <Route path=":id/editar" element={<ReceitaForm />} />
        </Route>

        <Route path="/despesas" element={<DespesasLista />}>
          <Route path="novo" element={<DespesaForm />} />
          <Route path=":id/editar" element={<DespesaForm />} />
        </Route>

        <Route path="/dividas" element={<DividasLista />}>
          <Route path="novo" element={<DividaForm />} />
          <Route path=":id/editar" element={<DividaForm />} />
          <Route path=":id/pagar" element={<DividaPagamentoForm />} />
        </Route>

        <Route path="/metas" element={<MetasLista />}>
          <Route path="novo" element={<MetaForm />} />
          <Route path=":id/editar" element={<MetaForm />} />
          <Route path=":id/progresso" element={<MetaProgressoForm />} />
        </Route>

        <Route path="/contas" element={<ContasLista />}>
          <Route path="novo" element={<ContaForm />} />
          <Route path=":id/editar" element={<ContaForm />} />
        </Route>

        <Route path="/investimentos" element={<InvestimentosLista />}>
          <Route path="novo" element={<InvestimentoForm />} />
          <Route path=":id/editar" element={<InvestimentoForm />} />
        </Route>

        <Route path="/categorias" element={<CategoriasLista />}>
          <Route path="novo" element={<CategoriaForm />} />
          <Route path=":id/editar" element={<CategoriaForm />} />
        </Route>

        <Route path="/usuarios" element={<UsuariosLista />}>
          <Route path="novo" element={<UsuarioForm />} />
          <Route path=":id/editar" element={<UsuarioForm />} />
        </Route>
      </Route>

      <Route path="*" element={<PaginaErro />} />
    </Routes>
  )
}