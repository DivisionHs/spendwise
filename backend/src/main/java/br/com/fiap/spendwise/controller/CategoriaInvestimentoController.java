package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.model.CategoriaInvestimento;
import br.com.fiap.spendwise.service.CategoriaInvestimentoService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * CRUD de categorias de investimento.
 * GET 200 | POST 201 (+Location) | PUT 200 | DELETE 204
 */
@RestController
@RequestMapping("/api/categorias-investimento")
public class CategoriaInvestimentoController {

    private final CategoriaInvestimentoService service;

    public CategoriaInvestimentoController(CategoriaInvestimentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaInvestimento>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaInvestimento> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaInvestimento> criar(@RequestBody CategoriaInvestimento categoria) {
        CategoriaInvestimento criada = service.criar(categoria);
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(criada.getIdCatInvest()).toUri();
        return ResponseEntity.created(local).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaInvestimento> atualizar(@PathVariable Long id,
                                                           @RequestBody CategoriaInvestimento categoria) {
        return ResponseEntity.ok(service.atualizar(id, categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
