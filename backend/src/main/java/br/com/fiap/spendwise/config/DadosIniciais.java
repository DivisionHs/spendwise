package br.com.fiap.spendwise.config;

import br.com.fiap.spendwise.model.CategoriaInvestimento;
import br.com.fiap.spendwise.model.Conta;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.model.Divida;
import br.com.fiap.spendwise.model.Investimento;
import br.com.fiap.spendwise.model.Meta;
import br.com.fiap.spendwise.model.Orcamento;
import br.com.fiap.spendwise.model.Receita;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.model.enums.TipoConta;
import br.com.fiap.spendwise.repository.CategoriaInvestimentoRepository;
import br.com.fiap.spendwise.repository.ContaRepository;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import br.com.fiap.spendwise.repository.MetaRepository;
import br.com.fiap.spendwise.repository.OrcamentoRepository;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import br.com.fiap.spendwise.service.SenhaUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Ao subir, garante o usuario de teste do README, com seis meses de lancamentos de exemplo
 * (para os graficos do frontend terem o que mostrar), conta bancaria, orcamentos, dividas e
 * metas, alem das categorias de investimento padrao. Roda so quando falta: se o usuario ja
 * existe, ou se a tabela de categorias ja tem registros, nao mexe em nada.
 */
@Component
public class DadosIniciais implements CommandLineRunner {

    public static final String EMAIL_TESTE = "teste@spendwise.com";
    public static final String SENHA_TESTE = "Teste@123";

    private static final Logger log = LoggerFactory.getLogger(DadosIniciais.class);

    // Valores por mes, do mais antigo (5 meses atras) ao mes atual.
    private static final double[] FREELANCE = {0, 900, 650, 1200, 850, 0};
    private static final double[] MERCADO = {780, 850, 720, 910, 420, 210};
    private static final double[] TRANSPORTE = {260, 310, 240, 290, 275, 85};
    private static final double[] LAZER = {340, 520, 280, 460, 390, 0};
    private static final double[] RESTAURANTES = {410, 380, 450, 520, 430, 0};
    private static final double[] SAUDE = {0, 180, 0, 260, 0, 0};
    private static final double[] ENERGIA = {210, 230, 245, 220, 238, 0};
    private static final double[] CURSO = {0, 150, 0, 150, 150, 0};

    // Aportes: {indice da categoria, valor, dia do mes}
    private static final double[][][] APORTES = {
            {{0, 500, 12}},
            {{0, 600, 12}, {1, 300, 20}},
            {{0, 600, 12}, {2, 250, 20}},
            {{0, 700, 12}, {1, 350, 20}, {2, 150, 25}},
            {{0, 600, 12}, {1, 400, 20}},
            {},
    };

    private final UsuarioRepository usuarioRepository;
    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final CategoriaInvestimentoRepository categoriaRepository;
    private final InvestimentoRepository investimentoRepository;
    private final ContaRepository contaRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final DividaRepository dividaRepository;
    private final MetaRepository metaRepository;

    public DadosIniciais(UsuarioRepository usuarioRepository,
                         ReceitaRepository receitaRepository,
                         DespesaRepository despesaRepository,
                         CategoriaInvestimentoRepository categoriaRepository,
                         InvestimentoRepository investimentoRepository,
                         ContaRepository contaRepository,
                         OrcamentoRepository orcamentoRepository,
                         DividaRepository dividaRepository,
                         MetaRepository metaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.receitaRepository = receitaRepository;
        this.despesaRepository = despesaRepository;
        this.categoriaRepository = categoriaRepository;
        this.investimentoRepository = investimentoRepository;
        this.contaRepository = contaRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.dividaRepository = dividaRepository;
        this.metaRepository = metaRepository;
    }

    @Override
    public void run(String... args) {
        // Os dados de exemplo sao um conforto, nao um requisito: se algo falhar aqui,
        // a API continua subindo normalmente.
        try {
            semear();
        } catch (RuntimeException e) {
            log.warn("Nao foi possivel criar os dados de exemplo: {}", e.getMessage());
        }
    }

