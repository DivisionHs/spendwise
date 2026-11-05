package br.com.fiap.spendwise.exception;

/** Exclusao bloqueada porque outros registros dependem deste. HTTP 409. */
public class RegistroEmUsoException extends ConflitoException {

    public RegistroEmUsoException(String mensagem) {
        super(mensagem);
    }
}