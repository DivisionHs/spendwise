package br.com.fiap.spendwise.service;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Guarda e confere senhas sem texto puro no banco, usando apenas o que ja vem
 * no Java (PBKDF2 com SHA-256, sal aleatorio por senha).
 * Formato gravado em ds_senha: pbkdf2$iteracoes$sal$hash (tudo em Base64).
 */
public final class SenhaUtil {

    private static final String ALGORITMO = "PBKDF2WithHmacSHA256";
    private static final int ITERACOES = 65_536;
    private static final int TAMANHO_SAL = 16;
    private static final int TAMANHO_HASH_BITS = 256;
    private static final String PREFIXO = "pbkdf2";

    private SenhaUtil() {
    }

    public static String gerarHash(String senha) {
        byte[] sal = new byte[TAMANHO_SAL];
        new SecureRandom().nextBytes(sal);
        byte[] hash = derivar(senha, sal, ITERACOES);
        return PREFIXO + "$" + ITERACOES + "$"
                + Base64.getEncoder().encodeToString(sal) + "$"
                + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean conferir(String senha, String hashGuardado) {
        if (senha == null || hashGuardado == null) {
            return false;
        }
        String[] partes = hashGuardado.split("\\$");
        if (partes.length != 4 || !PREFIXO.equals(partes[0])) {
            return false;
        }
        try {
            int iteracoes = Integer.parseInt(partes[1]);
            byte[] sal = Base64.getDecoder().decode(partes[2]);
            byte[] esperado = Base64.getDecoder().decode(partes[3]);
            byte[] calculado = derivar(senha, sal, iteracoes);
            return MessageDigest.isEqual(esperado, calculado);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static byte[] derivar(String senha, byte[] sal, int iteracoes) {
        try {
            PBEKeySpec spec = new PBEKeySpec(senha.toCharArray(), sal, iteracoes, TAMANHO_HASH_BITS);
            return SecretKeyFactory.getInstance(ALGORITMO).generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Não foi possível calcular o hash da senha.", e);
        }
    }
}
