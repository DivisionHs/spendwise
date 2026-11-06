// Modo claro e escuro. A escolha fica no navegador; sem escolha, vale a preferência do sistema.
// O atributo data-tema no <html> liga as cores do modo escuro (ver styles.css).
export type Tema = 'claro' | 'escuro'

const CHAVE = 'spendwise.tema'

export function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE)
  if (salvo === 'claro' || salvo === 'escuro') return salvo
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema
}

export function salvarTema(tema: Tema) {
  localStorage.setItem(CHAVE, tema)
  aplicarTema(tema)
}