package br.com.fiap.spendwise.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Receita (entrada de dinheiro) de um usuario. Mapeia a tabela T_FIN_RECEITA
 * e herda de Transacao.
 */
@Entity
@Table(name = "T_FIN_RECEITA")
@AttributeOverrides({
        @AttributeOverride(name = "valor", column = @Column(name = "vl_receita", nullable = false, precision = 15, scale = 2)),
        @AttributeOverride(name = "data", column = @Column(name = "dt_receita", nullable = false)),
        @AttributeOverride(name = "descricao", column = @Column(name = "ds_receita", nullable = false, length = 255))
})
public class Receita extends Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receita")
    private Long idReceita;

    public Receita() {
    }

    @Override
    public BigDecimal efeitoNoSaldo() {
        return getValor();
    }

    @Override
    public String getTipo() {
        return "RECEITA";
    }

    public Long getIdReceita() {
        return idReceita;
    }

    public void setIdReceita(Long idReceita) {
        this.idReceita = idReceita;
    }
}