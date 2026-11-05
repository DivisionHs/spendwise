import { useCallback, useEffect, useState } from 'react'
import { despesasApi, investimentosApi, receitasApi } from '../services/api.ts'
import type { Despesa, Investimento, Receita } from '../tipos.ts'

interface Financas {
  receitas: Receita[]
  despesas: Despesa[]
  investimentos: Investimento[]
}

// Carrega, em paralelo, as receitas, despesas e investimentos do usuário.
// Usado pela página inicial e pelas telas de análise para montar os gráficos.
// `recarregar` busca tudo de novo (usado depois de importar um extrato).
export function useFinancas(idUsuario: number) {
  const [dados, setDados] = useState<Financas>({ receitas: [], despesas: [], investimentos: [] })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    setErro('')
    try {
      const [receitas, despesas, investimentos] = await Promise.all([
        receitasApi.listar(idUsuario),
        despesasApi.listar(idUsuario),
        investimentosApi.listar(idUsuario),
      ])
      setDados({ receitas, despesas, investimentos })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }, [idUsuario])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { ...dados, carregando, erro, recarregar }
}