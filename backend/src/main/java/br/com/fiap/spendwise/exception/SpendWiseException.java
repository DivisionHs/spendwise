package br.com.fiap.spendwise.exception;

import org.springframework.http.HttpStatus;

/**
 * Raiz de todas as excecoes da aplicacao. Cada subclasse diz qual codigo HTTP representa;
 * o TratadorDeErros traduz qualquer SpendWiseException em resposta JSON, sem if/else.
 */
public abstract class SpendWiseException extends RuntimeException {

    private final HttpStatus status;

    protected SpendWiseException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}