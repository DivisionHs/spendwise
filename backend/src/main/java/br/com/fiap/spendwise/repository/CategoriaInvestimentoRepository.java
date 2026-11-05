package br.com.fiap.spendwise.repository;

import br.com.fiap.spendwise.model.CategoriaInvestimento;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaInvestimentoRepository extends JpaRepository<CategoriaInvestimento, Long> {

    Optional<CategoriaInvestimento> findFirstByNomeIgnoreCase(String nome);
}
