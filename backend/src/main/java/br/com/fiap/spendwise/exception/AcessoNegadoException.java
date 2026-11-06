package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/** Usuario autenticado, mas sem permissao para a operacao. HTTP 403 (Forbidden). */
public class AcessoNegadoException extends SpendWiseException {

    public AcessoNegadoException(String mensagem) {
        super(HttpStatus.FORBIDDEN, mensagem);
    }
}