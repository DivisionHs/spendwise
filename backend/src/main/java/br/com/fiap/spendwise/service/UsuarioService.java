package br.com.fiap.spendwise.service;

import br.com.fiap.spendwise.exception.CredenciaisInvalidasException;
import br.com.fiap.spendwise.exception.EmailJaCadastradoException;
import br.com.fiap.spendwise.exception.RegistroEmUsoException;
import br.com.fiap.spendwise.exception.RecursoNaoEncontradoException;
import br.com.fiap.spendwise.exception.RegraNegocioException;
import br.com.fiap.spendwise.model.Usuario;
import br.com.fiap.spendwise.repository.ContaRepository;
import br.com.fiap.spendwise.repository.DespesaRepository;
import br.com.fiap.spendwise.repository.DividaRepository;
import br.com.fiap.spendwise.repository.InvestimentoRepository;
import br.com.fiap.spendwise.repository.MetaRepository;
import br.com.fiap.spendwise.repository.OrcamentoRepository;
import br.com.fiap.spendwise.repository.ReceitaRepository;
import br.com.fiap.spendwise.repository.UsuarioRepository;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Regras de negocio do usuario:
 * nome, e-mail e CEP validos; e-mail unico; senha com no minimo 6 caracteres
 * (guardada em hash); nao exclui usuario que ja tem registros
 * (lancamentos, investimentos, contas, dividas, metas ou orcamentos); autenticacao por e-mail e senha.
 */
@Service
public class UsuarioService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int SENHA_MINIMA = 6;

    private final UsuarioRepository usuarioRepository;
    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final InvestimentoRepository investimentoRepository;
    private final ContaRepository contaRepository;
    private final DividaRepository dividaRepository;
    private final MetaRepository metaRepository;
    private final OrcamentoRepository orcamentoRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          ReceitaRepository receitaRepository,
                          DespesaRepository despesaRepository,
                          InvestimentoRepository investimentoRepository,
                          ContaRepository contaRepository,
                          DividaRepository dividaRepository,
                          MetaRepository metaRepository,
                          OrcamentoRepository orcamentoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.receitaRepository = receitaRepository;
        this.despesaRepository = despesaRepository;
        this.investimentoRepository = investimentoRepository;
        this.contaRepository = contaRepository;
        this.dividaRepository = dividaRepository;
        this.metaRepository = metaRepository;
        this.orcamentoRepository = orcamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário " + id + " não encontrado."));
    }

    @Transactional
    public Usuario criar(Usuario dados) {
        validarDadosBasicos(dados);
        if (dados.getSenha() == null || dados.getSenha().length() < SENHA_MINIMA) {
            throw new RegraNegocioException("A senha deve ter no mínimo " + SENHA_MINIMA + " caracteres.");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(dados.getEmail())) {
            throw new EmailJaCadastradoException(dados.getEmail());
        }
        Usuario novo = new Usuario(dados.getNome(), dados.getEmail(),
                SenhaUtil.gerarHash(dados.getSenha()), dados.getCep());
        return usuarioRepository.save(novo);
    }

    @Transactional
    public Usuario atualizar(Long id, Usuario dados) {
        Usuario existente = buscarPorId(id);
        validarDadosBasicos(dados);

        usuarioRepository.findByEmailIgnoreCase(dados.getEmail())
                .filter(outro -> !outro.getIdUsuario().equals(id))
                .ifPresent(outro -> {
                    throw new EmailJaCadastradoException(dados.getEmail());
                });

        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setCep(dados.getCep());

        // Senha opcional na atualizacao: em branco mantem a atual.
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            if (dados.getSenha().length() < SENHA_MINIMA) {
                throw new RegraNegocioException("A senha deve ter no mínimo " + SENHA_MINIMA + " caracteres.");
            }
            existente.setSenha(SenhaUtil.gerarHash(dados.getSenha()));
        }
        return usuarioRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Usuario existente = buscarPorId(id);
        if (receitaRepository.existsByUsuarioIdUsuario(id)
                || despesaRepository.existsByUsuarioIdUsuario(id)
                || investimentoRepository.existsByUsuarioIdUsuario(id)
                || contaRepository.existsByUsuarioIdUsuario(id)
                || dividaRepository.existsByUsuarioIdUsuario(id)
                || metaRepository.existsByUsuarioIdUsuario(id)
                || orcamentoRepository.existsByUsuarioIdUsuario(id)) {
            throw new RegistroEmUsoException(
                    "Não é possível excluir o usuário: ele possui lançamentos, contas, dívidas, metas ou orçamentos.");
        }
        usuarioRepository.delete(existente);
    }

    @Transactional(readOnly = true)
    public Usuario autenticar(String email, String senha) {
        if (email == null || senha == null) {
            throw new CredenciaisInvalidasException();
        }
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(CredenciaisInvalidasException::new);
        if (!SenhaUtil.conferir(senha, usuario.getSenha())) {
            throw new CredenciaisInvalidasException();
        }
        return usuario;
    }

    private void validarDadosBasicos(Usuario dados) {
        if (dados == null) {
            throw new RegraNegocioException("Dados do usuário não informados.");
        }
        if (dados.getNome() == null || dados.getNome().isBlank() || dados.getNome().length() > 100) {
            throw new RegraNegocioException("O nome é obrigatório e deve ter até 100 caracteres.");
        }
        dados.setNome(dados.getNome().trim());

        if (dados.getEmail() == null || dados.getEmail().length() > 100
                || !EMAIL.matcher(dados.getEmail().trim()).matches()) {
            throw new RegraNegocioException("Informe um e-mail valido (até 100 caracteres).");
        }
        dados.setEmail(dados.getEmail().trim());

        String cep = dados.getCep() == null ? "" : dados.getCep().replaceAll("\\D", "");
        if (cep.length() != 8) {
            throw new RegraNegocioException("O CEP deve ter 8 dígitos.");
        }
        dados.setCep(cep);
    }
}
