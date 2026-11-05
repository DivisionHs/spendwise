import { useEffect, useState } from 'react'

// Carrega UM registro para a tela de edição. Se `id` não existir (tela de "novo"),
// não busca nada e devolve registro = null.
export function useRegistro<T>(buscar: (id: string) => Promise<T>, id: string | undefined) {
  const [registro, setRegistro] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(Boolean(id))
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setCarregando(true)
    buscar(id)
      .then((dados) => {
        if (!cancelado) setRegistro(dados)
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof Error ? e.message : 'Erro inesperado.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return { registro, carregando, erro }
}