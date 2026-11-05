package br.com.fiap.spendwise.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Tratamento central de erros: traduz as excecoes personalizadas (SpendWiseException e
 * subclasses) e os erros comuns do Spring em respostas JSON padronizadas:
 * timestamp, status, erro, mensagem e caminho.
 */
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    /** Qualquer excecao propria da aplicacao: o proprio objeto informa o codigo HTTP. */
    @ExceptionHandler(SpendWiseException.class)
    public ResponseEntity<Map<String, Object>> excecaoDaAplicacao(SpendWiseException e, HttpServletRequest req) {
        return resposta(e.getStatus(), e.getMessage(), req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridade(DataIntegrityViolationException e, HttpServletRequest req) {
        log.warn("Violacao de integridade: {}", e.getMostSpecificCause().getMessage());
        return resposta(HttpStatus.CONFLICT,
                "A operação viola uma regra de integridade do banco (registro duplicado ou em uso).", req);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, Object>> requisicaoInvalida(Exception e, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST,
                "Requisição inválida: confira o formato do JSON, as datas (AAAA-MM-DD), as categorias e os números.", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> inesperado(Exception e, HttpServletRequest req) {
        log.error("Erro inesperado em {}", req.getRequestURI(), e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor.", req);
    }

    private ResponseEntity<Map<String, Object>> resposta(HttpStatus status, String mensagem, HttpServletRequest req) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("timestamp", LocalDateTime.now().toString());
        corpo.put("status", status.value());
        corpo.put("erro", status.getReasonPhrase());
        corpo.put("mensagem", mensagem);
        corpo.put("caminho", req.getRequestURI());
        return ResponseEntity.status(status).body(corpo);
    }
}