package br.com.fiap.spendwise.model;

import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Despesa (saida de dinheiro) de um usuario, com categoria (US01 da Fase 1).
 * Mapeia a tabela T_FIN_DESPESA e herda de Transacao.
 */
@Entity
@Table(name = "T_FIN_DESPESA")
@AttributeOverrides({
        @AttributeOverride(name = "valor", column = @Column(name = "vl_despesa", nullable = false, precision = 15, scale = 2)),
        @AttributeOverride(name = "data", column = @Column(name = "dt_despesa", nullable = false)),
        @AttributeOverride(name = "descricao", column = @Column(name = "ds_despesa", nullable = false, length = 255))
})
public class Despesa extends Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_despesa")
    private Long idDespesa;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_categoria", nullable = false, length = 30)
    private CategoriaDespesa categoria;

    public Despesa() {
    }

    @Override
    public BigDecimal efeitoNoSaldo() {
        return getValor().negate();
    }

    @Override
    public String getTipo() {
        return "DESPESA";
    }

    public Long getIdDespesa() {
        return idDespesa;
    }

    public void setIdDespesa(Long idDespesa) {
        this.idDespesa = idDespesa;
    }

    public CategoriaDespesa getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaDespesa categoria) {
        this.categoria = categoria;
    }
}