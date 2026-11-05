package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.ConflitoException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegistroEmUsoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.model.CategoriaInvestimento;
import br.com.fiap.spendwise.repository.CategoriaInvestimentoRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de negocio da categoria de investimento: nome obrigatorio e unico,
 * risco entre BAIXO, MODERADO e ALTO, e categoria em uso nao pode ser excluida.
 */
@Service
public class CategoriaInvestimentoService {

    private static final Set<String> RISCOS = Set.of("BAIXO", "MODERADO", "ALTO");

    private final CategoriaInvestimentoRepository categoriaRepository;
    private final InvestimentoRepository investimentoRepository;

    public CategoriaInvestimentoService(CategoriaInvestimentoRepository categoriaRepository,
                                        InvestimentoRepository investimentoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.investimentoRepository = investimentoRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaInvestimento> listar() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CategoriaInvestimento buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + id + " não encontrada."));
    }

    @Transactional
    public CategoriaInvestimento criar(CategoriaInvestimento dados) {
        validar(dados);
        categoriaRepository.findFirstByNomeIgnoreCase(dados.getNome()).ifPresent(outra -> {
            throw new ConflitoException("Já existe a categoria " + dados.getNome() + ".");
        });
        return categoriaRepository.save(new CategoriaInvestimento(dados.getNome(), dados.getRisco()));
    }

    @Transactional
    public CategoriaInvestimento atualizar(Long id, CategoriaInvestimento dados) {
        CategoriaInvestimento existente = buscarPorId(id);
        validar(dados);
        categoriaRepository.findFirstByNomeIgnoreCase(dados.getNome())
                .filter(outra -> !outra.getIdCatInvest().equals(id))
                .ifPresent(outra -> {
                    throw new ConflitoException("Já existe a categoria " + dados.getNome() + ".");
                });
        existente.setNome(dados.getNome());
        existente.setRisco(dados.getRisco());
        return categoriaRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        CategoriaInvestimento existente = buscarPorId(id);
        if (investimentoRepository.existsByCategoriaIdCatInvest(id)) {
            throw new RegistroEmUsoException("Não é possível excluir a categoria: há investimentos nela.");
        }
        categoriaRepository.delete(existente);
    }

    private void validar(CategoriaInvestimento dados) {
        if (dados == null || dados.getNome() == null || dados.getNome().isBlank()
                || dados.getNome().length() > 50) {
            throw new RegraNegocioException("O nome da categoria é obrigatório (até 50 caracteres).");
        }
        dados.setNome(dados.getNome().trim());

        String risco = dados.getRisco() == null ? "" : dados.getRisco().trim().toUpperCase();
        if (!RISCOS.contains(risco)) {
            throw new RegraNegocioException("O risco deve ser BAIXO, MODERADO ou ALTO.");
        }
        dados.setRisco(risco);
    }
}
