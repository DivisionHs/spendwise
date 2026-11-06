# Diário do projeto SpendWise

Alterações por versão: [`CHANGELOG.md`](CHANGELOG.md). Problemas em produção: [`INCIDENTES.md`](INCIDENTES.md). Registro cronológico do que foi feito, decidido e corrigido, com os problemas encontrados e o que cada um ensinou. Atualizado a cada etapa. Horários no fuso de Brasília.

## Como ler

- **Feito**: o que entrou no projeto.
- **Problema e solução**: o que deu errado e como foi resolvido.
- **Decisão**: por que o caminho foi esse.
- **Estado**: como o projeto ficou ao fim da etapa.

---

## 05/11/2026 (quinta-feira): entrega da FIAP, publicação e segurança

### Manhã e tarde: projeto final da Fase 7

**Contexto.** Projeto final de integração da FIAP: backend Spring Boot com Oracle e frontend React, entrega individual até 00:00 de 05/11.

**Feito**
- Validação do projeto contra o enunciado e contra o que cada fase ensinou (user stories e casos de uso da Fase 1, telas da Fase 2, modelo de dados da Fase 3, identidade visual da Fase 4, orientação a objetos da Fase 5, Oracle da Fase 6).
- Backend com **9 entidades** (o mínimo pedido eram 3): Usuário, Receita, Despesa, Dívida, Meta, Conta, Categoria de investimento, Investimento e Orçamento. Cada uma com Model, Repository, Service e Controller. Receita e Despesa herdam de `Transacao`.
- **Exceções personalizadas** (`SpendWiseException` e filhas) e um único tratador central, atendendo ao feedback do professor na Fase 6 (pacotes organizados e tratamento de exceções).
- **23 testes unitários** (JUnit e Mockito, sem banco).
- Frontend convertido para **TypeScript** (`strict` ligado), `tsc -b` com zero erros.
- Telas: Dashboard, Extrato (filtros, paginação, exportar e importar CSV), Centro de Análise, Orçamentos, Alertas e Insights, Relatório mensal e um CRUD para cada entidade. Gráficos em SVG feitos à mão.
- Cartão "O que os números dizem" passou a ter botão para fechar e reabrir; botões do Extrato ganharam ícones e cores (despesa em rosa).
- Categorias de investimento saiu do menu lateral e passou a abrir pelo botão "Categorias" dentro de Investimentos (a página continua, pois o enunciado pede uma página por controller).
- API validada contra o Oracle da FIAP: 84 chamadas, todas corretas.
- Zip final montado e validado em pasta limpa (`npm install`, `npm run build`, `mvnw package` com os testes).

