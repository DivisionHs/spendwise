package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Divida;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DividaRepository extends JpaRepository<Divida, Long> {

    List<Divida> findByUsuarioIdUsuarioOrderByVencimentoAsc(Long idUsuario);

    boolean existsByUsuarioIdUsuario(Long idUsuario);
}