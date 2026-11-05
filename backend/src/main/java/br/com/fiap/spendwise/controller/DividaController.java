package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.model.Divida;
import br.com.fiap.spendwise.service.DividaService;
import br.com.fiap.spendwise.dto.ValorRequest;
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
 * CRUD de dividas, com pagamento parcial.
 * A listagem aceita ?idUsuario= para filtrar por usuario.
 * GET 200 | POST 201 (+Location) | PUT 200 | DELETE 204
 */
@RestController
@RequestMapping("/api/dividas")
public class DividaController {

    private final DividaService service;

    public DividaController(DividaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Divida>> listar(@RequestParam(required = false) Long idUsuario) {
        return ResponseEntity.ok(service.listar(idUsuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Divida> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Divida> criar(@RequestBody Divida divida) {
        Divida criado = service.criar(divida);
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criado.getIdDivida()).toUri();
        return ResponseEntity.created(local).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Divida> atualizar(@PathVariable Long id, @RequestBody Divida divida) {
        return ResponseEntity.ok(service.atualizar(id, divida));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /** Pagamento parcial (ou total) de uma divida: POST /api/dividas/{id}/pagamentos {"valor": 100}. */
    @PostMapping("/{id}/pagamentos")
    public ResponseEntity<Divida> pagar(@PathVariable Long id, @RequestBody ValorRequest pagamento) {
        return ResponseEntity.ok(service.pagar(id, pagamento.valor()));
    }}