# Usuários, papéis e usuário master

O SpendWise tem dois **papéis** (níveis de acesso). Cada usuário tem exatamente um.

| Papel | Quem é | O que vê e faz hoje |
|---|---|---|
| `USUARIO` | Todo mundo que se cadastra em **Cadastre-se**. É o padrão | Usa o sistema com os próprios dados. Na tela **Usuários** vê só o próprio perfil, sem lista de outras pessoas e sem o botão de novo usuário |
| `MASTER` | Administrador do sistema (o dono do projeto) | Tudo o que o usuário comum faz, e mais: vê a lista de todos os usuários, a análise da base (quantos têm lançamentos, quem mais movimenta) e cadastra usuários pela tela. Aparece com o selo **Master** ao lado do nome |

## Como o master é criado

O papel **nunca é definido pela API**. O cadastro (`POST /api/usuarios`) e a edição (`PUT /api/usuarios/{id}`) ignoram qualquer campo `papel` enviado, então ninguém se promove sozinho. O master nasce na **subida do backend**, a partir de variáveis de ambiente do servidor (no Render):

| Variável | Para que serve | Obrigatória |
|---|---|---|
| `MASTER_EMAIL` | E-mail da conta master. Se estiver vazia, nada acontece | Sim |
| `MASTER_NOME` | Nome exibido (padrão: `Administrador`) | Não |
| `MASTER_PASSWORD` | Senha inicial, usada **só se a conta ainda não existe** (mínimo de 6 caracteres) | Só para criar |

Comportamento a cada subida (idempotente, pode repetir sem efeito colateral):

1. **A conta com esse e-mail não existe e há `MASTER_PASSWORD`:** é criada já como `MASTER` (CEP `00000000`, que pode ser editado depois no perfil).
2. **A conta já existe** (por exemplo, a pessoa se cadastrou antes): é **promovida** a `MASTER`; a senha atual não muda.
3. **Sem senha e sem conta:** registra um aviso no log e não cria nada.

A senha fica só na variável de ambiente do Render e, no banco, como hash PBKDF2 com sal. Não é gravada em nenhum arquivo do repositório.

## Banco de dados

A tabela `T_FIN_USUARIO` ganhou a coluna `ds_papel VARCHAR(10) DEFAULT 'USUARIO' NOT NULL`.

- **Supabase (Postgres):** acrescentada sozinha na subida (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, em `backend/src/main/resources/db/supabase/schema.sql`).
- **Oracle:** `database/ddl_tabelas_fintech.sql` (banco novo) já inclui a coluna e `database/ddl_evolucao_fase7.sql` traz o `ALTER TABLE` para quem já tem a tabela. Só a branch `deploy` usa a coluna; a `main` e o zip da FIAP não mudaram.

## Limites atuais (importante)

A API ainda **não tem autenticação por token**: o login só confere e-mail e senha e devolve o usuário. Por isso hoje o papel organiza a **tela** (o que cada pessoa vê), mas a API em si não bloqueia chamadas feitas por fora do site. A restrição real, no servidor, vem com o login por token (JWT): o servidor passará a identificar quem chama e a recusar (403) o que o papel não permite. Até lá, não trate o papel como proteção de dados.

## Como trocar ou rebaixar o master

- **Trocar de e-mail:** altere `MASTER_EMAIL` no Render. A conta nova é criada (ou promovida), mas a antiga **continua master**: para rebaixar, é preciso mudar `ds_papel` para `USUARIO` direto no banco (SQL Editor do Supabase): `UPDATE T_FIN_USUARIO SET ds_papel = 'USUARIO' WHERE ds_email = '...';`
- **Esqueceu a senha do master:** não há recuperação por e-mail. No banco, apague o hash e recrie a conta, ou edite o perfil logado como outro master.

## Testes

`DadosMasterTest` (JUnit e Mockito, sem banco): usuário novo começa como comum, sem e-mail configurado nada é feito, cria o master com senha válida, não cria com senha curta, promove conta existente sem mexer na senha.