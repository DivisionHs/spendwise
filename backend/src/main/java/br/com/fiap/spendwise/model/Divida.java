package br.com.fiap.spendwise.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Divida (passivo) de um usuario. Mapeia T_FIN_DIVIDA. O valor e o que ainda falta pagar:
 * pagarParcial (Fase 5) vai reduzindo ate zero, quando a divida esta quitada.
 */
@Entity
@Table(name = "T_FIN_DIVIDA")
public class Divida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_divida")
    private Long idDivida;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "vl_divida", nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(name = "dt_vencimento", nullable = false)
    private LocalDate vencimento;

    @Column(name = "ds_divida", nullable = false, length = 255)
    private String descricao;

    public Divida() {
    }

    /** Registra um pagamento. Se cobrir tudo, a divida fica com valor zero (quitada). */
    public void pagarParcial(BigDecimal valorPago) {
        if (valorPago.compareTo(valor) >= 0) {
            valor = BigDecimal.ZERO.setScale(2);
        } else {
            valor = valor.subtract(valorPago);
        }
    }

    @JsonProperty("quitada")
    public boolean isQuitada() {
        return valor != null && valor.signum() == 0;
    }

    @JsonProperty("vencida")
    public boolean isVencida() {
        return !isQuitada() && vencimento != null && vencimento.isBefore(LocalDate.now());
    }

    public Long getIdDivida() {
        return idDivida;
    }

    public void setIdDivida(Long idDivida) {
        this.idDivida = idDivida;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public void setVencimento(LocalDate vencimento) {
        this.vencimento = vencimento;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}