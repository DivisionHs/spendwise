package br.com.fiap.spendwise.dto;

import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.Papel;

/** Resposta do login: os dados do usuario (sem senha) e o token que deve ir em "Authorization: Bearer". */
public record LoginResposta(Long idUsuario, String nome, String email, String cep, Papel papel, String token) {

    public static LoginResposta de(Usuario u, String token) {
        return new LoginResposta(u.getIdUsuario(), u.getNome(), u.getEmail(), u.getCep(), u.getPapel(), token);
    }
}