**Problemas e soluções**
- O zip foi criado com barras invertidas (`\`) nos caminhos, o que quebraria a estrutura em Mac e Linux. Foi refeito com barras normais (`/`).
- A conexão com o Oracle deveria vir configurada com as credenciais do aluno (feedback da Fase 6). O zip entregue passou a trazer a conexão pronta, e isso foi testado subindo o backend do zip extraído sem nenhuma variável de ambiente.

**Decisão.** Credenciais ficam só no zip entregue: o repositório público do GitHub usa o placeholder `SUA_SENHA_AQUI` e, em hospedagem, as senhas vêm só de variáveis de ambiente.

### Tarde: repositório no GitHub

**Feito**
- A entrega da Fase 4 (dashboard em HTML e Tailwind) foi movida para `fase-4-dashboard-html/` com `git mv`, preservando o histórico, e o projeto novo ficou na raiz.
- README estruturado com 21 prints de tela (tirados em alta resolução com o Edge automatizado) e uma explicação de cada tela.

**Problema e solução.** Em dois momentos o GitHub recusou os envios com `fatal error in commit_refs_rules`, um erro interno dele, sem incidente na página de status. Repetir o envio mais tarde resolveu.

### Fim da tarde e noite: publicação na internet

**Arquitetura de hospedagem:** frontend na **Vercel**, backend em **Docker no Render**, banco primeiro no Oracle da FIAP e depois no **Supabase**.

**Feito**
- Branch `deploy` com `backend/Dockerfile`, `server.port=${PORT:8080}` e `frontend/vercel.json`.
- Frontend na Vercel (Root Directory `frontend`, variável `VITE_API_URL`), backend no Render com variáveis de ambiente para o banco e o CORS.

**Problemas e soluções**
1. **Endereço de outro aplicativo.** `spendwise.onrender.com` já era de outro projeto (um app Rails). O serviço recebeu um endereço com sufixo. Lição: conferir sempre o endereço que o painel mostra; nunca apontar o `VITE_API_URL` para um domínio que não é seu.
2. **CORS com caminho.** A variável de origem permitida estava com `/login` no final. A origem não pode ter caminho: corrigido para o endereço puro. Depois disso o preflight liberou só o site da Vercel e recusou outras origens.
3. **`/login` direto dava 404 na Vercel.** O site foi publicado a partir da `main`, que não tinha o `vercel.json` certo (existia um na raiz, sem efeito). Solução: publicar a partir da branch `deploy`, que tem `frontend/vercel.json`.
4. **Branch sem deploy na Vercel.** A Vercel só cria deploy de uma branch quando recebe um envio novo; foi preciso um commit novo na `deploy` para ela aparecer.
5. **Lentidão.** Causas: o plano gratuito do Render dorme após 15 minutos sem acesso (acordar leva perto de um minuto) e a distância entre o backend (Oregon, EUA) e o Oracle da FIAP (Brasil), pagando um trajeto por consulta.

### Noite: banco no Supabase e monitor

**Decisão.** Trocar o banco pelo Supabase (Postgres), na região **West US (Oregon)**, a mesma do Render. Resultado: respostas de cerca de 0,28 s, contra mais de 1 s com o Oracle.

**Feito**
- Projeto `spendwise` criado no Supabase, plano gratuito. A **Data API foi desligada**: o backend fala direto com o Postgres, e a API automática exporia as tabelas na internet.
- Conexão pelo **Session pooler** (IPv4), porque a conexão direta do Supabase é só IPv6 e o Render fala IPv4.
- Perfil Spring `supabase` e esquema em `backend/src/main/resources/db/supabase/schema.sql`, executado na subida com `CREATE TABLE IF NOT EXISTS` (sem script manual). O usuário de teste público do README não é criado em hospedagem.
- Variáveis novas (`SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`), com nomes diferentes das do Oracle para o site não cair durante a troca.
- Monitor no **UptimeRobot** a cada 5 minutos no endereço da API: mantém o Render acordado e o Supabase ativo (projetos sem uso são pausados no plano gratuito; os outros três projetos da conta apareciam pausados).

**Problema e solução.** Um teste que criava e apagava dados de teste no banco de produção foi bloqueado pelo sistema de permissões. O teste não foi contornado: a conferência passou a ser feita pela tela, com o cadastro real de uma usuária.

**Estado.** Cadastro e login funcionando no banco novo; a primeira conta real foi criada pelo site.

### Noite: papéis de usuário e conta master

**Feito**
- Dois papéis: `USUARIO` (padrão) e `MASTER` (administrador). Coluna `ds_papel` em `T_FIN_USUARIO`, criada sozinha no Supabase.
- O papel é **somente leitura na API**: cadastro e edição ignoram o campo, então ninguém se promove sozinho.
- `DadosMaster`: na subida, cria ou promove a conta de `MASTER_EMAIL` a master; a senha inicial vem de `MASTER_PASSWORD` e só vale se a conta ainda não existe. A senha nunca passa por arquivo.
- Frontend: selo **Master** no menu e no perfil; a tela Usuários completa (lista, análise, cadastro) só para o master.
- Para quem não é master, o item "Usuários" virou **Meu perfil**, e o bloco com foto e nome no rodapé do menu abre o perfil.
- Documento `docs/USUARIOS-E-PLANOS.md`. Mais 6 testes (29 no total).
- Pull request nº 1 (`deploy` para `main`) ganhou título e descrição estruturada em português.

**Problemas e soluções**
1. **Conta master não era criada.** As variáveis estavam corretas, mas foram salvas com "Save only" e o **Restart service** do Render reinicia com as variáveis do último deploy, não com as novas. O backend viu `MASTER_EMAIL` vazio e saiu sem registrar nada. Solução: **Manual Deploy > Deploy latest commit**. Lição: depois de salvar variáveis, sempre fazer um deploy; para investigar, lembrar que "sem log" pode significar "saiu cedo por configuração vazia".
2. **Lista de usuários aparecendo para a usuária comum.** O navegador dela tinha a versão antiga do site na memória. Recarregar com Ctrl+F5 resolveu; o site publicado já tinha a regra certa (conferido no código servido).
3. **Dois nomes de senha confundiam.** `SUPABASE_DB_PASSWORD` é a senha do backend no banco; `MASTER_PASSWORD` é a senha de login do administrador no app. São coisas diferentes e agora estão distinguidas no `docs/DEPLOY.md`.

### Noite: login por token na API

**Motivo.** Até aqui, o login só existia na tela: a API respondia a qualquer pessoa que descobrisse o endereço, e a restrição por papel era só visual.

**Feito**
- **Token JWT** (HMAC-SHA256) gerado só com o JDK, sem biblioteca nova. O login devolve `token`, e toda a API (menos login e cadastro) exige `Authorization: Bearer`.
- O servidor busca o usuário no banco a cada chamada, então exclusão e mudança de papel valem na hora.
- **Autorização no servidor** (403): usuário comum só vê e altera o que é dele; o master vê tudo; categorias de investimento são compartilhadas (só o master altera); o dono do registro é conferido também no corpo de POST e PUT, para ninguém gravar na conta de outra pessoa.
- Erros 401 e 403 em JSON, no mesmo formato dos outros erros.
- Frontend: token no `localStorage` (a pessoa continua logada por dias), cabeçalho em toda chamada, volta ao login com "Sua sessão expirou" quando a API recusa o token, e telas que só carregam o que o papel permite.
- Documento `docs/AUTENTICACAO.md`. **58 testes** passando, incluindo um teste da camada web com MockMvc (401, 403, criar em nome próprio e de outra pessoa, usuário excluído, login público, CORS).

**Decisão.** Implementação própria do token (JDK) em vez de Spring Security e uma biblioteca de JWT: menos dependências, menos configuração a conflitar com o CORS e comportamento todo coberto por teste. Spring Security continua sendo uma opção futura.

**Pendência que a mudança cria, resolvida às 23:43.** Definir `JWT_SECRET` (mínimo de 32 caracteres aleatórios, gerado pelo autor com o gerador do sistema) nas variáveis do Render e fazer um deploy. Antes disso, o segredo era temporário e todos eram desconectados a cada reinício; o log do deploy novo não traz mais o aviso.

### Noite: modo escuro

**Feito**
- Botão **Escuro/Claro** no rodapé do menu e no canto da tela de login. A escolha fica guardada no navegador; sem escolha, vale a preferência do sistema. Um script no `index.html` aplica o tema antes de desenhar a página, para ela não piscar clara no modo escuro.
- O CSS (cerca de 2.000 linhas) usava cores fixas em vários lugares. As superfícies, textos e bordas de fundo claro foram trocados por **variáveis semânticas** (`--fundo`, `--superficie`, `--texto`, `--borda` e outras); o modo escuro redefine só essas variáveis (atributo `data-tema="escuro"` no `<html>`). O que já era escuro (menu, cartão de análise, dicas) não mudou.
- Cores pastel de alertas e etiquetas viram tons translúcidos no escuro; links ficam em verde claro; campos de formulário e controles nativos seguem o tema (`color-scheme`); a impressão sai sempre no tema claro.
- Prints dos dois temas conferidos com o navegador automatizado e uma API simulada (sem erros de página). Dois prints do modo escuro entraram no README.

**Problemas e soluções**
1. Os botões de tema e de sair empurraram o item "Usuários" para fora da área visível do menu em telas baixas. Solução: os dois ficam lado a lado no rodapé (um sobre o outro só no menu recolhido).
2. O campo de busca ficou mais claro que os outros campos no escuro (usava o fundo padrão do navegador). Solução: regra de baixa especificidade que aplica a cor do tema aos campos sem estilo próprio.
3. O rótulo "Modo escuro" quebrava em duas linhas no botão estreito: virou "Escuro" e "Claro".
4. Um erro no próprio script de captura: uma variável chamada `URL` escondia a classe `URL` do Node.
### Noite: monitor de disponibilidade fora do ar

**Sintoma.** O UptimeRobot passou a acusar o servidor do SpendWise como fora do ar, embora o site abrisse e o login respondesse.

**Causa.** O monitor consultava `GET /api/categorias-investimento`, uma rota que antes era aberta e passou a exigir token com o login por token. Sem token, a API responde 401, e o monitor entende qualquer resposta de erro como queda. O servidor estava vivo: o problema foi consequência da mudança de segurança.

**Correção.** Nova rota pública `GET /api/saude`, que não devolve dado nenhum: só responde 200 se a API e o banco atendem uma consulta simples (`select 1`), ou 503 se o banco falhar. Como a consulta passa pelo banco, o monitor continua mantendo o Supabase ativo. O monitor foi apontado para essa rota. Dois testes novos (60 no total). **Segunda falha, achada no registro do incidente:** o UptimeRobot verifica com o método `HEAD` e não com `GET`, e a rota só liberava `GET`, então o monitor continuou recebendo 401. A correção liberou também o `HEAD` na rota de saúde (e só nela), com mais dois testes (62 no total).

**Lição.** Monitor de disponibilidade deve usar uma rota pública e estável, e não uma rota de negócio. Ao fechar a API com token, listar tudo o que a consultava sem token (monitor, scripts de teste). E conferir o método que o monitor usa: testar a rota com `curl -I` (HEAD) além do GET antes de apontar o monitor.

### Noite: validação e limpeza de dados pessoais

- O autor testou o login e confirmou que tudo o que foi implementado funciona (token, master, papéis, modo escuro).
- Varredura do repositório atrás de dados pessoais ou sensíveis. Nenhuma senha em arquivos nem no histórico. Encontrado e removido dos arquivos atuais: o número de matrícula (RM) no README e como usuário padrão do Oracle em `application.properties` (agora `SEU_RM`). O RM continua nos commits antigos; apagar do histórico exigiria reescrever commits e forçar o envio, o que não foi feito por ora. Para os próximos commits, o e-mail do autor passou a ser o endereço `noreply` do GitHub.
- Criado `docs/CHECKLIST-PUBLICACAO.md` com o que precisa estar pronto antes de divulgar a ferramenta (segurança, teste de ponta a ponta e divulgação).
---

## Planos futuros

| Item | Descrição |
|---|---|
| **Chatbot** | Assistente de conversa dentro do app para tirar dúvidas e consultar os próprios números (por exemplo, "quanto gastei com lazer este mês?"). A tabela `T_FIN_LOG_CHAT` já existe no modelo de dados desde as Fases 2 e 3, pensada para guardar a telemetria das conversas (início, fim, latência, resolução, sentimento e nota de satisfação), e hoje não tem entidade nem tela. Pontos a decidir: de onde vem a inteligência do chatbot, como ele acessa só os dados de quem está logado (o token já dá essa identidade) e como proteger a privacidade |
| Divulgação da ferramenta | Publicação sobre o SpendWise na semana de 09/11, **só depois** de cumprir o [CHECKLIST-PUBLICACAO.md](CHECKLIST-PUBLICACAO.md) (funcional e sem falhas de segurança conhecidas) |
| Abrir para outras pessoas (uso gratuito) | Convidar um grupo pequeno para testar e dar retorno, depois de cumprir o checklist e de ter política de privacidade e termos de uso |
| Política de privacidade e termos de uso | Necessários antes de receber dados financeiros de outras pessoas (LGPD): quais dados, para quê, por quanto tempo, como excluir e exportar |
| Limite de tentativas no login | Impedir que um robô teste senhas sem parar |
| Cookie `httpOnly` no lugar do `localStorage` | Passo seguinte de segurança para o token |
| Renovação de token | Hoje o token vale 7 dias e depois é preciso entrar de novo |
| Recuperação de senha | Sem isso, quem esquece a senha não tem como voltar |
| Backup do banco | O plano gratuito do Supabase não garante backup: exportar os dados com regularidade |
| Resposta 404 em `/` do backend | Hoje devolve 500, sem efeito para quem usa o site |
| Remover variáveis do Oracle do Render | `DB_USER` e `DB_PASSWORD` não são mais usados |
| Endereço próprio | Domínio no lugar do `.vercel.app` |