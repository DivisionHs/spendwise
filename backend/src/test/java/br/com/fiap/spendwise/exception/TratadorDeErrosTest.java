package br.com.fiap.spendwise.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/** Cada excecao personalizada vira o codigo HTTP certo, com o corpo JSON padronizado. */
class TratadorDeErrosTest {

    private final TratadorDeErros tratador = new TratadorDeErros();

    private ResponseEntity<Map<String, Object>> tratar(SpendWiseException e) {
        HttpServletRequest req = mock(HttpServletRequest.class);
        when(req.getRequestURI()).thenReturn("/api/teste");
        return tratador.excecaoDaAplicacao(e, req);
    }

    @Test
    void cadaExcecaoTemSeuStatus() {
        assertEquals(HttpStatus.BAD_REQUEST, tratar(new RegraNegocioException("x")).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, tratar(new ValorInvalidoException("x")).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, tratar(new DataInvalidaException("x")).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, tratar(new CategoriaInvalidaException("x")).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, tratar(new RecursoNaoEncontradoException("x")).getStatusCode());
        assertEquals(HttpStatus.CONFLICT, tratar(new ConflitoException("x")).getStatusCode());
        assertEquals(HttpStatus.CONFLICT, tratar(new EmailJaCadastradoException("a@b.com")).getStatusCode());
        assertEquals(HttpStatus.CONFLICT, tratar(new RegistroEmUsoException("x")).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, tratar(new CredenciaisInvalidasException()).getStatusCode());
    }

    @Test
    void corpoTrazStatusMensagemECaminho() {
        Map<String, Object> corpo = tratar(new RecursoNaoEncontradoException("Receita 7 não encontrada.")).getBody();
        assertEquals(404, corpo.get("status"));
        assertEquals("Receita 7 não encontrada.", corpo.get("mensagem"));
        assertEquals("/api/teste", corpo.get("caminho"));
    }
}