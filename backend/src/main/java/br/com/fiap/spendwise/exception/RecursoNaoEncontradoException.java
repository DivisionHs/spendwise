package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/** Registro inexistente. HTTP 404 (Not Found). */
public class RecursoNaoEncontradoException extends SpendWiseException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(HttpStatus.NOT_FOUND, mensagem);
    }
}