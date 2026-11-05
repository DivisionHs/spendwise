package br.com.fiap.spendwise.exception;

/** Ja existe usuario com o e-mail informado. HTTP 409. */
public class EmailJaCadastradoException extends ConflitoException {

    public EmailJaCadastradoException(String email) {
        super("Já existe um usuário com o e-mail " + email + ".");
    }
}