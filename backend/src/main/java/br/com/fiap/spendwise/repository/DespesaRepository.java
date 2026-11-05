package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Despesa;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByUsuarioIdUsuarioOrderByDataDesc(Long idUsuario);

    List<Despesa> findByUsuarioIdUsuarioAndDataBetween(Long idUsuario, LocalDate inicio, LocalDate fim);

    boolean existsByUsuarioIdUsuario(Long idUsuario);

    @Query("select coalesce(sum(d.valor), 0) from Despesa d where d.usuario.idUsuario = :idUsuario")
    BigDecimal somarPorUsuario(@Param("idUsuario") Long idUsuario);
}