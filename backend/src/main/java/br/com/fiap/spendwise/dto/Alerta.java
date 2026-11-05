package br.com.fiap.spendwise.dto;

/** Alerta financeiro. severidade: CRITICO, ATENCAO ou INFORMATIVO. */
public record Alerta(String severidade, String titulo, String descricao, String categoria) {
}