package br.com.fiap.spendwise.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.fiap.spendwise.dto.OrcamentoStatus;
import br.com.fiap.spendwise.exception.ConflitoException;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.model.Orcamento;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.model.enums.SituacaoOrcamento;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.OrcamentoRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Regras do orcamento (US03): situacao por percentual e categoria unica por usuario. */
class OrcamentoServiceTest {

    private OrcamentoRepository orcamentoRepository;
    private UsuarioRepository usuarioRepository;
    private DespesaRepository despesaRepository;
    private OrcamentoService service;

    @BeforeEach
    void preparar() {
        orcamentoRepository = mock(OrcamentoRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        despesaRepository = mock(DespesaRepository.class);
        service = new OrcamentoService(orcamentoRepository, usuarioRepository, despesaRepository);
    }

    private Usuario usuario() {
        Usuario u = new Usuario();
        u.setIdUsuario(1L);
        return u;
    }

    private Orcamento orcamento(CategoriaDespesa categoria, String limite) {
        Orcamento o = new Orcamento();
        o.setIdOrcamento(10L);
        o.setUsuario(usuario());
        o.setCategoria(categoria);
        o.setLimite(new BigDecimal(limite));
        return o;
    }

    private Despesa despesa(CategoriaDespesa categoria, String valor) {
        Despesa d = new Despesa();
        d.setCategoria(categoria);
        d.setValor(new BigDecimal(valor));
        d.setData(LocalDate.now());
        return d;
    }

    private SituacaoOrcamento situacaoCom(String gasto) {
        when(orcamentoRepository.findByUsuarioIdUsuarioOrderByCategoriaAsc(1L))
                .thenReturn(List.of(orcamento(CategoriaDespesa.LAZER, "100.00")));
        when(despesaRepository.findByUsuarioIdUsuarioAndDataBetween(eq(1L), any(), any()))
                .thenReturn(List.of(despesa(CategoriaDespesa.LAZER, gasto)));
        List<OrcamentoStatus> status = service.status(1L);
        return status.get(0).situacao();
    }

    @Test
    void abaixoDe80PorCentoEstaOk() {
        assertEquals(SituacaoOrcamento.OK, situacaoCom("79.00"));
    }

    @Test
    void a80PorCentoPedeAtencao() {
        assertEquals(SituacaoOrcamento.ATENCAO, situacaoCom("80.00"));
    }

    @Test
    void a90PorCentoEstaCritico() {
        assertEquals(SituacaoOrcamento.CRITICO, situacaoCom("90.00"));
    }

    @Test
    void acimaDoLimiteEstaExcedido() {
        assertEquals(SituacaoOrcamento.EXCEDIDO, situacaoCom("100.01"));
    }

    @Test
    void naoPermiteDoisOrcamentosParaAMesmaCategoria() {
        Orcamento novo = orcamento(CategoriaDespesa.LAZER, "50.00");
        novo.setIdOrcamento(null);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario()));
        when(orcamentoRepository.findByUsuarioIdUsuarioAndCategoria(1L, CategoriaDespesa.LAZER))
                .thenReturn(Optional.of(orcamento(CategoriaDespesa.LAZER, "100.00")));

        assertThrows(ConflitoException.class, () -> service.criar(novo));
    }
}