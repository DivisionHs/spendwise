# Histórico de alterações (changelog)

Tudo o que muda no SpendWise, da versão mais recente para a mais antiga. As versões foram numeradas **retroativamente** em 06/11/2026 (o projeto ainda não usava número de versão). Categorias: Adicionado, Alterado, Corrigido, Segurança e Removido. Problemas em produção ficam registrados à parte, em [`INCIDENTES.md`](INCIDENTES.md); a narrativa do dia a dia está no [`DIARIO.md`](DIARIO.md).

## [1.5.1] 06/11/2026 (madrugada)

### Corrigido
- Monitor de disponibilidade acusava queda sem o servidor cair: nova rota pública `GET /api/saude`, também aceita `HEAD` (INC-001).

### Segurança
- Número de matrícula (RM) removido dos arquivos do repositório; o usuário padrão do Oracle passou a ser o placeholder `SEU_RM`.
- Commits novos usam o e-mail `noreply` do GitHub.

### Adicionado
- `docs/CHECKLIST-PUBLICACAO.md`, `docs/CHANGELOG.md` e `docs/INCIDENTES.md`.
- 4 testes novos (62 no total).

## [1.5.0] 05/11/2026 (noite)

### Adicionado
- **Modo escuro**: botão Escuro/Claro no menu e na tela de login, preferência guardada no navegador, tema do sistema como padrão e script que evita piscar claro.

### Alterado
- Cores do CSS viraram variáveis semânticas; menu com tema e Sair lado a lado.

## [1.4.0] 05/11/2026 (noite)

### Adicionado
- **Login por token (JWT, HMAC-SHA256)**, gerado só com o JDK. Autorização no servidor por papel e por dono do registro (erro 403), conferência do dono no corpo de POST e PUT, `JWT_SECRET` e validade de 7 dias.
- Frontend: token em toda chamada; sessão vencida volta ao login com aviso.
- 29 testes novos (58 no total), incluindo teste da camada web.

### Alterado
- **Mudança que quebra compatibilidade:** toda a API, menos login, cadastro e (depois) saúde, exige `Authorization: Bearer`. Quem consultava a API sem token (monitores, scripts) precisa de ajuste (ver INC-001).
- Sessão do site no `localStorage` (antes `sessionStorage`); categorias de investimento só o master altera.

## [1.3.1] 05/11/2026 (noite)

### Alterado
- Para quem não é master, o item **Usuários** do menu vira **Meu perfil**; o bloco com foto e nome no rodapé do menu abre o perfil.

## [1.3.0] 05/11/2026 (noite)

### Adicionado
- **Papéis** `USUARIO` e `MASTER` (coluna `ds_papel`, somente leitura na API) e criação ou promoção do master na subida, por variáveis de ambiente.
- Selo **Master** no menu e no perfil; tela Usuários completa só para o master.

## [1.2.0] 05/11/2026 (noite)

### Alterado
- **Banco migrado do Oracle da FIAP para o Supabase (PostgreSQL)**, região Oregon, pelo pooler de sessão. Tabelas criadas sozinhas na subida. Resposta de cerca de 0,28 s, contra mais de 1 s.

### Adicionado
- Monitor de disponibilidade (UptimeRobot) a cada 5 minutos.

## [1.1.0] 05/11/2026 (noite)

### Adicionado
- Publicação: frontend na Vercel, backend em Docker no Render (`Dockerfile`, porta por variável, `vercel.json`).

## [1.0.0] 05/11/2026

### Adicionado
- Entrega do projeto final da FIAP (Fase 7): backend Spring Boot com 9 entidades e exceções personalizadas, frontend React em TypeScript, Oracle da FIAP, 23 testes, README com prints.