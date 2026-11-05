package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.dto.Alerta;
import br.com.fiap.spendwise.dto.AlertasEInsights;
import br.com.fiap.spendwise.dto.Insight;
import br.com.fiap.spendwise.dto.OrcamentoStatus;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.model.Despesa;
import br.com.fiap.spendwise.model.Divida;
import br.com.fiap.spendwise.model.Meta;
import br.com.fiap.spendwise.model.Receita;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.MetaRepository;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tela "Alertas e Insights" (Fase 2): alertas e observacoes geradas por regras simples sobre
 * os dados do usuario. Alertas: orcamento proximo ou acima do limite (US03), categoria que
 * cresceu em relacao a media dos tres meses anteriores, divida vencida ou a vencer e meta
 * com prazo perto. Insights: categoria que mais pesa, percentual da renda poupado, economia
 * possivel em Lazer e progresso das metas. Descreve os numeros; não é recomendacao financeira.
 */
@Service
public class AnaliseService {

    private static final BigDecimal CRESCIMENTO_MINIMO = new BigDecimal("1.12");
    private static final DateTimeFormatter MES = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final NumberFormat MOEDA = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

    private final UsuarioRepository usuarioRepository;
    private final DespesaRepository despesaRepository;
    private final ReceitaRepository receitaRepository;
    private final DividaRepository dividaRepository;
    private final MetaRepository metaRepository;
    private final OrcamentoService orcamentoService;

    public AnaliseService(UsuarioRepository usuarioRepository, DespesaRepository despesaRepository,
                          ReceitaRepository receitaRepository, DividaRepository dividaRepository,
                          MetaRepository metaRepository, OrcamentoService orcamentoService) {
        this.usuarioRepository = usuarioRepository;
        this.despesaRepository = despesaRepository;
        this.receitaRepository = receitaRepository;
        this.dividaRepository = dividaRepository;
        this.metaRepository = metaRepository;
        this.orcamentoService = orcamentoService;
    }

    @Transactional(readOnly = true)
    public AlertasEInsights analisar(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RecursoNaoEncontradoException("Usuário " + idUsuario + " não encontrado.");
        }
        LocalDate hoje = LocalDate.now();
        YearMonth ultimoMes = YearMonth.from(hoje).minusMonths(1); // o mes atual ainda esta em andamento

        List<Alerta> alertas = new ArrayList<>();
        alertasDeOrcamento(idUsuario, alertas);
        alertasDeCrescimento(idUsuario, ultimoMes, alertas);
        alertasDeDividas(idUsuario, hoje, alertas);
        alertasDeMetas(idUsuario, hoje, alertas);
        alertas.sort(Comparator.comparingInt(a -> peso(a.severidade())));

