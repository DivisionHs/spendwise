import { useCallback, useState } from 'react'
import { salvarTema, temaInicial, type Tema } from '../services/tema.ts'

// Tema atual e função para alternar entre claro e escuro (guarda a escolha no navegador).
export function useTema() {
  const [tema, setTema] = useState<Tema>(() => (document.documentElement.dataset.tema as Tema | undefined) ?? temaInicial())

  const alternar = useCallback(() => {
    const novo: Tema = tema === 'escuro' ? 'claro' : 'escuro'
    salvarTema(novo)
    setTema(novo)
  }, [tema])

  return { tema, alternar }
}