package br.com.fiap.spendwise.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Heranca e polimorfismo (Fase 5): Receita soma no saldo e Despesa subtrai, vistas como Transacao. */
class TransacaoTest {

    private Receita receita(String valor) {
        Receita r = new Receita();
        r.setValor(new BigDecimal(valor));
        r.setData(LocalDate.now());
        r.setDescricao("Salario");
        return r;
    }

    private Despesa despesa(String valor) {
        Despesa d = new Despesa();
        d.setValor(new BigDecimal(valor));
        d.setData(LocalDate.now());
        d.setDescricao("Aluguel");
        return d;
    }

    @Test
    void receitaSomaEDespesaSubtraiNoSaldo() {
        assertEquals(new BigDecimal("100.00"), receita("100.00").efeitoNoSaldo());
        assertEquals(new BigDecimal("-40.00"), despesa("40.00").efeitoNoSaldo());
    }

    @Test
    void aplicarNoSaldoAtualizaAConta() {
        Conta conta = new Conta();
        conta.setSaldo(new BigDecimal("1000.00"));

        receita("250.00").aplicarNoSaldo(conta);
        despesa("100.00").aplicarNoSaldo(conta);

        assertEquals(new BigDecimal("1150.00"), conta.getSaldo());
    }

    @Test
    void listaDeTransacoesSomaPeloPolimorfismo() {
        List<Transacao> transacoes = List.of(receita("500.00"), despesa("120.00"), despesa("30.00"));
        BigDecimal saldo = transacoes.stream().map(Transacao::efeitoNoSaldo).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("350.00"), saldo);
    }

    @Test
    void tipoIdentificaCadaFilha() {
        assertEquals("RECEITA", receita("1").getTipo());
        assertEquals("DESPESA", despesa("1").getTipo());
    }
}