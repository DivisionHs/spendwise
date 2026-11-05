package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.dto.AlertasEInsights;
import br.com.fiap.spendwise.service.AnaliseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Alertas e insights de um usuario (tela "Alertas e Insights"). GET 200. */
@RestController
@RequestMapping("/api/analise")
public class AnaliseController {

    private final AnaliseService service;

    public AnaliseController(AnaliseService service) {
        this.service = service;
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<AlertasEInsights> analisar(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.analisar(idUsuario));
    }
}