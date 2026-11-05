package br.com.fiap.spendwise.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class SenhaUtilTest {

    @Test
    void hashConfereComASenhaCerta() {
        String hash = SenhaUtil.gerarHash("Teste@123");
        assertTrue(SenhaUtil.conferir("Teste@123", hash));
        assertFalse(SenhaUtil.conferir("outra-senha", hash));
    }

    @Test
    void mesmaSenhaGeraHashesDiferentesPorCausaDoSal() {
        assertNotEquals(SenhaUtil.gerarHash("abc12345"), SenhaUtil.gerarHash("abc12345"));
    }

    @Test
    void hashNuloOuMalFormadoNaoConfere() {
        assertFalse(SenhaUtil.conferir("x", null));
        assertFalse(SenhaUtil.conferir("x", "texto-puro"));
    }
}