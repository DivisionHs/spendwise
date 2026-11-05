package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.model.CategoriaInvestimento;
import br.com.fiap.spendwise.model.Investimento;
import br.com.fiap.spendwise.repository.CategoriaInvestimentoRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de negocio do investimento: usuario e categoria existentes, valor
 * maior que zero e data informada que nao seja futura (so se registra o que
 * ja foi investido).
 */
@Service
public class InvestimentoService {

    private final InvestimentoRepository investimentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaInvestimentoRepository categoriaRepository;

    public InvestimentoService(InvestimentoRepository investimentoRepository,
                               UsuarioRepository usuarioRepository,
                               CategoriaInvestimentoRepository categoriaRepository) {
        this.investimentoRepository = investimentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Investimento> listar(Long idUsuario) {
        if (idUsuario != null) {
            return investimentoRepository.findByUsuarioIdUsuarioOrderByDataDesc(idUsuario);
        }
        return investimentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Investimento buscarPorId(Long id) {
        return investimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Investimento " + id + " não encontrado."));
    }

    @Transactional
    public Investimento criar(Investimento dados) {
        Investimento novo = new Investimento();
        preencher(novo, dados);
        return investimentoRepository.save(novo);
    }

    @Transactional
    public Investimento atualizar(Long id, Investimento dados) {
        Investimento existente = buscarPorId(id);
        preencher(existente, dados);
        return investimentoRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        investimentoRepository.delete(buscarPorId(id));
    }

    private void preencher(Investimento destino, Investimento dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setCategoria(categoriaExistente(dados.getCategoria()));
        destino.setValorInvestido(ValidacaoLancamento.valorPositivo(dados.getValorInvestido()));
        destino.setData(ValidacaoLancamento.dataNaoFutura(dados.getData()));
    }

    private CategoriaInvestimento categoriaExistente(CategoriaInvestimento informada) {
        if (informada == null || informada.getIdCatInvest() == null) {
            throw new RegraNegocioException("Informe a categoria do investimento (categoria.idCatInvest).");
        }
        return categoriaRepository.findById(informada.getIdCatInvest()).orElseThrow(() ->
                new RecursoNaoEncontradoException("Categoria " + informada.getIdCatInvest() + " não encontrada."));
    }
}
