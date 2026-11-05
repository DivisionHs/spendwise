package br.com.fiap.spendwise.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fiap.spendwise.exception.CategoriaInvalidaException;
import br.com.fiap.spendwise.exception.DataInvalidaException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.ValorInvalidoException;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Regras da despesa (US01): campos obrigatorios, valor positivo e saldo da conta atualizado. */
class DespesaServiceTest {

    private DespesaRepository despesaRepository;
    private UsuarioRepository usuarioRepository;
    private SaldoService saldoService;
    private DespesaService service;

    @BeforeEach
    void preparar() {
        despesaRepository = mock(DespesaRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        saldoService = mock(SaldoService.class);
        service = new DespesaService(despesaRepository, usuarioRepository, saldoService);

        Usuario u = new Usuario();
        u.setIdUsuario(1L);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(u));
        when(despesaRepository.save(any(Despesa.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Despesa dados() {
        Usuario u = new Usuario();
        u.setIdUsuario(1L);
        Despesa d = new Despesa();
        d.setUsuario(u);
        d.setValor(new BigDecimal("42.50"));
        d.setData(LocalDate.now());
        d.setDescricao("Mercado");
        d.setCategoria(CategoriaDespesa.ALIMENTACAO);
        return d;
    }

    @Test
    void criaDespesaValidaEAplicaNoSaldo() {
        Despesa salva = service.criar(dados());
        assertEquals(CategoriaDespesa.ALIMENTACAO, salva.getCategoria());
        verify(saldoService).aplicar(salva);
    }

    @Test
    void semCategoriaLancaCategoriaInvalida() {
        Despesa d = dados();
        d.setCategoria(null);
        assertThrows(CategoriaInvalidaException.class, () -> service.criar(d));
        verify(saldoService, never()).aplicar(any());
    }

    @Test
    void valorZeroLancaValorInvalido() {
        Despesa d = dados();
        d.setValor(BigDecimal.ZERO);
        assertThrows(ValorInvalidoException.class, () -> service.criar(d));
    }

    @Test
    void semDataLancaDataInvalida() {
        Despesa d = dados();
        d.setData(null);
        assertThrows(DataInvalidaException.class, () -> service.criar(d));
    }

    @Test
    void buscarInexistenteLancaNaoEncontrado() {
        when(despesaRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscarPorId(99L));
    }
}