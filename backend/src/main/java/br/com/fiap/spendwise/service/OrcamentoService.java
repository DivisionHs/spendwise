package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.dto.OrcamentoStatus;
import br.com.fiap.spendwise.exception.CategoriaInvalidaException;
import br.com.fiap.spendwise.exception.ConflitoException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.model.Orcamento;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.model.enums.SituacaoOrcamento;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.OrcamentoRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orcamentos por categoria (US03 da Fase 1): limite maior que zero, um por usuario e
 * categoria, e calculo do status no mes atual (gasto, restante, percentual e situacao:
 * ATENCAO a partir de 80%, CRITICO a partir de 90%, EXCEDIDO acima de 100%).
 */
@Service
public class OrcamentoService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private final OrcamentoRepository orcamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DespesaRepository despesaRepository;

    public OrcamentoService(OrcamentoRepository orcamentoRepository, UsuarioRepository usuarioRepository,
                            DespesaRepository despesaRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.despesaRepository = despesaRepository;
    }

    @Transactional(readOnly = true)
    public List<Orcamento> listar(Long idUsuario) {
        return idUsuario != null
                ? orcamentoRepository.findByUsuarioIdUsuarioOrderByCategoriaAsc(idUsuario)
                : orcamentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Orcamento buscarPorId(Long id) {
        return orcamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Orçamento " + id + " não encontrado."));
    }

    @Transactional
    public Orcamento criar(Orcamento dados) {
        Orcamento novo = new Orcamento();
        preencher(novo, dados);
        garantirCategoriaUnica(novo, null);
        return orcamentoRepository.save(novo);
    }

    @Transactional
    public Orcamento atualizar(Long id, Orcamento dados) {
        Orcamento existente = buscarPorId(id);
        preencher(existente, dados);
        garantirCategoriaUnica(existente, id);
        return orcamentoRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        orcamentoRepository.delete(buscarPorId(id));
    }

    /** Status de todos os orcamentos do usuario no mes atual. */
    @Transactional(readOnly = true)
    public List<OrcamentoStatus> status(Long idUsuario) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicio = hoje.withDayOfMonth(1);
        LocalDate fim = hoje.withDayOfMonth(hoje.lengthOfMonth());
        Map<CategoriaDespesa, BigDecimal> gastos = new EnumMap<>(CategoriaDespesa.class);
        for (Despesa d : despesaRepository.findByUsuarioIdUsuarioAndDataBetween(idUsuario, inicio, fim)) {
            gastos.merge(d.getCategoria(), d.getValor(), BigDecimal::add);
        }
        return orcamentoRepository.findByUsuarioIdUsuarioOrderByCategoriaAsc(idUsuario).stream()
                .map(o -> calcular(o, gastos.getOrDefault(o.getCategoria(), BigDecimal.ZERO)))
                .toList();
    }

    private OrcamentoStatus calcular(Orcamento o, BigDecimal gasto) {
        // A situacao usa o percentual exato; so o que aparece na tela e arredondado (1 casa)
        BigDecimal exato = gasto.multiply(CEM).divide(o.getLimite(), 4, RoundingMode.HALF_UP);
        BigDecimal percentual = exato.setScale(1, RoundingMode.HALF_UP);
        SituacaoOrcamento situacao;
        if (gasto.compareTo(o.getLimite()) > 0) {
            situacao = SituacaoOrcamento.EXCEDIDO;
        } else if (exato.compareTo(BigDecimal.valueOf(90)) >= 0) {
            situacao = SituacaoOrcamento.CRITICO;
        } else if (exato.compareTo(BigDecimal.valueOf(80)) >= 0) {
            situacao = SituacaoOrcamento.ATENCAO;
        } else {
            situacao = SituacaoOrcamento.OK;
        }
        return new OrcamentoStatus(o.getIdOrcamento(), o.getCategoria(), o.getCategoria().getRotulo(),
                o.getLimite(), gasto, o.getLimite().subtract(gasto), percentual, situacao);
    }
    private void preencher(Orcamento destino, Orcamento dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        if (dados.getCategoria() == null) {
            throw new CategoriaInvalidaException("Informe a categoria do orçamento.");
        }
        destino.setCategoria(dados.getCategoria());
        destino.setLimite(ValidacaoLancamento.valorPositivo(dados.getLimite()));
    }

    private void garantirCategoriaUnica(Orcamento orcamento, Long idAtual) {
        orcamentoRepository
                .findByUsuarioIdUsuarioAndCategoria(orcamento.getUsuario().getIdUsuario(), orcamento.getCategoria())
                .filter(outro -> !outro.getIdOrcamento().equals(idAtual))
                .ifPresent(outro -> {
                    throw new ConflitoException(
                            "Já existe um orçamento para a categoria " + orcamento.getCategoria().getRotulo() + ".");
                });
    }
}