    private void semear() {
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(new CategoriaInvestimento("Renda Fixa", "BAIXO"));
            categoriaRepository.save(new CategoriaInvestimento("Fundos Imobiliários", "MODERADO"));
            categoriaRepository.save(new CategoriaInvestimento("Ações", "ALTO"));
            log.info("Categorias de investimento padrao criadas.");
        }

        if (usuarioRepository.existsByEmailIgnoreCase(EMAIL_TESTE)) {
            return;
        }

        Usuario teste = usuarioRepository.save(
                new Usuario("Usuario de Teste", EMAIL_TESTE, SenhaUtil.gerarHash(SENHA_TESTE), "01310100"));

        LocalDate hoje = LocalDate.now();
        List<CategoriaInvestimento> categorias = categoriaRepository.findAll();
        BigDecimal saldo = BigDecimal.ZERO;

        for (int i = 0; i < 6; i++) {
            LocalDate primeiroDia = hoje.withDayOfMonth(1).minusMonths(5 - i);

            saldo = saldo.add(receita(teste, 5200, dia(primeiroDia, 5, hoje), "Salário"));
            saldo = saldo.add(receita(teste, FREELANCE[i], dia(primeiroDia, 20, hoje), "Projeto freelance"));

            saldo = saldo.subtract(despesa(teste, 1800, dia(primeiroDia, 10, hoje), "Aluguel", CategoriaDespesa.MORADIA));
            saldo = saldo.subtract(despesa(teste, MERCADO[i], dia(primeiroDia, 12, hoje), "Supermercado", CategoriaDespesa.ALIMENTACAO));
            saldo = saldo.subtract(despesa(teste, TRANSPORTE[i], dia(primeiroDia, 8, hoje), "Transporte", CategoriaDespesa.TRANSPORTE));
            saldo = saldo.subtract(despesa(teste, LAZER[i], dia(primeiroDia, 15, hoje), "Lazer", CategoriaDespesa.LAZER));
            saldo = saldo.subtract(despesa(teste, RESTAURANTES[i], dia(primeiroDia, 18, hoje), "Restaurantes", CategoriaDespesa.ALIMENTACAO));
            saldo = saldo.subtract(despesa(teste, SAUDE[i], dia(primeiroDia, 22, hoje), "Saúde", CategoriaDespesa.SAUDE));
            saldo = saldo.subtract(despesa(teste, ENERGIA[i], dia(primeiroDia, 25, hoje), "Energia e água", CategoriaDespesa.MORADIA));
            saldo = saldo.subtract(despesa(teste, 129.90, dia(primeiroDia, 2, hoje), "Internet e celular", CategoriaDespesa.MORADIA));
            saldo = saldo.subtract(despesa(teste, CURSO[i], dia(primeiroDia, 6, hoje), "Curso online", CategoriaDespesa.EDUCACAO));

            for (double[] aporte : APORTES[i]) {
                CategoriaInvestimento categoria = categorias.get((int) aporte[0] % categorias.size());
                investimento(teste, categoria, aporte[1], dia(primeiroDia, (int) aporte[2], hoje));
            }
        }

        // Conta bancaria (Fase 6): o saldo reflete o que as receitas e despesas ja movimentaram
        conta(teste, "Banco do Brasil", "1234-5", "98765-4", TipoConta.CORRENTE, saldo);
        conta(teste, "Caixa Economica Federal", "0001", "12345-6", TipoConta.POUPANCA, new BigDecimal("2500.00"));

        // Orcamentos (US03): limites mensais por categoria
        orcamento(teste, CategoriaDespesa.MORADIA, "2300.00");
        orcamento(teste, CategoriaDespesa.ALIMENTACAO, "230.00");
        orcamento(teste, CategoriaDespesa.TRANSPORTE, "100.00");
        orcamento(teste, CategoriaDespesa.LAZER, "400.00");
        orcamento(teste, CategoriaDespesa.SAUDE, "300.00");
        orcamento(teste, CategoriaDespesa.EDUCACAO, "200.00");

