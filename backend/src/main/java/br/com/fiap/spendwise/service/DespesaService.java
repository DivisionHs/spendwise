package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.CategoriaInvalidaException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de negocio da despesa (US01 e US05 da Fase 1): usuario existente, valor maior que
 * zero, categoria obrigatoria, descricao obrigatoria e data informada. Mantem o saldo da
 * conta em dia ao criar, alterar e excluir.
 */
@Service
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SaldoService saldoService;

    public DespesaService(DespesaRepository despesaRepository, UsuarioRepository usuarioRepository,
                          SaldoService saldoService) {
        this.despesaRepository = despesaRepository;
        this.usuarioRepository = usuarioRepository;
        this.saldoService = saldoService;
    }

    @Transactional(readOnly = true)
    public List<Despesa> listar(Long idUsuario) {
        if (idUsuario != null) {
            return despesaRepository.findByUsuarioIdUsuarioOrderByDataDesc(idUsuario);
        }
        return despesaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Despesa buscarPorId(Long id) {
        return despesaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Despesa " + id + " não encontrada."));
    }

    @Transactional
    public Despesa criar(Despesa dados) {
        Despesa nova = new Despesa();
        preencher(nova, dados);
        Despesa salva = despesaRepository.save(nova);
        saldoService.aplicar(salva);
        return salva;
    }

    @Transactional
    public Despesa atualizar(Long id, Despesa dados) {
        Despesa existente = buscarPorId(id);
        Long usuarioAntigo = existente.getUsuario().getIdUsuario();
        BigDecimal efeitoAntigo = existente.efeitoNoSaldo();
        preencher(existente, dados);
        Despesa salva = despesaRepository.save(existente);
        saldoService.reverter(usuarioAntigo, efeitoAntigo);
        saldoService.aplicar(salva);
        return salva;
    }

    @Transactional
    public void excluir(Long id) {
        Despesa existente = buscarPorId(id);
        saldoService.reverter(existente.getUsuario().getIdUsuario(), existente.efeitoNoSaldo());
        despesaRepository.delete(existente);
    }

    private void preencher(Despesa destino, Despesa dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setValor(ValidacaoLancamento.valorPositivo(dados.getValor()));
        if (dados.getCategoria() == null) {
            throw new CategoriaInvalidaException(
                    "Informe a categoria da despesa (ALIMENTACAO, TRANSPORTE, MORADIA, LAZER, SAUDE, EDUCACAO ou OUTROS).");
        }
        destino.setCategoria(dados.getCategoria());
        destino.setData(ValidacaoLancamento.dataObrigatoria(dados.getData()));
        destino.setDescricao(ValidacaoLancamento.descricaoObrigatoria(dados.getDescricao()));
    }
}