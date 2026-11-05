import { Link } from 'react-router-dom'

// Página de erro personalizada (rota inexistente). Props permitem reaproveitar para outros erros.
interface Props {
  codigo?: string
  titulo?: string
  mensagem?: string
}

export default function PaginaErro({ codigo = '404', titulo = 'Página não encontrada', mensagem }: Props) {
  return (
    <div className="pagina-centro">
      <div className="cartao-erro">
        <div className="erro-codigo">{codigo}</div>
        <h1>{titulo}</h1>
        <p>{mensagem ?? 'O endereço que você acessou não existe ou foi movido.'}</p>
        <Link to="/" className="botao botao-primario">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
