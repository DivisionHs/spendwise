package br.com.fiap.spendwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada do backend do SpendWise (Fintech).
 */
@SpringBootApplication
public class SpendWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpendWiseApplication.class, args);
    }
}
