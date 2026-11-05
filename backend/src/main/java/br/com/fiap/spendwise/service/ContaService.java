package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.model.Conta;
import br.com.fiap.spendwise.repository.ContaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras da conta bancaria (Fase 6): usuario existente, banco, agencia e numero da conta
 * obrigatorios, tipo CORRENTE ou POUPANCA e saldo que nao seja negativo no cadastro.
 */
@Service
public class ContaService {

    private final ContaRepository contaRepository;
    private final UsuarioRepository usuarioRepository;

    public ContaService(ContaRepository contaRepository, UsuarioRepository usuarioRepository) {
        this.contaRepository = contaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Conta> listar(Long idUsuario) {
        return idUsuario != null
                ? contaRepository.findByUsuarioIdUsuarioOrderByIdContaAsc(idUsuario)
                : contaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Conta buscarPorId(Long id) {
        return contaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta " + id + " não encontrada."));
    }

    @Transactional
    public Conta criar(Conta dados) {
        Conta nova = new Conta();
        preencher(nova, dados, true);
        return contaRepository.save(nova);
    }

    @Transactional
    public Conta atualizar(Long id, Conta dados) {
        Conta existente = buscarPorId(id);
        // O saldo ja foi movimentado pelos lancamentos: pode ficar negativo (conta no vermelho)
        preencher(existente, dados, false);
        return contaRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        contaRepository.delete(buscarPorId(id));
    }

    private void preencher(Conta destino, Conta dados, boolean saldoNaoNegativo) {
        destino.setUsuario(ValidacaoLancamento.usuarioExistente(dados.getUsuario(), usuarioRepository));
        destino.setBanco(ValidacaoLancamento.textoObrigatorio(dados.getBanco(), "O banco", 100));
        destino.setAgencia(ValidacaoLancamento.textoObrigatorio(dados.getAgencia(), "A agência", 10));
        destino.setNumeroConta(ValidacaoLancamento.textoObrigatorio(dados.getNumeroConta(), "O número da conta", 20));
        if (dados.getTipo() == null) {
            throw new RegraNegocioException("Informe o tipo da conta: CORRENTE ou POUPANCA.");
        }
        destino.setTipo(dados.getTipo());
        if (dados.getSaldo() == null) {
            throw new RegraNegocioException("Informe o saldo da conta.");
        }
        destino.setSaldo(saldoNaoNegativo
                ? ValidacaoLancamento.valorNaoNegativo(dados.getSaldo())
                : dados.getSaldo().setScale(2, java.math.RoundingMode.HALF_UP));
    }
}