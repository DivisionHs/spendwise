package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Meta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetaRepository extends JpaRepository<Meta, Long> {

    List<Meta> findByUsuarioIdUsuarioOrderByDataLimiteAsc(Long idUsuario);

    boolean existsByUsuarioIdUsuario(Long idUsuario);
}