        // Dividas e metas, com os mesmos exemplos da Fase 5
        divida(teste, "Cartao de credito", "700.00", hoje.plusDays(4));
        divida(teste, "Financiamento do notebook", "2400.00", hoje.plusDays(40));
        meta(teste, "Reserva de emergencia", "5000.00", "1200.00", LocalDate.of(hoje.getYear() + (hoje.getMonthValue() == 12 ? 1 : 0), 12, 31));
        meta(teste, "Viagem de fim de ano", "3000.00", "450.00", hoje.plusDays(25));

        log.info("Usuario de teste ({}) criado com seis meses de lancamentos e cadastros de exemplo.", EMAIL_TESTE);
    }

    /** Dia do mes pedido (limitado ao tamanho do mes); null se cair depois de hoje. */
    private LocalDate dia(LocalDate primeiroDia, int diaDoMes, LocalDate hoje) {
        LocalDate data = primeiroDia.withDayOfMonth(Math.min(diaDoMes, primeiroDia.lengthOfMonth()));
        return data.isAfter(hoje) ? null : data;
    }

    /** Cria a receita (se o valor e a data fazem sentido) e devolve o efeito dela no saldo. */
    private BigDecimal receita(Usuario usuario, double valor, LocalDate data, String descricao) {
        if (valor <= 0 || data == null) {
            return BigDecimal.ZERO;
        }
        Receita r = new Receita();
        r.setUsuario(usuario);
        r.setValor(BigDecimal.valueOf(valor));
        r.setData(data);
        r.setDescricao(descricao);
        receitaRepository.save(r);
        return r.efeitoNoSaldo();
    }

    /** Cria a despesa e devolve o valor dela (para o saldo subtrair). */
    private BigDecimal despesa(Usuario usuario, double valor, LocalDate data, String descricao, CategoriaDespesa categoria) {
        if (valor <= 0 || data == null) {
            return BigDecimal.ZERO;
        }
        Despesa d = new Despesa();
        d.setUsuario(usuario);
        d.setValor(BigDecimal.valueOf(valor));
        d.setData(data);
        d.setDescricao(descricao);
        d.setCategoria(categoria);
        despesaRepository.save(d);
        return d.getValor();
    }

    private void investimento(Usuario usuario, CategoriaInvestimento categoria, double valor, LocalDate data) {
        if (valor <= 0 || data == null) {
            return;
        }
        Investimento inv = new Investimento();
        inv.setUsuario(usuario);
        inv.setCategoria(categoria);
        inv.setValorInvestido(BigDecimal.valueOf(valor));
        inv.setData(data);
        investimentoRepository.save(inv);
    }

    private void conta(Usuario usuario, String banco, String agencia, String numero, TipoConta tipo, BigDecimal saldo) {
        Conta c = new Conta();
        c.setUsuario(usuario);
        c.setBanco(banco);
        c.setAgencia(agencia);
        c.setNumeroConta(numero);
        c.setTipo(tipo);
        c.setSaldo(saldo.setScale(2));
        contaRepository.save(c);
    }

    private void orcamento(Usuario usuario, CategoriaDespesa categoria, String limite) {
        Orcamento o = new Orcamento();
        o.setUsuario(usuario);
        o.setCategoria(categoria);
        o.setLimite(new BigDecimal(limite));
        orcamentoRepository.save(o);
    }

    private void divida(Usuario usuario, String descricao, String valor, LocalDate vencimento) {
        Divida d = new Divida();
        d.setUsuario(usuario);
        d.setDescricao(descricao);
        d.setValor(new BigDecimal(valor));
        d.setVencimento(vencimento);
        dividaRepository.save(d);
    }

    private void meta(Usuario usuario, String descricao, String alvo, String acumulado, LocalDate limite) {
        Meta m = new Meta();
        m.setUsuario(usuario);
        m.setDescricao(descricao);
        m.setValorAlvo(new BigDecimal(alvo));
        m.setValorAcumulado(new BigDecimal(acumulado));
        m.setDataLimite(limite);
        metaRepository.save(m);
    }
}
