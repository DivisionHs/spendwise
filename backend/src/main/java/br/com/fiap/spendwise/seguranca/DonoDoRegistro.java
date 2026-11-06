package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.repository.ContaRepository;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import br.com.fiap.spendwise.repository.MetaRepository;
import br.com.fiap.spendwise.repository.OrcamentoRepository;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Descobre de quem e um registro (pelo recurso da URL e pelo id), para checar se o chamador e o dono. */
@Component
public class DonoDoRegistro {

    private final Map<String, Function<Long, Optional<Long>>> busca;

    public DonoDoRegistro(ReceitaRepository receitas, DespesaRepository despesas, DividaRepository dividas,
                          MetaRepository metas, ContaRepository contas, OrcamentoRepository orcamentos,
                          InvestimentoRepository investimentos) {
        this.busca = Map.of(
                "receitas", id -> receitas.findById(id).map(r -> r.getUsuario().getIdUsuario()),
                "despesas", id -> despesas.findById(id).map(d -> d.getUsuario().getIdUsuario()),
                "dividas", id -> dividas.findById(id).map(d -> d.getUsuario().getIdUsuario()),
                "metas", id -> metas.findById(id).map(m -> m.getUsuario().getIdUsuario()),
                "contas", id -> contas.findById(id).map(c -> c.getUsuario().getIdUsuario()),
                "orcamentos", id -> orcamentos.findById(id).map(o -> o.getUsuario().getIdUsuario()),
                "investimentos", id -> investimentos.findById(id).map(i -> i.getUsuario().getIdUsuario()));
    }

    public boolean recursoComDono(String recurso) {
        return busca.containsKey(recurso);
    }

    /** Id do dono, ou vazio se o registro nao existe (ai o controller responde 404). */
    @Transactional(readOnly = true)
    public Optional<Long> de(String recurso, Long id) {
        return busca.get(recurso).apply(id);
    }
}