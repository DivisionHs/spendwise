package br.com.fiap.spendwise.dto;

import java.util.List;

/** Resposta da tela "Alertas e Insights". */
public record AlertasEInsights(List<Alerta> alertas, List<Insight> insights) {
}