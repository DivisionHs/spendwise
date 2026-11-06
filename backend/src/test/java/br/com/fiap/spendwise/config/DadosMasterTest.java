package br.com.fiap.spendwise.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.Papel;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

/** Regras do usuario MASTER: criado na subida, promovido se ja existe, e nunca sem configuracao. */
class DadosMasterTest {

    private final UsuarioRepository repo = mock(UsuarioRepository.class);
    private final DadosMaster servico = new DadosMaster(repo);

    private void configurar(String email, String senha) {
        ReflectionTestUtils.setField(servico, "email", email);
        ReflectionTestUtils.setField(servico, "nome", "Davi");
        ReflectionTestUtils.setField(servico, "senha", senha);
    }

    @Test
    void usuarioNovoComecaComoUsuarioComum() {
        assertEquals(Papel.USUARIO, new Usuario("Ana", "ana@exemplo.com", "hash", "01310100").getPapel());
    }

    @Test
    void semEmailConfiguradoNaoFazNada() {
        configurar("", "segredo123");
        servico.garantirMaster();
        verify(repo, never()).save(any());
    }

    @Test
    void criaMasterQuandoNaoExisteESenhaValida() {
        configurar("mestre@exemplo.com", "segredo123");
        when(repo.findByEmailIgnoreCase("mestre@exemplo.com")).thenReturn(Optional.empty());

        servico.garantirMaster();

        ArgumentCaptor<Usuario> capturado = ArgumentCaptor.forClass(Usuario.class);
        verify(repo).save(capturado.capture());
        assertEquals(Papel.MASTER, capturado.getValue().getPapel());
        assertEquals("mestre@exemplo.com", capturado.getValue().getEmail());
    }

    @Test
    void naoCriaMasterComSenhaCurta() {
        configurar("mestre@exemplo.com", "123");
        when(repo.findByEmailIgnoreCase("mestre@exemplo.com")).thenReturn(Optional.empty());

        servico.garantirMaster();

        verify(repo, never()).save(any());
    }

    @Test
    void promoveContaExistenteSemMexerNaSenha() {
        configurar("mestre@exemplo.com", "");
        Usuario existente = new Usuario("Davi", "mestre@exemplo.com", "hash-original", "01310100");
        when(repo.findByEmailIgnoreCase("mestre@exemplo.com")).thenReturn(Optional.of(existente));

        servico.garantirMaster();

        verify(repo).save(existente);
        assertEquals(Papel.MASTER, existente.getPapel());
        assertEquals("hash-original", existente.getSenha());
    }

    @Test
    void papelNuloVoltaParaUsuario() {
        Usuario u = new Usuario("Ana", "ana@exemplo.com", "hash", "01310100");
        u.setPapel(null);
        assertEquals(Papel.USUARIO, u.getPapel());
    }
}