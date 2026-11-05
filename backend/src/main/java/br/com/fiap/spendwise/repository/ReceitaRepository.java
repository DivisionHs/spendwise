package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Receita;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    List<Receita> findByUsuarioIdUsuarioOrderByDataDesc(Long idUsuario);

    boolean existsByUsuarioIdUsuario(Long idUsuario);

    @Query("select coalesce(sum(r.valor), 0) from Receita r where r.usuario.idUsuario = :idUsuario")
    BigDecimal somarPorUsuario(@Param("idUsuario") Long idUsuario);
}
