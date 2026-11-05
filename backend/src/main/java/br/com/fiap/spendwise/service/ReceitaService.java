package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.model.Receita;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de negocio da receita: usuario existente, valor maior que zero,
 * descricao obrigatoria e data informada. Mantem o saldo da conta em dia.
 */
@Service
public class ReceitaService {

    private final ReceitaRepository receitaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SaldoService saldoService;

    public ReceitaService(ReceitaRepository receitaRepository, UsuarioRepository usuarioRepository,
                          SaldoService saldoService) {
        this.receitaRepository = receitaRepository;
        this.usuarioRepository = usuarioRepository;
        this.saldoService = saldoService;
    }

    @Transactional(readOnly = true)
    public List<Receita> listar(Long idUsuario) {
        if (idUsuario != null) {
            return receitaRepository.findByUsuarioIdUsuarioOrderByDataDesc(idUsuario);
        }
        return receitaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Receita buscarPorId(Long id) {
        return receitaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Receita " + id + " não encontrada."));
    }

    @Transactional
    public Receita criar(Receita dados) {
        Receita nova = new Receita();
        preencher(nova, dados);
        Receita salva = receitaRepository.save(nova);
        saldoService.aplicar(salva);
        return salva;
    }

    @Transactional
    public Receita atualizar(Long id, Receita dados) {
        Receita existente = buscarPorId(id);
        Long usuarioAntigo = existente.getUsuario().getIdUsuario();
        BigDecimal efeitoAntigo = existente.efeitoNoSaldo();
        preencher(existente, dados);
        Receita salva = receitaRepository.save(existente);
        saldoService.reverter(usuarioAntigo, efeitoAntigo);
        saldoService.aplicar(salva);
        return salva;
    }

    @Transactional
    public void excluir(Long id) {
        Receita existente = buscarPorId(id);
        saldoService.reverter(existente.getUsuario().getIdUsuario(), existente.efeitoNoSaldo());
        receitaRepository.delete(existente);
    }

    private void preencher(Receita destino, Receita dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setValor(ValidacaoLancamento.valorPositivo(dados.getValor()));
        destino.setData(ValidacaoLancamento.dataObrigatoria(dados.getData()));
        destino.setDescricao(ValidacaoLancamento.descricaoObrigatoria(dados.getDescricao()));
    }
}