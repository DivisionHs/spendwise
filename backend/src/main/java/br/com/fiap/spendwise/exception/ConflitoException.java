package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/** Conflito com o estado atual dos dados. HTTP 409 (Conflict). */
public class ConflitoException extends SpendWiseException {

    public ConflitoException(String mensagem) {
        super(HttpStatus.CONFLICT, mensagem);
    }
}