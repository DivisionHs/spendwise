package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Investimento;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvestimentoRepository extends JpaRepository<Investimento, Long> {

    List<Investimento> findByUsuarioIdUsuarioOrderByDataDesc(Long idUsuario);

    boolean existsByUsuarioIdUsuario(Long idUsuario);

    boolean existsByCategoriaIdCatInvest(Long idCatInvest);

    @Query("select coalesce(sum(i.valorInvestido), 0) from Investimento i where i.usuario.idUsuario = :idUsuario")
    BigDecimal somarPorUsuario(@Param("idUsuario") Long idUsuario);
}
