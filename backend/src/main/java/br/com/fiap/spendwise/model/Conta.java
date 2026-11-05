package br.com.fiap.spendwise.model;

import br.com.fiap.spendwise.model.enums.TipoConta;
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
 * Conta bancaria de um usuario (tabela T_FIN_CONTA, criada na Fase 6).
 * O saldo e atualizado pelas receitas e despesas (Transacao.aplicarNoSaldo).
 */
@Entity
@Table(name = "T_FIN_CONTA")
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conta")
    private Long idConta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "nm_banco", nullable = false, length = 100)
    private String banco;

    @Column(name = "nr_agencia", nullable = false, length = 10)
    private String agencia;

    @Column(name = "nr_conta", nullable = false, length = 20)
    private String numeroConta;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_tipo_conta", nullable = false, length = 20)
    private TipoConta tipo;

    @Column(name = "vl_saldo", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    public Conta() {
    }

    /** Soma (ou subtrai, se negativo) um valor ao saldo da conta, como Usuario.atualizarSaldo da Fase 5. */
    public void atualizarSaldo(BigDecimal valor) {
        this.saldo = this.saldo.add(valor);
    }

    public Long getIdConta() {
        return idConta;
    }

    public void setIdConta(Long idConta) {
        this.idConta = idConta;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getBanco() {
        return banco;
    }

    public void setBanco(String banco) {
        this.banco = banco;
    }

    public String getAgencia() {
        return agencia;
    }

    public void setAgencia(String agencia) {
        this.agencia = agencia;
    }

    public String getNumeroConta() {
        return numeroConta;
    }

    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }

    public TipoConta getTipo() {
        return tipo;
    }

    public void setTipo(TipoConta tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}