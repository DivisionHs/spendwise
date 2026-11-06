package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.exception.NaoAutorizadoException;
import br.com.fiap.spendwise.model.Usuario;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Token de login no formato JWT (JSON Web Token) assinado com HMAC-SHA256, so com o JDK.
 * Formato: base64url(cabecalho) . base64url(dados) . base64url(assinatura)
 * Dados: sub (id do usuario), papel, iat (emissao) e exp (expiracao), em segundos.
 *
 * O segredo vem de JWT_SECRET (minimo de 32 caracteres). Sem segredo valido, cria-se um aleatorio
 * so para esta execucao: tudo funciona, mas os tokens deixam de valer quando o backend reinicia.
 */
@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    private static final String ALGORITMO = "HmacSHA256";
    private static final int SEGREDO_MINIMO = 32;
    private static final Base64.Encoder CODIFICADOR = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODIFICADOR = Base64.getUrlDecoder();
    private static final String CABECALHO = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

    private final ObjectMapper json = new ObjectMapper();
    private final byte[] chave;
    private final long validadeSegundos;

    public TokenService(@Value("${spendwise.auth.segredo:}") String segredo,
                        @Value("${spendwise.auth.validade-horas:168}") long validadeHoras) {
        this.validadeSegundos = validadeHoras * 3600;
        if (segredo == null || segredo.length() < SEGREDO_MINIMO) {
            byte[] aleatorio = new byte[48];
            new SecureRandom().nextBytes(aleatorio);
            this.chave = aleatorio;
            log.warn("JWT_SECRET ausente ou com menos de {} caracteres: usando um segredo temporario. "
                    + "Os logins deixam de valer a cada reinicio; defina JWT_SECRET para manter as sessoes.", SEGREDO_MINIMO);
        } else {
            this.chave = segredo.getBytes(StandardCharsets.UTF_8);
        }
    }

    /** Gera o token de um usuario recem autenticado. */
    public String gerar(Usuario usuario) {
        long agora = Instant.now().getEpochSecond();
        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("sub", String.valueOf(usuario.getIdUsuario()));
        dados.put("papel", usuario.getPapel().name());
        dados.put("iat", agora);
        dados.put("exp", agora + validadeSegundos);
        String corpo = codificar(CABECALHO) + "." + codificar(escrever(dados));
        return corpo + "." + CODIFICADOR.encodeToString(assinar(corpo));
    }

    /** Confere assinatura, algoritmo e validade; devolve o id do usuario. Qualquer falha vira 401. */
    public Long validar(String token) {
        try {
            String[] partes = token.split("\\.");
            if (partes.length != 3) {
                throw invalido();
            }
            byte[] esperada = assinar(partes[0] + "." + partes[1]);
            byte[] recebida = DECODIFICADOR.decode(partes[2]);
            if (!MessageDigest.isEqual(esperada, recebida)) {
                throw invalido();
            }
            Map<String, Object> cabecalho = ler(partes[0]);
            if (!"HS256".equals(cabecalho.get("alg"))) {
                throw invalido();
            }
            Map<String, Object> dados = ler(partes[1]);
            long expira = ((Number) dados.get("exp")).longValue();
            if (Instant.now().getEpochSecond() >= expira) {
                throw new NaoAutorizadoException("Sua sessão expirou. Entre novamente.");
            }
            return Long.valueOf(String.valueOf(dados.get("sub")));
        } catch (NaoAutorizadoException e) {
            throw e;
        } catch (RuntimeException e) {
            throw invalido();
        }
    }

    private NaoAutorizadoException invalido() {
        return new NaoAutorizadoException("Sessão inválida. Entre novamente.");
    }

    private byte[] assinar(String texto) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO);
            mac.init(new SecretKeySpec(chave, ALGORITMO));
            return mac.doFinal(texto.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Nao foi possivel assinar o token.", e);
        }
    }

    private String codificar(String texto) {
        return CODIFICADOR.encodeToString(texto.getBytes(StandardCharsets.UTF_8));
    }

    private String escrever(Map<String, Object> dados) {
        try {
            return json.writeValueAsString(dados);
        } catch (Exception e) {
            throw new IllegalStateException("Nao foi possivel montar o token.", e);
        }
    }

    private Map<String, Object> ler(String parte) {
        try {
            return json.readValue(new String(DECODIFICADOR.decode(parte), StandardCharsets.UTF_8),
                    new TypeReference<Map<String, Object>>() { });
        } catch (Exception e) {
            throw invalido();
        }
    }
}