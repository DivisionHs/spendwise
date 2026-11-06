package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.exception.NaoAutorizadoException;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Exige o cabecalho "Authorization: Bearer TOKEN" em toda a API, menos no login e no cadastro.
 * Com o token valido, confere o usuario no banco (assim exclusao e mudanca de papel valem na hora)
 * e aplica as regras de Autorizacao. Os erros viram JSON pelo TratadorDeErros (401 e 403).
 */
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_SESSAO = "spendwise.sessao";
    private static final String PREFIXO_BEARER = "Bearer ";

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final Autorizacao autorizacao;

    public AutenticacaoInterceptor(TokenService tokenService, UsuarioRepository usuarioRepository,
                                   Autorizacao autorizacao) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.autorizacao = autorizacao;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        String metodo = req.getMethod();
        if ("OPTIONS".equalsIgnoreCase(metodo)) {
            return true; // pre-verificacao do CORS: o navegador nao envia o token
        }
        String caminho = req.getRequestURI();
        if (publica(metodo, caminho)) {
            return true;
        }

        String cabecalho = req.getHeader("Authorization");
        if (cabecalho == null || !cabecalho.startsWith(PREFIXO_BEARER)) {
            throw new NaoAutorizadoException("Faça login para continuar.");
        }
        Long idUsuario = tokenService.validar(cabecalho.substring(PREFIXO_BEARER.length()).trim());
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NaoAutorizadoException("Sessão inválida. Entre novamente."));
        Sessao sessao = new Sessao(usuario.getIdUsuario(), usuario.getPapel());
        req.setAttribute(ATRIBUTO_SESSAO, sessao);

        autorizacao.verificar(sessao, metodo, caminho, req.getParameter("idUsuario"));
        return true;
    }

    private boolean publica(String metodo, String caminho) {
        String limpo = caminho.endsWith("/") ? caminho.substring(0, caminho.length() - 1) : caminho;
        return "POST".equalsIgnoreCase(metodo)
                && ("/api/auth/login".equals(limpo) || "/api/usuarios".equals(limpo));
    }
}