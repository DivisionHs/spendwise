package br.com.fiap.spendwise.model.enums;

/**
 * Categorias de despesa da user story US01 (Fase 1): Alimentacao, Transporte, Moradia,
 * Lazer, Saude, Educacao e Outros. Tambem e a categoria dos orcamentos (US03).
 * Gravada no banco pelo nome (ex.: ALIMENTACAO).
 */
public enum CategoriaDespesa {
    ALIMENTACAO("Alimentação"),
    TRANSPORTE("Transporte"),
    MORADIA("Moradia"),
    LAZER("Lazer"),
    SAUDE("Saúde"),
    EDUCACAO("Educação"),
    OUTROS("Outros");

    private final String rotulo;

    CategoriaDespesa(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }
}