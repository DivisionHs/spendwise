package br.com.fiap.spendwise.model.enums;

/**
 * Situacao de um orcamento no mes (telas da Fase 2): OK abaixo de 80% do limite,
 * ATENCAO a partir de 80% (US03, alerta de proximidade), CRITICO a partir de 90% e
 * EXCEDIDO acima de 100% (US03, alerta de ultrapassagem).
 */
public enum SituacaoOrcamento {
    OK,
    ATENCAO,
    CRITICO,
    EXCEDIDO
}