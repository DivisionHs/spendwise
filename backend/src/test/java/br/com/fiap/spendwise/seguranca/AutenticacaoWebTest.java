package br.com.fiap.spendwise.seguranca;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.fiap.spendwise.controller.AuthController;
import br.com.fiap.spendwise.controller.ReceitaController;
import br.com.fiap.spendwise.model.Receita;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.Papel;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import br.com.fiap.spendwise.service.ReceitaService;
import br.com.fiap.spendwise.service.UsuarioService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Teste da camada web (sem banco): interceptador de login, regras de acesso e conferencia do dono no corpo,
 * incluindo o formato JSON dos erros 401 e 403.
 */
@WebMvcTest({ReceitaController.class, AuthController.class})
@Import({TokenService.class, Autorizacao.class, AutenticacaoInterceptor.class})
@TestPropertySource(properties = {
        "spendwise.auth.segredo=um-segredo-de-teste-com-mais-de-32-caracteres!",
        "spendwise.cors.origens=http://localhost:5173"})
class AutenticacaoWebTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private TokenService tokens;

    @MockBean
    private ReceitaService receitas;
    @MockBean
    private UsuarioService usuarios;
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private DonoDoRegistro donos;

    private final Usuario ana = usuario(1L, Papel.USUARIO);
    private final Usuario mestre = usuario(99L, Papel.MASTER);

    private static Usuario usuario(long id, Papel papel) {
        Usuario u = new Usuario("Fulano " + id, "u" + id + "@exemplo.com", "hash", "01310100");
        u.setIdUsuario(id);
        u.setPapel(papel);
        return u;
    }

    private String bearer(Usuario u) {
        return "Bearer " + tokens.gerar(u);
    }

    @BeforeEach
    void preparar() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(ana));
        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(mestre));
        when(donos.recursoComDono("receitas")).thenReturn(true);
        when(receitas.listar(any())).thenReturn(List.of());
        when(receitas.criar(any())).thenAnswer(i -> {
            Receita r = i.getArgument(0);
            r.setIdReceita(5L);
            return r;
        });
    }

    @Test
    void semTokenRetorna401EmJson() throws Exception {
        mvc.perform(get("/api/receitas").param("idUsuario", "1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.mensagem").value("Faça login para continuar."));
    }

    @Test
    void tokenInvalidoRetorna401() throws Exception {
        mvc.perform(get("/api/receitas").param("idUsuario", "1").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenDeUsuarioExcluidoRetorna401() throws Exception {
        Usuario excluido = usuario(7L, Papel.USUARIO);
        when(usuarioRepository.findById(7L)).thenReturn(Optional.empty());
        mvc.perform(get("/api/receitas").param("idUsuario", "7").header("Authorization", bearer(excluido)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void usuarioComumListaOsProprios() throws Exception {
        mvc.perform(get("/api/receitas").param("idUsuario", "1").header("Authorization", bearer(ana)))
                .andExpect(status().isOk());
    }

    @Test
    void usuarioComumNaoListaDeOutraPessoaNemTudo() throws Exception {
        mvc.perform(get("/api/receitas").param("idUsuario", "2").header("Authorization", bearer(ana)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        mvc.perform(get("/api/receitas").header("Authorization", bearer(ana)))
                .andExpect(status().isForbidden());
    }

    @Test
    void masterListaTudo() throws Exception {
        mvc.perform(get("/api/receitas").header("Authorization", bearer(mestre)))
                .andExpect(status().isOk());
    }

    @Test
    void criarReceitaEmNomeProprioFunciona() throws Exception {
        mvc.perform(post("/api/receitas").header("Authorization", bearer(ana))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":{\"idUsuario\":1},\"valor\":10,\"data\":\"2026-11-05\",\"descricao\":\"Salario\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void criarReceitaEmNomeDeOutraPessoaERecusado() throws Exception {
        mvc.perform(post("/api/receitas").header("Authorization", bearer(ana))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":{\"idUsuario\":2},\"valor\":10,\"data\":\"2026-11-05\",\"descricao\":\"Salario\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensagem").value("Você só pode criar e alterar registros em seu próprio nome."));
    }

    @Test
    void masterPodeCriarEmNomeDeOutraPessoa() throws Exception {
        mvc.perform(post("/api/receitas").header("Authorization", bearer(mestre))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":{\"idUsuario\":2},\"valor\":10,\"data\":\"2026-11-05\",\"descricao\":\"Salario\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void loginEPublicoEDevolveToken() throws Exception {
        when(usuarios.autenticar("u1@exemplo.com", "segredo1")).thenReturn(ana);
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"u1@exemplo.com\",\"senha\":\"segredo1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.papel").value("USUARIO"))
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void preVerificacaoDoCorsNaoExigeToken() throws Exception {
        mvc.perform(options("/api/receitas")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk());
    }
}