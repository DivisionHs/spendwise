package br.com.fiap.spendwise.seguranca;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.fiap.spendwise.exception.AcessoNegadoException;
import br.com.fiap.spendwise.model.enums.Papel;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Regras de quem pode o que: usuario comum, dono do registro e MASTER. */
class AutorizacaoTest {

    private final DonoDoRegistro donos = mock(DonoDoRegistro.class);
    private final Autorizacao autorizacao = new Autorizacao(donos);
    private final Sessao ana = new Sessao(1L, Papel.USUARIO);
    private final Sessao master = new Sessao(99L, Papel.MASTER);

    @BeforeEach
    void preparar() {
        when(donos.recursoComDono("receitas")).thenReturn(true);
        when(donos.recursoComDono("contas")).thenReturn(true);
        when(donos.de("receitas", 10L)).thenReturn(Optional.of(1L));   // receita 10 e da Ana
        when(donos.de("receitas", 20L)).thenReturn(Optional.of(2L));   // receita 20 e de outra pessoa
        when(donos.de("receitas", 30L)).thenReturn(Optional.empty());  // nao existe
    }

    private void chamar(Sessao s, String metodo, String caminho, String idUsuario) {
        autorizacao.verificar(s, metodo, caminho, idUsuario);
    }

    @Test
    void usuarioComumNaoVeAListaDeUsuarios() {
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/usuarios", null));
        assertDoesNotThrow(() -> chamar(master, "GET", "/api/usuarios", null));
    }

    @Test
    void usuarioVeEEditaSoOProprioPerfil() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/usuarios/1", null));
        assertDoesNotThrow(() -> chamar(ana, "PUT", "/api/usuarios/1", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/usuarios/2", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "PUT", "/api/usuarios/2", null));
        assertDoesNotThrow(() -> chamar(master, "PUT", "/api/usuarios/2", null));
    }

    @Test
    void soOMasterExcluiUsuarios() {
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "DELETE", "/api/usuarios/1", null));
        assertDoesNotThrow(() -> chamar(master, "DELETE", "/api/usuarios/1", null));
    }

    @Test
    void listaDeRegistrosExigeIdDoProprioUsuario() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/receitas", "1"));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/receitas", "2"));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/receitas", null));
        assertDoesNotThrow(() -> chamar(master, "GET", "/api/receitas", null));
        assertDoesNotThrow(() -> chamar(master, "GET", "/api/receitas", "2"));
    }

    @Test
    void registroDeOutraPessoaNaoPodeSerLidoNemAlteradoNemExcluido() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/receitas/10", null));
        assertDoesNotThrow(() -> chamar(ana, "DELETE", "/api/receitas/10", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/receitas/20", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "PUT", "/api/receitas/20", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "DELETE", "/api/receitas/20", null));
        assertDoesNotThrow(() -> chamar(master, "DELETE", "/api/receitas/20", null));
    }

    @Test
    void registroInexistenteDeixaOControllerResponder404() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/receitas/30", null));
    }

    @Test
    void criarRegistroLiberaAquiEOCorpoEConferidoDepois() {
        assertDoesNotThrow(() -> chamar(ana, "POST", "/api/receitas", null));
    }

    @Test
    void categoriasSaoDeLeituraParaTodosEAlteracaoSoDoMaster() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/categorias-investimento", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "POST", "/api/categorias-investimento", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "DELETE", "/api/categorias-investimento/1", null));
        assertDoesNotThrow(() -> chamar(master, "POST", "/api/categorias-investimento", null));
    }

    @Test
    void resumoEAnaliseSaoDoProprioUsuario() {
        assertDoesNotThrow(() -> chamar(ana, "GET", "/api/resumo/1", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/resumo/2", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/analise/2", null));
        assertDoesNotThrow(() -> chamar(master, "GET", "/api/analise/2", null));
    }

    @Test
    void recursoDesconhecidoENegado() {
        assertThrows(AcessoNegadoException.class, () -> chamar(ana, "GET", "/api/qualquer-coisa", null));
        assertThrows(AcessoNegadoException.class, () -> chamar(master, "GET", "/api/qualquer-coisa", null));
    }
}