package br.com.fiap.spendwise.seguranca;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.com.fiap.spendwise.exception.NaoAutorizadoException;
import br.com.fiap.spendwise.model.Usuario;
import java.util.Base64;
import org.junit.jupiter.api.Test;

/** Token de login: assinatura, validade e rejeicao de tokens adulterados. */
class TokenServiceTest {

    private static final String SEGREDO = "um-segredo-de-teste-com-mais-de-32-caracteres!";

    private Usuario usuario(long id) {
        Usuario u = new Usuario("Ana", "ana@exemplo.com", "hash", "01310100");
        u.setIdUsuario(id);
        return u;
    }

    @Test
    void tokenGeradoEValidadoDevolveOIdDoUsuario() {
        TokenService tokens = new TokenService(SEGREDO, 1);
        assertEquals(7L, tokens.validar(tokens.gerar(usuario(7))));
    }

    @Test
    void tokenTemTresPartesSeparadasPorPonto() {
        assertEquals(3, new TokenService(SEGREDO, 1).gerar(usuario(1)).split("\\.").length);
    }

    @Test
    void assinaturaAdulteradaERejeitada() {
        TokenService tokens = new TokenService(SEGREDO, 1);
        String[] partes = tokens.gerar(usuario(7)).split("\\.");
        String adulterado = partes[0] + "." + partes[1] + "." + partes[2].substring(0, partes[2].length() - 2) + "AA";
        assertThrows(NaoAutorizadoException.class, () -> tokens.validar(adulterado));
    }

    @Test
    void dadosAlteradosComAssinaturaAntigaSaoRejeitados() {
        TokenService tokens = new TokenService(SEGREDO, 1);
        String[] partes = tokens.gerar(usuario(7)).split("\\.");
        String dadosFalsos = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"sub\":\"1\",\"papel\":\"MASTER\",\"exp\":9999999999}".getBytes());
        assertThrows(NaoAutorizadoException.class, () -> tokens.validar(partes[0] + "." + dadosFalsos + "." + partes[2]));
    }

    @Test
    void tokenAssinadoComOutroSegredoERejeitado() {
        String token = new TokenService(SEGREDO, 1).gerar(usuario(7));
        TokenService outro = new TokenService("outro-segredo-diferente-com-mais-de-32-caracteres", 1);
        assertThrows(NaoAutorizadoException.class, () -> outro.validar(token));
    }

    @Test
    void tokenExpiradoERejeitado() {
        TokenService tokens = new TokenService(SEGREDO, 0); // validade zero: expira no mesmo instante
        String token = tokens.gerar(usuario(7));
        NaoAutorizadoException erro = assertThrows(NaoAutorizadoException.class, () -> tokens.validar(token));
        assertEquals("Sua sessão expirou. Entre novamente.", erro.getMessage());
    }

    @Test
    void textoQualquerNaoViraToken() {
        TokenService tokens = new TokenService(SEGREDO, 1);
        assertThrows(NaoAutorizadoException.class, () -> tokens.validar("isto-nao-e-um-token"));
        assertThrows(NaoAutorizadoException.class, () -> tokens.validar("a.b.c"));
    }

    @Test
    void semSegredoValidoUsaSegredoTemporarioEFunciona() {
        TokenService tokens = new TokenService("curto", 1);
        assertEquals(3L, tokens.validar(tokens.gerar(usuario(3))));
    }
}