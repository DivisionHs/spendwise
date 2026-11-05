package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Orcamento;
import br.com.fiap.spendwise.model.enums.CategoriaDespesa;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {

    List<Orcamento> findByUsuarioIdUsuarioOrderByCategoriaAsc(Long idUsuario);

    Optional<Orcamento> findByUsuarioIdUsuarioAndCategoria(Long idUsuario, CategoriaDespesa categoria);

    boolean existsByUsuarioIdUsuario(Long idUsuario);
}