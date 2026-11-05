package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.model.Conta;
import br.com.fiap.spendwise.model.Transacao;
import br.com.fiap.spendwise.model.enums.TipoConta;
import br.com.fiap.spendwise.repository.ContaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Mantem o saldo da conta do usuario em dia quando uma receita ou despesa e criada,
 * alterada ou excluida (pos-condicao do caso de uso "Registrar Despesa": saldo atualizado).
 * Usa o polimorfismo de Transacao: cada tipo sabe seu efeito no saldo. Quem nao tem conta
 * cadastrada continua registrando normalmente; so nao ha saldo para atualizar.
 */
@Service
public class SaldoService {

    private final ContaRepository contaRepository;

    public SaldoService(ContaRepository contaRepository) {
        this.contaRepository = contaRepository;
    }

    /** Conta que recebe os lancamentos: a primeira conta corrente; se nao houver, a primeira conta. */
    public Optional<Conta> contaPrincipal(Long idUsuario) {
        List<Conta> contas = contaRepository.findByUsuarioIdUsuarioOrderByIdContaAsc(idUsuario);
        return contas.stream().filter(c -> c.getTipo() == TipoConta.CORRENTE).findFirst()
                .or(() -> contas.stream().findFirst());
    }

    /** Aplica o efeito da transacao no saldo da conta principal do usuario dela. */
    public void aplicar(Transacao transacao) {
        contaPrincipal(transacao.getUsuario().getIdUsuario()).ifPresent(conta -> {
            transacao.aplicarNoSaldo(conta);
            contaRepository.save(conta);
        });
    }

    /** Desfaz um efeito antigo (usado ao alterar ou excluir um lancamento). */
    public void reverter(Long idUsuario, BigDecimal efeitoAntigo) {
        contaPrincipal(idUsuario).ifPresent(conta -> {
            conta.atualizarSaldo(efeitoAntigo.negate());
            contaRepository.save(conta);
        });
    }
}