import { useCallback, useEffect, useState } from 'react'

// Carrega uma lista da API e controla carregando/erro.
// `carregar` é uma função que devolve uma Promise com a lista; `dependencias` dizem quando recarregar.
// "Carregando..." só aparece na primeira vez: ao recarregar depois de salvar ou excluir,
// a lista antiga continua na tela até a nova chegar (sem piscar os gráficos).
export function useLista<T>(carregar: () => Promise<T[]>, dependencias: unknown[] = []) {
  const [itens, setItens] = useState<T[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buscar = useCallback(carregar, dependencias)

  const recarregar = useCallback(async () => {
    setErro('')
    try {
      setItens(await buscar())
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }, [buscar])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { itens, carregando, erro, recarregar }
}