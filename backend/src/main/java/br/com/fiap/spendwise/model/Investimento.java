package br.com.fiap.spendwise.model;

import br.com.fiap.spendwise.seguranca.ComDono;
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
 * Investimento de um usuario em uma categoria. Mapeia a tabela T_FIN_INVESTIMENTO.
 */
@Entity
@Table(name = "T_FIN_INVESTIMENTO")
public class Investimento implements ComDono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_invest")
    private Long idInvest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_cat_invest", nullable = false)
    private CategoriaInvestimento categoria;

    @Column(name = "vl_investido", nullable = false, precision = 15, scale = 2)
    private BigDecimal valorInvestido;

    @Column(name = "dt_invest", nullable = false)
    private LocalDate data;

    public Investimento() {
    }

    public Long getIdInvest() {
        return idInvest;
    }

    public void setIdInvest(Long idInvest) {
        this.idInvest = idInvest;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public CategoriaInvestimento getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaInvestimento categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getValorInvestido() {
        return valorInvestido;
    }

    public void setValorInvestido(BigDecimal valorInvestido) {
        this.valorInvestido = valorInvestido;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }
}
