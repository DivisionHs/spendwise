package br.com.fiap.spendwise.dto;

import java.math.BigDecimal;

/** Corpo dos POST de pagamento de divida e de progresso de meta: so o valor. */
public record ValorRequest(BigDecimal valor) {
}