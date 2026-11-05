import type { ContextoLista } from '../../tipos.ts'
import { useState, type ChangeEvent } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Alerta from '../../components/Alerta.tsx'
import JanelaFormulario from '../../components/JanelaFormulario.tsx'
import { useAuth } from '../../context/AuthContext.tsx'
import { useDialogos } from '../../context/DialogosContext.tsx'
import { despesasApi, receitasApi } from '../../services/api.ts'
import { baixarArquivo, lerCsv, MODELO_CSV, type LinhaImportada } from '../../services/extrato.ts'
import { dataBr, moeda } from '../../services/formatar.ts'

// Importar Extrato Bancário (caso de uso da Fase 1): lê um CSV e cadastra as receitas e despesas.
export default function ImportarExtrato() {
  const { usuario } = useAuth()
  const { recarregar } = useOutletContext<ContextoLista>()
  const { confirmar, notificar } = useDialogos()
  const navegar = useNavigate()
  const [linhas, setLinhas] = useState<LinhaImportada[]>([])
  const [arquivo, setArquivo] = useState('')
  const [erro, setErro] = useState('')
  const [importando, setImportando] = useState(false)

  const validas = linhas.filter((l) => l.ok)

  async function aoEscolher(evento: ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0]
    setErro('')
    setLinhas([])
    if (!escolhido) return
    setArquivo(escolhido.name)
    try {
      const resultado = lerCsv(await escolhido.text())
      if (resultado.length === 0) setErro('O arquivo está vazio.')
      setLinhas(resultado)
    } catch {
      setErro('Não foi possível ler o arquivo.')
    }
  }

  async function importar() {
    const ignoradas = linhas.length - validas.length
    const confirmado = await confirmar({
      titulo: 'Importar este extrato?',
      mensagem: `${validas.length} lançamento(s) serão cadastrados${ignoradas > 0 ? ` e ${ignoradas} linha(s) com erro serão ignoradas` : ''}.`,
      textoConfirmar: 'Sim, importar',
    })
    if (!confirmado) return
    setImportando(true)
    let feitos = 0
    let falhas = 0
    for (const l of validas) {
      try {
        const base = { usuario: { idUsuario: usuario.idUsuario }, valor: l.valor, data: l.data, descricao: l.descricao }
        if (l.tipo === 'RECEITA') await receitasApi.criar(base)
        else await despesasApi.criar({ ...base, categoria: l.categoria })
        feitos += 1
      } catch {
        falhas += 1
      }
    }
    await recarregar()
    navegar('/extrato')
    notificar(falhas ? 'aviso' : 'sucesso', `${feitos} lançamento(s) importado(s)${falhas ? ` e ${falhas} com falha` : ''}.`)
  }

  return (
    <JanelaFormulario titulo="Importar extrato" rotaVoltar="/extrato">
      <p className="estado">
        Escolha um arquivo CSV com as colunas <strong>data;descricao;valor;categoria</strong>. Valor positivo vira receita e negativo vira
        despesa (a categoria é opcional e só vale para despesas).
      </p>
      <p>
        <button type="button" className="botao botao-pequeno botao-contorno" onClick={() => baixarArquivo('modelo-extrato.csv', MODELO_CSV)}>
          Baixar arquivo de modelo
        </button>
      </p>
      <div className="campo">
        <label htmlFor="arquivo-extrato">Arquivo CSV</label>
        <input id="arquivo-extrato" type="file" accept=".csv,text/csv" onChange={aoEscolher} />
        {arquivo && <small>{arquivo}</small>}
      </div>
      <Alerta tipo="erro">{erro}</Alerta>

      {linhas.length > 0 && (
        <>
          <p className="estado">
            {validas.length} linha(s) válida(s) de {linhas.length}.
          </p>
          <div className="tabela-caixa previa-importacao">
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {linhas.slice(0, 50).map((l) => (
                  <tr key={l.linha}>
                    <td>{l.linha}</td>
                    <td>{l.data ? dataBr(l.data) : '-'}</td>
                    <td>{l.descricao || '-'}</td>
                    <td>{l.valor ? (l.tipo === 'DESPESA' ? '- ' : '+ ') + moeda(Math.abs(l.valor)) : '-'}</td>
                    <td>
                      {l.ok ? (
                        <span className="etiqueta etiqueta-ok">{l.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}</span>
                      ) : (
                        <span className="etiqueta etiqueta-critico">{l.erro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="formulario-botoes">
        <button type="button" className="botao botao-primario" disabled={validas.length === 0 || importando} onClick={importar}>
          {importando ? 'Importando...' : `Importar ${validas.length || ''} lançamento(s)`}
        </button>
        <button type="button" className="botao botao-contorno" onClick={() => navegar('/extrato')}>
          Cancelar
        </button>
      </div>
    </JanelaFormulario>
  )
}
