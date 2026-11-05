package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.dto.LoginRequest;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Login. Credenciais corretas: 200 com os dados do usuario (sem a senha).
 * Incorretas: 401.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginRequest dados) {
        return ResponseEntity.ok(usuarioService.autenticar(dados.email(), dados.senha()));
    }
}
