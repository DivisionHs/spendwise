package br.com.fiap.spendwise.exception;

/** Valor monetario ausente, zero, negativo ou grande demais. HTTP 400. */
public class ValorInvalidoException extends RegraNegocioException {

    public ValorInvalidoException(String mensagem) {
        super(mensagem);
    }
}