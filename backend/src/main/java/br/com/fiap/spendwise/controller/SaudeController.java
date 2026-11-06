package br.com.fiap.spendwise.controller;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verificacao de saude, publica (sem token), para monitores de disponibilidade como o UptimeRobot.
 * Nao devolve dado nenhum: so confirma que a API responde e que o banco atende uma consulta simples.
 * 200 {"status":"ok"} quando tudo certo; 503 {"status":"indisponivel"} se o banco nao responder.
 */
@RestController
@RequestMapping("/api/saude")
public class SaudeController {

    private static final Logger log = LoggerFactory.getLogger(SaudeController.class);

    private final JdbcTemplate jdbc;

    public SaudeController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> verificar() {
        try {
            jdbc.queryForObject("select 1", Integer.class);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (RuntimeException e) {
            log.warn("Verificacao de saude: banco indisponivel: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("status", "indisponivel"));
        }
    }
}