package br.com.fiap.spendwise.exception;

/** Data ausente ou fora do permitido (ex.: investimento no futuro). HTTP 400. */
public class DataInvalidaException extends RegraNegocioException {

    public DataInvalidaException(String mensagem) {
        super(mensagem);
    }
}