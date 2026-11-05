package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.Conta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContaRepository extends JpaRepository<Conta, Long> {

    List<Conta> findByUsuarioIdUsuarioOrderByIdContaAsc(Long idUsuario);

    boolean existsByUsuarioIdUsuario(Long idUsuario);
}