package br.com.fiap.spendwise.model.enums;

/**
 * Papel (nivel de acesso) do usuario no SpendWise.
 * USUARIO: papel padrao de quem se cadastra. MASTER: administrador do sistema.
 * O papel nunca e definido pela API: so a configuracao do servidor cria ou promove um master.
 */
public enum Papel {
    USUARIO,
    MASTER
}