package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/** Acesso negado. HTTP 401 (Unauthorized). */
public class NaoAutorizadoException extends SpendWiseException {

    public NaoAutorizadoException(String mensagem) {
        super(HttpStatus.UNAUTHORIZED, mensagem);
    }
}