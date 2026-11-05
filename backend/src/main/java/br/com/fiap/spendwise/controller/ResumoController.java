package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.dto.ResumoFinanceiro;
import br.com.fiap.spendwise.service.ResumoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Totais da pagina inicial de um usuario. */
@RestController
@RequestMapping("/api/resumo")
public class ResumoController {

    private final ResumoService service;

    public ResumoController(ResumoService service) {
        this.service = service;
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<ResumoFinanceiro> resumir(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(service.resumir(idUsuario));
    }
}
