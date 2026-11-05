package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/** Dado invalido ou regra de negocio violada. HTTP 400 (Bad Request). */
public class RegraNegocioException extends SpendWiseException {

    public RegraNegocioException(String mensagem) {
        super(HttpStatus.BAD_REQUEST, mensagem);
    }
}