        List<Insight> insights = new ArrayList<>();
        insightsDoUltimoMes(idUsuario, ultimoMes, insights);
        insightsDeMetas(idUsuario, insights);
        return new AlertasEInsights(alertas, insights);
    }

    private void alertasDeOrcamento(Long idUsuario, List<Alerta> alertas) {
        for (OrcamentoStatus s : orcamentoService.status(idUsuario)) {
            String detalhe = "Você gastou " + moeda(s.gasto()) + " de " + moeda(s.limite())
                    + " planejados (" + s.percentual() + "%) neste mês.";
            switch (s.situacao()) {
                case EXCEDIDO -> alertas.add(new Alerta("CRITICO",
                        "Orçamento de " + s.rotulo() + " estourado", detalhe, s.rotulo()));
                case CRITICO -> alertas.add(new Alerta("CRITICO",
                        "Orçamento de " + s.rotulo() + " acima de 90%", detalhe, s.rotulo()));
                case ATENCAO -> alertas.add(new Alerta("ATENCAO",
                        "Gastos com " + s.rotulo() + " chegaram a " + s.percentual() + "% do limite", detalhe, s.rotulo()));
                default -> { }
            }
        }
    }

    private void alertasDeCrescimento(Long idUsuario, YearMonth ultimoMes, List<Alerta> alertas) {
        Map<CategoriaDespesa, BigDecimal> ultimo = gastosPorCategoria(idUsuario, ultimoMes);
        Map<CategoriaDespesa, BigDecimal> media = new EnumMap<>(CategoriaDespesa.class);
        for (int i = 2; i <= 4; i++) {
            gastosPorCategoria(idUsuario, ultimoMes.minusMonths(i - 1))
                    .forEach((c, v) -> media.merge(c, v, BigDecimal::add));
        }
        for (Map.Entry<CategoriaDespesa, BigDecimal> e : media.entrySet()) {
            BigDecimal mediaMensal = e.getValue().divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            BigDecimal atual = ultimo.getOrDefault(e.getKey(), BigDecimal.ZERO);
            if (mediaMensal.signum() > 0 && atual.compareTo(mediaMensal.multiply(CRESCIMENTO_MINIMO)) > 0) {
                long pct = atual.multiply(BigDecimal.valueOf(100)).divide(mediaMensal, 0, RoundingMode.HALF_UP).longValue() - 100;
                alertas.add(new Alerta("ATENCAO",
                        "Categoria " + e.getKey().getRotulo() + " cresceu " + pct + "% em relacao a media",
                        "Em " + ultimoMes.format(MES) + " foram " + moeda(atual)
                                + ", contra média de " + moeda(mediaMensal) + " nos 3 meses anteriores.",
                        e.getKey().getRotulo()));
            }
        }
    }

    private void alertasDeDividas(Long idUsuario, LocalDate hoje, List<Alerta> alertas) {
        for (Divida d : dividaRepository.findByUsuarioIdUsuarioOrderByVencimentoAsc(idUsuario)) {
            if (d.isQuitada()) {
                continue;
            }
            long dias = ChronoUnit.DAYS.between(hoje, d.getVencimento());
            if (dias < 0) {
                alertas.add(new Alerta("CRITICO", "Dívida vencida: " + d.getDescricao(),
                        "Faltam pagar " + moeda(d.getValor()) + ", vencida há " + (-dias) + " dia(s).", "Dívidas"));
            } else if (dias <= 7) {
                alertas.add(new Alerta("ATENCAO", "Dívida vence em " + dias + " dia(s): " + d.getDescricao(),
                        "Faltam pagar " + moeda(d.getValor()) + ".", "Dívidas"));
            }
        }
    }

    private void alertasDeMetas(Long idUsuario, LocalDate hoje, List<Alerta> alertas) {
        for (Meta m : metaRepository.findByUsuarioIdUsuarioOrderByDataLimiteAsc(idUsuario)) {
            long dias = ChronoUnit.DAYS.between(hoje, m.getDataLimite());
            if (!m.isAtingida() && dias >= 0 && dias <= 30) {
                alertas.add(new Alerta("INFORMATIVO", "Meta \"" + m.getDescricao() + "\" termina em " + dias + " dia(s)",
                        "Você atingiu " + m.getPercentual() + "%; faltam "
                                + moeda(m.getValorAlvo().subtract(m.getValorAcumulado())) + ".", "Metas"));
            }
        }
    }

    private void insightsDoUltimoMes(Long idUsuario, YearMonth mes, List<Insight> insights) {
        Map<CategoriaDespesa, BigDecimal> gastos = gastosPorCategoria(idUsuario, mes);
        BigDecimal totalDespesas = gastos.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalReceitas = receitaRepository
                .findByUsuarioIdUsuarioOrderByDataDesc(idUsuario).stream()
                .filter(r -> YearMonth.from(r.getData()).equals(mes))
                .map(Receita::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);

        gastos.entrySet().stream().max(Map.Entry.comparingByValue()).ifPresent(maior -> {
            long pct = maior.getValue().multiply(BigDecimal.valueOf(100))
                    .divide(totalDespesas, 0, RoundingMode.HALF_UP).longValue();
            insights.add(new Insight(maior.getKey().getRotulo() + " concentra " + pct + "% das despesas",
                    "Em " + mes.format(MES) + ", " + moeda(maior.getValue()) + " de um total de " + moeda(totalDespesas) + ".")); 
        });
        if (totalReceitas.signum() > 0) {
            BigDecimal sobra = totalReceitas.subtract(totalDespesas);
            long pct = sobra.multiply(BigDecimal.valueOf(100)).divide(totalReceitas, 0, RoundingMode.HALF_UP).longValue();
            insights.add(sobra.signum() >= 0
                    ? new Insight("Você guardou " + pct + "% da renda em " + mes.format(MES),
                            "Entraram " + moeda(totalReceitas) + " e saíram " + moeda(totalDespesas) + " em despesas.")
                    : new Insight("As despesas passaram da renda em " + mes.format(MES),
                            "Entraram " + moeda(totalReceitas) + " e saíram " + moeda(totalDespesas) + " em despesas."));
        }
        BigDecimal lazer = gastos.getOrDefault(CategoriaDespesa.LAZER, BigDecimal.ZERO);
        if (lazer.signum() > 0) {
            insights.add(new Insight("Economia possível em Lazer",
                    "Cada 10% a menos em Lazer (" + moeda(lazer) + " em " + mes.format(MES) + ") libera "
                            + moeda(lazer.multiply(new BigDecimal("0.10"))) + " por mês."));
        }
    }

    private void insightsDeMetas(Long idUsuario, List<Insight> insights) {
        for (Meta m : metaRepository.findByUsuarioIdUsuarioOrderByDataLimiteAsc(idUsuario)) {
            insights.add(new Insight("Meta \"" + m.getDescricao() + "\": " + m.getPercentual() + "% atingida",
                    moeda(m.getValorAcumulado()) + " de " + moeda(m.getValorAlvo()) + ", prazo " + m.getDataLimite() + "."));
        }
    }

    private Map<CategoriaDespesa, BigDecimal> gastosPorCategoria(Long idUsuario, YearMonth mes) {
        Map<CategoriaDespesa, BigDecimal> mapa = new EnumMap<>(CategoriaDespesa.class);
        for (Despesa d : despesaRepository.findByUsuarioIdUsuarioAndDataBetween(idUsuario, mes.atDay(1), mes.atEndOfMonth())) {
            mapa.merge(d.getCategoria(), d.getValor(), BigDecimal::add);
        }
        return mapa;
    }

    private static int peso(String severidade) {
        return switch (severidade) {
            case "CRITICO" -> 0;
            case "ATENCAO" -> 1;
            default -> 2;
        };
    }

    private static String moeda(BigDecimal valor) {
        return MOEDA.format(valor).replace('\u00a0', ' ');
    }
}