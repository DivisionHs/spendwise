package br.com.fiap.spendwise.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Categoria de investimento (Renda Fixa, Acoes, ...) com o nivel de risco.
 * Mapeia a tabela T_FIN_CAT_INVEST.
 */
@Entity
@Table(name = "T_FIN_CAT_INVEST")
public class CategoriaInvestimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cat_invest")
    private Long idCatInvest;

    @Column(name = "nm_categoria", nullable = false, length = 50)
    private String nome;

    @Column(name = "ds_risco", nullable = false, length = 30)
    private String risco;

    public CategoriaInvestimento() {
    }

    public CategoriaInvestimento(String nome, String risco) {
        this.nome = nome;
        this.risco = risco;
    }

    public Long getIdCatInvest() {
        return idCatInvest;
    }

    public void setIdCatInvest(Long idCatInvest) {
        this.idCatInvest = idCatInvest;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRisco() {
        return risco;
    }

    public void setRisco(String risco) {
        this.risco = risco;
    }
}
