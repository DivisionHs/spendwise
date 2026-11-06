package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.model.Usuario;

/** Registro que pertence a um usuario (receita, despesa, divida, meta, conta, orcamento, investimento). */
public interface ComDono {

    Usuario getUsuario();
}