package br.com.fiap.spendwise.model;

import br.com.fiap.spendwise.seguranca.ComDono;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Orcamento: limite mensal de gastos de uma categoria (US03 da Fase 1, tela "Orcamentos"
 * da Fase 2). Mapeia T_FIN_ORCAMENTO; um por usuario e categoria.
 */
@Entity
@Table(name = "T_FIN_ORCAMENTO")
public class Orcamento implements ComDono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orcamento")
    private Long idOrcamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_categoria", nullable = false, length = 30)
    private CategoriaDespesa categoria;

    @Column(name = "vl_limite", nullable = false, precision = 15, scale = 2)
    private BigDecimal limite;

    public Orcamento() {
    }

    public Long getIdOrcamento() {
        return idOrcamento;
    }

    public void setIdOrcamento(Long idOrcamento) {
        this.idOrcamento = idOrcamento;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public CategoriaDespesa getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaDespesa categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getLimite() {
        return limite;
    }

    public void setLimite(BigDecimal limite) {
        this.limite = limite;
    }
}