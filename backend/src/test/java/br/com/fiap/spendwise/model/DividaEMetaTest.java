package br.com.fiap.spendwise.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

/** Pagamento parcial de divida e progresso de meta (metodos da Fase 5). */
class DividaEMetaTest {

    private Divida divida(String valor) {
        Divida d = new Divida();
        d.setValor(new BigDecimal(valor));
        d.setVencimento(LocalDate.now().plusDays(10));
        return d;
    }

    @Test
    void pagamentoParcialAbateDoValor() {
        Divida d = divida("1200.00");
        d.pagarParcial(new BigDecimal("500.00"));
        assertEquals(new BigDecimal("700.00"), d.getValor());
        assertFalse(d.isQuitada());
    }

    @Test
    void pagamentoTotalOuMaiorQuitaADivida() {
        Divida d = divida("300.00");
        d.pagarParcial(new BigDecimal("999.00"));
        assertTrue(d.isQuitada());
        assertEquals(0, d.getValor().signum());
    }

    @Test
    void dividaVencidaEstaMarcadaComoVencida() {
        Divida d = divida("100.00");
        d.setVencimento(LocalDate.now().minusDays(1));
        assertTrue(d.isVencida());
        d.pagarParcial(new BigDecimal("100.00"));
        assertFalse(d.isVencida());
    }

    @Test
    void progressoDaMetaAcumulaECalculaPercentual() {
        Meta m = new Meta();
        m.setValorAlvo(new BigDecimal("5000.00"));
        m.registrarProgresso(new BigDecimal("1200.00"));
        assertEquals(new BigDecimal("24.0"), m.getPercentual());
        assertFalse(m.isAtingida());

        m.registrarProgresso(new BigDecimal("3800.00"));
        assertTrue(m.isAtingida());
    }
}