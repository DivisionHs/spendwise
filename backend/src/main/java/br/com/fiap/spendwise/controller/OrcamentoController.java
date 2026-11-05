package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.model.Orcamento;
import br.com.fiap.spendwise.service.OrcamentoService;
import br.com.fiap.spendwise.dto.OrcamentoStatus;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * CRUD de orcamentos por categoria (limite mensal de gastos), com o status do mes.
 * A listagem aceita ?idUsuario= para filtrar por usuario.
 * GET 200 | POST 201 (+Location) | PUT 200 | DELETE 204
 */
@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    private final OrcamentoService service;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Orcamento>> listar(@RequestParam(required = false) Long idUsuario) {
        return ResponseEntity.ok(service.listar(idUsuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orcamento> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Orcamento> criar(@RequestBody Orcamento orcamento) {
        Orcamento criado = service.criar(orcamento);
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criado.getIdOrcamento()).toUri();
        return ResponseEntity.created(local).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orcamento> atualizar(@PathVariable Long id, @RequestBody Orcamento orcamento) {
        return ResponseEntity.ok(service.atualizar(id, orcamento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /** Situacao de cada orcamento no mes atual: GET /api/orcamentos/status?idUsuario=1. */
    @GetMapping("/status")
    public ResponseEntity<List<OrcamentoStatus>> status(@RequestParam Long idUsuario) {
        return ResponseEntity.ok(service.status(idUsuario));
    }}