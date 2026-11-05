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
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Meta financeira de um usuario (T_FIN_METAS): quanto quer juntar (valorAlvo), ate quando
 * (dataLimite) e quanto ja juntou (valorAcumulado), atualizado por registrarProgresso (Fase 5).
 */
@Entity
@Table(name = "T_FIN_METAS")
public class Meta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_meta")
    private Long idMeta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "ds_meta", nullable = false, length = 100)
    private String descricao;

    @Column(name = "vl_alvo", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorAlvo;

    @Column(name = "vl_acumulado", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorAcumulado = BigDecimal.ZERO;

    @Column(name = "dt_limite", nullable = false)
    private LocalDate dataLimite;

    public Meta() {
    }

    /** Soma um valor ao que ja foi juntado. */
    public void registrarProgresso(BigDecimal valor) {
        this.valorAcumulado = this.valorAcumulado.add(valor);
    }

    /** Percentual atingido da meta (pode passar de 100). */
    @JsonProperty("percentual")
    public BigDecimal getPercentual() {
        if (valorAlvo == null || valorAlvo.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return valorAcumulado.multiply(BigDecimal.valueOf(100)).divide(valorAlvo, 1, RoundingMode.HALF_UP);
    }

    @JsonProperty("atingida")
    public boolean isAtingida() {
        return valorAcumulado != null && valorAlvo != null && valorAcumulado.compareTo(valorAlvo) >= 0;
    }

    public Long getIdMeta() {
        return idMeta;
    }

    public void setIdMeta(Long idMeta) {
        this.idMeta = idMeta;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValorAlvo() {
        return valorAlvo;
    }

    public void setValorAlvo(BigDecimal valorAlvo) {
        this.valorAlvo = valorAlvo;
    }

    public BigDecimal getValorAcumulado() {
        return valorAcumulado;
    }

    public void setValorAcumulado(BigDecimal valorAcumulado) {
        this.valorAcumulado = valorAcumulado;
    }

    public LocalDate getDataLimite() {
        return dataLimite;
    }

    public void setDataLimite(LocalDate dataLimite) {
        this.dataLimite = dataLimite;
    }
}