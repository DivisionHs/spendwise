package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.DataInvalidaException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.exception.ValorInvalidoException;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Validacoes que se repetem nos lancamentos e demais cadastros financeiros
 * (usuario existente, valor positivo, data informada). Evita duplicar regra entre os services.
 */
final class ValidacaoLancamento {

    private static final BigDecimal VALOR_MAXIMO = new BigDecimal("9999999999999.99");

    private ValidacaoLancamento() {
    }

    /** Garante que o usuario informado (so o id) existe e devolve o registro completo. */
    static Usuario usuarioExistente(Usuario informado, UsuarioRepository repositorio) {
        if (informado == null || informado.getIdUsuario() == null) {
            throw new RegraNegocioException("Informe o usuário do registro (usuario.idUsuario).");
        }
        return repositorio.findById(informado.getIdUsuario()).orElseThrow(() ->
                new RecursoNaoEncontradoException("Usuário " + informado.getIdUsuario() + " não encontrado."));
    }

    /** Valor deve ser maior que zero e caber em NUMBER(15,2). Devolve com 2 casas. */
    static BigDecimal valorPositivo(BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new ValorInvalidoException("O valor deve ser maior que zero.");
        }
        return limitar(valor);
    }

    /** Valor que pode ser zero ou positivo (ex.: saldo inicial de conta). */
    static BigDecimal valorNaoNegativo(BigDecimal valor) {
        if (valor == null || valor.signum() < 0) {
            throw new ValorInvalidoException("O valor não pode ser negativo.");
        }
        return limitar(valor);
    }

    private static BigDecimal limitar(BigDecimal valor) {
        BigDecimal arredondado = valor.setScale(2, RoundingMode.HALF_UP);
        if (arredondado.abs().compareTo(VALOR_MAXIMO) > 0) {
            throw new ValorInvalidoException("O valor informado é grande demais.");
        }
        return arredondado;
    }

    static LocalDate dataObrigatoria(LocalDate data) {
        if (data == null) {
            throw new DataInvalidaException("A data é obrigatória.");
        }
        return data;
    }

    static LocalDate dataNaoFutura(LocalDate data) {
        dataObrigatoria(data);
        if (data.isAfter(LocalDate.now())) {
            throw new DataInvalidaException("A data não pode ser futura.");
        }
        return data;
    }

    static String descricaoObrigatoria(String descricao) {
        return textoObrigatorio(descricao, "A descrição", 255);
    }

    /** Texto obrigatorio com tamanho maximo. rotulo ex.: "O nome". */
    static String textoObrigatorio(String texto, String rotulo, int maximo) {
        if (texto == null || texto.isBlank()) {
            throw new RegraNegocioException(rotulo + " é obrigatório(a).");
        }
        if (texto.trim().length() > maximo) {
            throw new RegraNegocioException(rotulo + " deve ter até " + maximo + " caracteres.");
        }
        return texto.trim();
    }
}