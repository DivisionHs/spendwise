package br.com.fiap.spendwise.config;

import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.model.enums.Papel;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import br.com.fiap.spendwise.service.SenhaUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Garante o usuario MASTER (administrador) ao subir o backend, a partir da configuracao do servidor:
 *   MASTER_EMAIL     e-mail do master (se vazio, nada e feito)
 *   MASTER_NOME      nome exibido (padrao: Administrador)
 *   MASTER_PASSWORD  senha inicial, usada SO se a conta ainda nao existe (minimo de 6 caracteres)
 *
 * - Se o e-mail ja esta cadastrado: a conta e promovida a MASTER (a senha atual nao e alterada).
 * - Se nao esta e ha senha configurada: a conta e criada ja como MASTER.
 * E idempotente: pode rodar a cada subida sem efeito colateral.
 */
@Component
public class DadosMaster implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DadosMaster.class);
    private static final String CEP_PADRAO = "00000000";
    private static final int SENHA_MINIMA = 6;

    private final UsuarioRepository usuarioRepository;

    @Value("${spendwise.master.email:}")
    private String email;

    @Value("${spendwise.master.nome:Administrador}")
    private String nome;

    @Value("${spendwise.master.senha:}")
    private String senha;

    public DadosMaster(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        // Como a carga de exemplo: nunca impede a API de subir
        try {
            garantirMaster();
        } catch (RuntimeException e) {
            log.warn("Nao foi possivel garantir o usuario master: {}", e.getMessage());
        }
    }

    void garantirMaster() {
        if (email == null || email.isBlank()) {
            return;
        }
        String emailMaster = email.trim();
        Usuario existente = usuarioRepository.findByEmailIgnoreCase(emailMaster).orElse(null);

        if (existente != null) {
            if (existente.getPapel() != Papel.MASTER) {
                existente.setPapel(Papel.MASTER);
                usuarioRepository.save(existente);
                log.info("Usuario {} promovido a MASTER.", emailMaster);
            }
            return;
        }

        if (senha == null || senha.length() < SENHA_MINIMA) {
            log.warn("MASTER_EMAIL informado, mas sem MASTER_PASSWORD valida (minimo {} caracteres): conta nao criada.",
                    SENHA_MINIMA);
            return;
        }
        Usuario master = new Usuario(nome == null || nome.isBlank() ? "Administrador" : nome.trim(),
                emailMaster, SenhaUtil.gerarHash(senha), CEP_PADRAO);
        master.setPapel(Papel.MASTER);
        usuarioRepository.save(master);
        log.info("Usuario MASTER {} criado.", emailMaster);
    }
}