package br.com.fiap.spendwise.exception;

/** Categoria de despesa ou de orcamento fora da lista permitida. HTTP 400. */
public class CategoriaInvalidaException extends RegraNegocioException {

    public CategoriaInvalidaException(String mensagem) {
        super(mensagem);
    }
}