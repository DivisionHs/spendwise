package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.model.Divida;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras da divida: usuario existente, valor maior que zero, vencimento e descricao
 * obrigatorios. Pagamento parcial (Fase 5): abate do valor e, se cobrir tudo, quita a divida.
 */
@Service
public class DividaService {

    private final DividaRepository dividaRepository;
    private final UsuarioRepository usuarioRepository;

    public DividaService(DividaRepository dividaRepository, UsuarioRepository usuarioRepository) {
        this.dividaRepository = dividaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Divida> listar(Long idUsuario) {
        return idUsuario != null
                ? dividaRepository.findByUsuarioIdUsuarioOrderByVencimentoAsc(idUsuario)
                : dividaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Divida buscarPorId(Long id) {
        return dividaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Dívida " + id + " não encontrada."));
    }

    @Transactional
    public Divida criar(Divida dados) {
        Divida nova = new Divida();
        preencher(nova, dados);
        return dividaRepository.save(nova);
    }

    @Transactional
    public Divida atualizar(Long id, Divida dados) {
        Divida existente = buscarPorId(id);
        preencher(existente, dados);
        return dividaRepository.save(existente);
    }

    @Transactional
    public Divida pagar(Long id, BigDecimal valorPago) {
        Divida divida = buscarPorId(id);
        if (divida.isQuitada()) {
            throw new RegraNegocioException("Esta dívida ja está quitada.");
        }
        divida.pagarParcial(ValidacaoLancamento.valorPositivo(valorPago));
        return dividaRepository.save(divida);
    }

    @Transactional
    public void excluir(Long id) {
        dividaRepository.delete(buscarPorId(id));
    }

    private void preencher(Divida destino, Divida dados) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setValor(ValidacaoLancamento.valorPositivo(dados.getValor()));
        destino.setVencimento(ValidacaoLancamento.dataObrigatoria(dados.getVencimento()));
        destino.setDescricao(ValidacaoLancamento.descricaoObrigatoria(dados.getDescricao()));
    }
}