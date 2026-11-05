package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.model.Investimento;
import br.com.fiap.spendwise.service.InvestimentoService;
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
 * CRUD de investimentos. A listagem aceita ?idUsuario= para filtrar por usuario.
 * GET 200 | POST 201 (+Location) | PUT 200 | DELETE 204
 */
@RestController
@RequestMapping("/api/investimentos")
public class InvestimentoController {

    private final InvestimentoService service;

    public InvestimentoController(InvestimentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Investimento>> listar(@RequestParam(required = false) Long idUsuario) {
        return ResponseEntity.ok(service.listar(idUsuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investimento> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Investimento> criar(@RequestBody Investimento investimento) {
        Investimento criado = service.criar(investimento);
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criado.getIdInvest()).toUri();
        return ResponseEntity.created(local).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investimento> atualizar(@PathVariable Long id, @RequestBody Investimento investimento) {
        return ResponseEntity.ok(service.atualizar(id, investimento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
