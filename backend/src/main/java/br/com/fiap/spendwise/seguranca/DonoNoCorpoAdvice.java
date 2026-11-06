package br.com.fiap.spendwise.seguranca;

import br.com.fiap.spendwise.exception.AcessoNegadoException;
import java.lang.reflect.Type;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

/**
 * Em POST e PUT de registros com dono, confere o "usuario" que veio no corpo: quem nao e MASTER so pode
 * criar e alterar registros em seu proprio nome (impede gravar na conta de outra pessoa).
 */
@ControllerAdvice
public class DonoNoCorpoAdvice extends RequestBodyAdviceAdapter {

    @Override
    public boolean supports(MethodParameter parametro, Type tipo,
                            Class<? extends HttpMessageConverter<?>> conversor) {
        return true;
    }

    @Override
    public Object afterBodyRead(Object corpo, HttpInputMessage entrada, MethodParameter parametro,
                                Type tipo, Class<? extends HttpMessageConverter<?>> conversor) {
        if (corpo instanceof ComDono comDono) {
            Object atributo = RequestContextHolder.currentRequestAttributes()
                    .getAttribute(AutenticacaoInterceptor.ATRIBUTO_SESSAO, RequestAttributes.SCOPE_REQUEST);
            if (atributo instanceof Sessao sessao && !sessao.ehMaster()) {
                Long dono = comDono.getUsuario() == null ? null : comDono.getUsuario().getIdUsuario();
                if (!sessao.ehDono(dono)) {
                    throw new AcessoNegadoException("Você só pode criar e alterar registros em seu próprio nome.");
                }
            }
        }
        return corpo;
    }
}