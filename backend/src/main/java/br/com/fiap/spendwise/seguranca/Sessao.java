package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.model.enums.Papel;

/** Quem esta chamando a API: o usuario do token e o papel que ele tem agora no banco. */
public record Sessao(Long idUsuario, Papel papel) {

    public boolean ehMaster() {
        return papel == Papel.MASTER;
    }

    public boolean ehDono(Long idDono) {
        return idUsuario != null && idUsuario.equals(idDono);
    }
}