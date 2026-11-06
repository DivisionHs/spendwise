package br.com.fiap.spendwise.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import br.com.fiap.spendwise.model.enums.Papel;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Usuario do SpendWise. Mapeia a tabela T_FIN_USUARIO.
 * A senha so e aceita na entrada (WRITE_ONLY): nunca volta nas respostas da API.
 */
@Entity
@Table(name = "T_FIN_USUARIO")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "nm_usuario", nullable = false, length = 100)
    private String nome;

    @Column(name = "ds_email", nullable = false, length = 100, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "ds_senha", nullable = false, length = 255)
    private String senha;

    @Column(name = "ds_cep", nullable = false, length = 8)
    private String cep;

    // READ_ONLY: aparece nas respostas, mas e ignorado na entrada (ninguem se promove pela API)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Enumerated(EnumType.STRING)
    @Column(name = "ds_papel", nullable = false, length = 10)
    private Papel papel = Papel.USUARIO;

    public Usuario() {
    }

    public Usuario(String nome, String email, String senha, String cep) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cep = cep;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public Papel getPapel() {
        return papel;
    }

    public void setPapel(Papel papel) {
        this.papel = papel == null ? Papel.USUARIO : papel;
    }
}
