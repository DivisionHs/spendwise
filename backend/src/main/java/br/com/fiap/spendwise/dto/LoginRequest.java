package br.com.fiap.spendwise.dto;

/** Corpo do POST /api/auth/login. */
public record LoginRequest(String email, String senha) {
}
