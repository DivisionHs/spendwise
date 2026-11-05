package br.com.fiap.spendwise.dto;

import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.model.enums.SituacaoOrcamento;
import java.math.BigDecimal;

/** Como esta um orcamento no mes atual: quanto ja foi gasto, o que resta e a situacao. */
public record OrcamentoStatus(Long idOrcamento,
                              CategoriaDespesa categoria,
                              String rotulo,
                              BigDecimal limite,
                              BigDecimal gasto,
                              BigDecimal restante,
                              BigDecimal percentual,
                              SituacaoOrcamento situacao) {
}