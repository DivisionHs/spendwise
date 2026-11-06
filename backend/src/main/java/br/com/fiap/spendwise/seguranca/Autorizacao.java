package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.exception.AcessoNegadoException;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Regras de quem pode o que, aplicadas a cada chamada (depois de o token ser aceito).
 *
 *  - Usuarios: lista so o MASTER; ver ou editar um usuario, so ele mesmo ou o MASTER; excluir, so o MASTER.
 *  - Categorias de investimento (compartilhadas): qualquer logado consulta; so o MASTER altera.
 *  - Registros com dono (receitas, despesas, dividas, metas, contas, orcamentos, investimentos):
 *    cada um so enxerga e mexe no que e seu; o MASTER enxerga tudo. Lista sem ?idUsuario= e so do MASTER.
 *  - Resumo e analise: so os do proprio usuario (ou do MASTER).
 */
@Component
public class Autorizacao {

    private static final String PREFIXO = "/api/";

    private final DonoDoRegistro donos;

    public Autorizacao(DonoDoRegistro donos) {
        this.donos = donos;
    }

    public void verificar(Sessao sessao, String metodo, String caminho, String idUsuarioParam) {
        String limpo = caminho.startsWith(PREFIXO) ? caminho.substring(PREFIXO.length()) : caminho;
        if (limpo.endsWith("/")) {
            limpo = limpo.substring(0, limpo.length() - 1);
        }
        String[] partes = limpo.isEmpty() ? new String[0] : limpo.split("/");
        if (partes.length == 0) {
            throw negado();
        }
        String recurso = partes[0];
        boolean leitura = "GET".equalsIgnoreCase(metodo);

        switch (recurso) {
            case "usuarios" -> verificarUsuarios(sessao, metodo, partes);
            case "resumo", "analise" -> {
                if (partes.length < 2) {
                    throw negado();
                }
                exigirEuOuMaster(sessao, partes[1]);
            }
            case "categorias-investimento" -> {
                if (!leitura && !sessao.ehMaster()) {
                    throw new AcessoNegadoException("Só o administrador altera as categorias de investimento.");
                }
            }
            default -> {
                if (!donos.recursoComDono(recurso)) {
                    throw negado();
                }
                verificarRegistroComDono(sessao, recurso, partes, leitura, idUsuarioParam);
            }
        }
    }

    private void verificarUsuarios(Sessao sessao, String metodo, String[] partes) {
        boolean leitura = "GET".equalsIgnoreCase(metodo);
        if (partes.length == 1) { // /api/usuarios
            if (leitura && !sessao.ehMaster()) {
                throw new AcessoNegadoException("Só o administrador vê a lista de usuários.");
            }
            return;
        }
        if ("DELETE".equalsIgnoreCase(metodo)) {
            if (!sessao.ehMaster()) {
                throw new AcessoNegadoException("Só o administrador exclui usuários.");
            }
            return;
        }
        exigirEuOuMaster(sessao, partes[1]);
    }

    private void verificarRegistroComDono(Sessao sessao, String recurso, String[] partes,
                                          boolean leitura, String idUsuarioParam) {
        boolean colecao = partes.length == 1 || (partes.length == 2 && "status".equals(partes[1]));
        if (colecao) {
            if (!leitura) {
                return; // POST: o dono e conferido no corpo da requisicao (DonoNoCorpoAdvice)
            }
            if (idUsuarioParam == null || idUsuarioParam.isBlank()) {
                if (!sessao.ehMaster()) {
                    throw negado();
                }
                return;
            }
            exigirEuOuMaster(sessao, idUsuarioParam);
            return;
        }
        Long id = numero(partes[1]);
        if (id == null) {
            return; // id invalido: o controller responde 400
        }
        Optional<Long> dono = donos.de(recurso, id);
        if (dono.isPresent() && !sessao.ehMaster() && !sessao.ehDono(dono.get())) {
            throw negado();
        }
    }

    private void exigirEuOuMaster(Sessao sessao, String idTexto) {
        Long id = numero(idTexto);
        if (id == null || (!sessao.ehMaster() && !sessao.ehDono(id))) {
            throw negado();
        }
    }

    private Long numero(String texto) {
        try {
            return Long.valueOf(texto);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private AcessoNegadoException negado() {
        return new AcessoNegadoException("Você não tem permissão para acessar este recurso.");
    }
}