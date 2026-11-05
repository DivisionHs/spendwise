package br.com.fiap.spendwise.exception;

/** Login com e-mail ou senha incorretos. HTTP 401. */
public class CredenciaisInvalidasException extends NaoAutorizadoException {

    public CredenciaisInvalidasException() {
        super("E-mail ou senha incorretos.");
    }
}