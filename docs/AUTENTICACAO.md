# Autenticação e autorização (login por token)

A API exige um **token de acesso** em todas as chamadas, menos no login e no cadastro. O token é um JWT (JSON Web Token) assinado com HMAC-SHA256, gerado só com o JDK, sem biblioteca extra.

## Como funciona

1. `POST /api/auth/login` com `{ "email", "senha" }`. Se estiver certo, devolve 200 com os dados do usuário (sem senha) e o campo `token`.
2. O frontend guarda o token no navegador e o envia em toda chamada: `Authorization: Bearer TOKEN`.
3. A cada chamada, o backend confere a assinatura e a validade do token, **busca o usuário no banco** (por isso excluir um usuário ou mudar o papel vale na hora, sem esperar o token vencer) e aplica as regras de acesso abaixo.
4. Token ausente, inválido ou vencido: **401** com JSON no formato de sempre. Sem permissão: **403**.

| Rota | Acesso |
|---|---|
| `POST /api/auth/login` | Pública |
| `POST /api/usuarios` (cadastro) | Pública |
| `GET /api/saude` (verificação de saúde) | Pública. Não devolve dado nenhum: só confirma que a API responde e que o banco atende uma consulta simples (200 `{"status":"ok"}` ou 503; aceita GET e HEAD). Serve para o monitor de disponibilidade |
| `OPTIONS` (pré-verificação do navegador, CORS) | Pública |
| Qualquer outra rota de `/api/**` | Exige token válido |

## Conteúdo do token

Três partes separadas por ponto: cabeçalho, dados e assinatura (todas em base64url). Os dados trazem `sub` (id do usuário), `papel`, `iat` (emissão) e `exp` (expiração), em segundos. A validade padrão é de **168 horas (7 dias)**.

## Quem pode o quê

| Recurso | Usuário comum (`USUARIO`) | `MASTER` |
|---|---|---|
| Lista de usuários (`GET /api/usuarios`) | Não (403) | Sim |
| Ver ou editar um usuário | Só o próprio | Qualquer um |
| Excluir usuário | Não | Sim |
| Receitas, despesas, dívidas, metas, contas, orçamentos, investimentos: listar | Só com `?idUsuario=` igual ao próprio | Tudo, com ou sem filtro |
| Os mesmos, por id (ver, alterar, excluir) | Só se for o dono do registro | Qualquer registro |
| Os mesmos, criar ou alterar | O campo `usuario` do corpo precisa ser o próprio | Em nome de qualquer um |
| Resumo e análise (`/api/resumo/{id}`, `/api/analise/{id}`) | Só os próprios | Qualquer um |
| Categorias de investimento (compartilhadas) | Só consulta | Consulta e altera |

Um registro de outra pessoa responde **403**; um registro que não existe segue respondendo **404**.

## Configuração (variáveis de ambiente)

| Variável | Para que serve | Observação |
|---|---|---|
| `JWT_SECRET` | Segredo que assina os tokens | **Mínimo de 32 caracteres aleatórios.** Sem ele, o backend usa um segredo temporário, criado a cada subida: tudo funciona, mas **todo mundo é desconectado a cada reinício** (o plano gratuito do Render reinicia com frequência). Nunca vai para o repositório |
| `JWT_VALIDADE_HORAS` | Validade do token | Opcional, padrão 168 |

Trocar o `JWT_SECRET` invalida todos os tokens já emitidos (todos precisam entrar de novo).

## No frontend

- O token e os dados do usuário ficam no `localStorage`, então a pessoa continua logada por dias.
- Se a API responder 401 (token vencido, inválido ou usuário excluído), o site encerra a sessão e volta ao login com o aviso "Sua sessão expirou".
- Sessões antigas, de antes do login por token, não têm token: pedem o login de novo.
- Páginas do master e do usuário comum carregam só o que o papel permite (a tela Meu perfil, por exemplo, não pede a lista de usuários).

## Arquivos

| Arquivo | Função |
|---|---|
| `seguranca/TokenService.java` | Gera e valida o JWT |
| `seguranca/AutenticacaoInterceptor.java` | Exige o token e busca a sessão |
| `seguranca/Autorizacao.java` | Regras de quem pode o quê |
| `seguranca/DonoDoRegistro.java` | Descobre o dono de um registro pelo recurso e id |
| `seguranca/DonoNoCorpoAdvice.java` | Confere o dono no corpo de POST e PUT |
| `config/AutenticacaoConfig.java` | Liga o interceptador em `/api/**` |
| `exception/AcessoNegadoException.java` | O 403 |
| `dto/LoginResposta.java` | Resposta do login |

## Testes

`TokenServiceTest` (assinatura adulterada, dados trocados, outro segredo, expirado, lixo, segredo temporário), `AutorizacaoTest` (todas as regras da tabela acima) e `AutenticacaoWebTest` (camada web com MockMvc: 401 e 403 em JSON, criar em nome próprio e de outra pessoa, usuário excluído, login público e CORS). 58 testes no total.

## Limites conhecidos

- **Sem limite de tentativas de login:** um robô poderia tentar senhas sem parar. Fica para uma próxima etapa.
- **Cadastro aberto:** qualquer pessoa pode criar uma conta (como `USUARIO`), mas só enxerga os próprios dados.
- **Token no `localStorage`:** é prático, mas ficaria exposto se o site tivesse uma falha de injeção de código (XSS). Cookie `httpOnly` seria o passo seguinte.
- **Sem renovação de token:** vencido o prazo (7 dias), é preciso entrar de novo.