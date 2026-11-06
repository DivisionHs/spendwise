package br.com.fiap.spendwise.model;

import br.com.fiap.spendwise.seguranca.ComDono;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Superclasse abstrata de Receita e Despesa (heranca e polimorfismo da Fase 5).
 * Guarda o que as duas tem em comum; cada filha diz como mexe no saldo
 * (efeitoNoSaldo) e as colunas de cada tabela sao ajustadas com @AttributeOverride.
 */
@MappedSuperclass
public abstract class Transacao implements ComDono {

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    private BigDecimal valor;

    private LocalDate data;

    @Column(length = 255)
    private String descricao;

    /** Receita soma no saldo, despesa subtrai. */
    public abstract BigDecimal efeitoNoSaldo();

    /** "RECEITA" ou "DESPESA": aparece no JSON e identifica a linha no extrato. */
    public abstract String getTipo();

    /** Aplica a transacao no saldo de uma conta (mesmo nome do metodo da Fase 5). */
    public void aplicarNoSaldo(Conta conta) {
        conta.atualizarSaldo(efeitoNoSaldo());
    }

    /** Resumo em texto, como na Fase 5: "[Receita] Salario - R$ 5200.00 em 2026-11-05". */
    public String exibirResumo() {
        return "[" + getTipo() + "] " + descricao + " - R$ " + valor + " em " + data;
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}