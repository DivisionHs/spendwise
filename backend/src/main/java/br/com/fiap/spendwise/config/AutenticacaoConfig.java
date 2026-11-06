package br.com.fiap.spendwise.config;

import br.com.fiap.spendwise.seguranca.AutenticacaoInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Liga o interceptador de autenticacao em todas as rotas da API. */
@Configuration
public class AutenticacaoConfig implements WebMvcConfigurer {

    private final AutenticacaoInterceptor interceptor;

    public AutenticacaoConfig(AutenticacaoInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor).addPathPatterns("/api/**");
    }
}