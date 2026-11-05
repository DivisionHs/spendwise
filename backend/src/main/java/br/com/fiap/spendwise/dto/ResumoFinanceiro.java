package br.com.fiap.spendwise.dto;

import java.math.BigDecimal;

/**
 * Totais mostrados no painel. saldo = receitas - despesas - investimentos (calculado com o
 * efeito de cada transacao); saldoContas = soma do saldo das contas bancarias;
 * totalDividas = quanto ainda falta pagar das dividas.
 */
public record ResumoFinanceiro(BigDecimal totalReceitas,
                               BigDecimal totalDespesas,
                               BigDecimal totalInvestido,
                               BigDecimal saldo,
                               BigDecimal saldoContas,
                               BigDecimal totalDividas) {
}