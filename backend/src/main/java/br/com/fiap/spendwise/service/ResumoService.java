package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.dto.ResumoFinanceiro;
import br.com.fiap.spendwise.model.Conta;
import br.com.fiap.spendwise.model.Divida;
import br.com.fiap.spendwise.model.Transacao;
import br.com.fiap.spendwise.repository.ContaRepository;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Totais da pagina inicial. O saldo usa o polimorfismo de Transacao (Fase 5): cada receita e
 * despesa informa seu proprio efeito, e o servico soma tudo sem saber qual e qual.
 */
@Service
public class ResumoService {

    private final UsuarioService usuarioService;
    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final InvestimentoRepository investimentoRepository;
    private final ContaRepository contaRepository;
    private final DividaRepository dividaRepository;

    public ResumoService(UsuarioService usuarioService,
                         ReceitaRepository receitaRepository,
                         DespesaRepository despesaRepository,
                         InvestimentoRepository investimentoRepository,
                         ContaRepository contaRepository,
                         DividaRepository dividaRepository) {
        this.usuarioService = usuarioService;
        this.receitaRepository = receitaRepository;
        this.despesaRepository = despesaRepository;
        this.investimentoRepository = investimentoRepository;
        this.contaRepository = contaRepository;
        this.dividaRepository = dividaRepository;
    }

    @Transactional(readOnly = true)
    public ResumoFinanceiro resumir(Long idUsuario) {
        usuarioService.buscarPorId(idUsuario); // 404 se o usuario nao existir

        List<Transacao> transacoes = new ArrayList<>();
        transacoes.addAll(receitaRepository.findByUsuarioIdUsuarioOrderByDataDesc(idUsuario));
        transacoes.addAll(despesaRepository.findByUsuarioIdUsuarioOrderByDataDesc(idUsuario));
        BigDecimal saldoDasTransacoes = transacoes.stream()
                .map(Transacao::efeitoNoSaldo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal receitas = receitaRepository.somarPorUsuario(idUsuario);
        BigDecimal despesas = despesaRepository.somarPorUsuario(idUsuario);
        BigDecimal investido = investimentoRepository.somarPorUsuario(idUsuario);
        BigDecimal saldoContas = contaRepository.findByUsuarioIdUsuarioOrderByIdContaAsc(idUsuario).stream()
                .map(Conta::getSaldo).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal dividas = dividaRepository.findByUsuarioIdUsuarioOrderByVencimentoAsc(idUsuario).stream()
                .map(Divida::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ResumoFinanceiro(receitas, despesas, investido, saldoDasTransacoes.subtract(investido),
                saldoContas, dividas);
    }
}