package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.DataInvalidaException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.model.Meta;
import br.com.fiap.spendwise.repository.MetaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras da meta: usuario existente, descricao obrigatoria, valor alvo maior que zero e data
 * limite que nao esteja no passado ao cadastrar. Registro de progresso (Fase 5) soma ao
 * valor acumulado.
 */
@Service
public class MetaService {

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;

    public MetaService(MetaRepository metaRepository, UsuarioRepository usuarioRepository) {
        this.metaRepository = metaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Meta> listar(Long idUsuario) {
        return idUsuario != null
                ? metaRepository.findByUsuarioIdUsuarioOrderByDataLimiteAsc(idUsuario)
                : metaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Meta buscarPorId(Long id) {
        return metaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Meta " + id + " não encontrada."));
    }

    @Transactional
    public Meta criar(Meta dados) {
        Meta nova = new Meta();
        preencher(nova, dados);
        if (nova.getDataLimite().isBefore(LocalDate.now())) {
            throw new DataInvalidaException("A data limite da meta não pode estar no passado.");
        }
        nova.setValorAcumulado(dados.getValorAcumulado() == null
                ? BigDecimal.ZERO.setScale(2)
                : ValidacaoLancamento.valorNaoNegativo(dados.getValorAcumulado()));
        return metaRepository.save(nova);
    }

    @Transactional
    public Meta atualizar(Long id, Meta dados) {
        Meta existente = buscarPorId(id);
        preencher(existente, dados);
        if (dados.getValorAcumulado() != null) {
            existente.setValorAcumulado(ValidacaoLancamento.valorNaoNegativo(dados.getValorAcumulado()));
        }
        return metaRepository.save(existente);
    }

    @Transactional
    public Meta registrarProgresso(Long id, BigDecimal valor) {
        Meta meta = buscarPorId(id);
        meta.registrarProgresso(ValidacaoLancamento.valorPositivo(valor));
        return metaRepository.save(meta);
    }

    @Transactional
    public void excluir(Long id) {
        metaRepository.delete(buscarPorId(id));
    }

    private void preencher(Meta destino, Meta dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setDescricao(ValidacaoLancamento.textoObrigatorio(dados.getDescricao(), "A descrição da meta", 100));
        destino.setValorAlvo(ValidacaoLancamento.valorPositivo(dados.getValorAlvo()));
        destino.setDataLimite(ValidacaoLancamento.dataObrigatoria(dados.getDataLimite()));
    }
}