package br.com.fiap.spendwise.controller;

import br.com.fiap.spendwise.dto.LoginRequest;
import br.com.fiap.spendwise.dto.LoginResposta;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.seguranca.TokenService;
import br.com.fiap.spendwise.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Login. Credenciais corretas: 200 com os dados do usuario (sem a senha) e o token de acesso.
 * Incorretas: 401. O token vai em "Authorization: Bearer TOKEN" nas demais chamadas.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    public AuthController(UsuarioService usuarioService, TokenService tokenService) {
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResposta> login(@RequestBody LoginRequest dados) {
        Usuario usuario = usuarioService.autenticar(dados.email(), dados.senha());
        return ResponseEntity.ok(LoginResposta.de(usuario, tokenService.gerar(usuario)));
    }
}