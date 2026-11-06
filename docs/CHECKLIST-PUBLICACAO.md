# Checklist antes de divulgar o SpendWise

O objetivo é divulgar a ferramenta só quando ela estiver **minimamente funcional e sem falhas de segurança conhecidas**. Marque cada item quando estiver feito e testado.

## Segurança

- [ ] **Limite de tentativas no login** (bloquear ou atrasar depois de várias senhas erradas), para impedir tentativa de senha em massa.
- [ ] **Política de senha** (tamanho mínimo maior que 6 e recusa de senhas óbvias).
- [ ] **Cadastro aberto**: decidir se continua aberto, passa a exigir convite ou ganha confirmação de e-mail.
- [ ] **Token**: avaliar cookie `httpOnly` no lugar do `localStorage` e renovação do token.
- [ ] **Dependências**: rodar `npm audit` (há avisos do Vite e do React Router) e atualizar o Spring Boot para o último patch da série 3.3.
- [ ] **Cabeçalhos de segurança** no site (política de conteúdo, `X-Content-Type-Options`, `Referrer-Policy`), além do HTTPS que a Vercel já força.
- [ ] **CORS**: confirmar que só o endereço do site está liberado.
- [ ] **Respostas de erro** sem detalhes internos (nada de pilha de erro ou nome de tabela) e `/` do backend respondendo 404 em vez de 500.
- [ ] **Logs** sem dados pessoais (e-mails, senhas, tokens).
- [ ] **Segredos**: nenhuma senha ou chave no repositório nem no histórico; variáveis só no painel do Render; remover `DB_USER` e `DB_PASSWORD` do Oracle, que não são mais usados.
- [ ] **Dados pessoais no repositório**: sem RM, e-mails ou nomes de terceiros nos arquivos (conferido por varredura).
- [ ] **Backup do banco**: exportar os dados com regularidade; o plano gratuito do Supabase não garante backup.

## Funcional (roteiro de teste de ponta a ponta, no site publicado)

- [ ] Cadastro, login, sair e entrar de novo; sessão vencida volta ao login com aviso.
- [ ] Conta bancária, receita e despesa: o saldo da conta acompanha os lançamentos.
- [ ] Orçamento: aviso ao chegar a 80% e ao estourar; alertas e relatório mensal.
- [ ] Dívida (pagamento parcial e total) e meta (progresso).
- [ ] Investimento e categorias (só o master altera as categorias).
- [ ] Importar extrato em CSV e exportar.
- [ ] Usuário comum só vê os próprios dados; master vê tudo.
- [ ] Modo escuro e versão para celular.
- [ ] Mensagem amigável quando o servidor está acordando (o primeiro acesso do dia no plano gratuito pode demorar).
- [ ] Monitor de disponibilidade verde por pelo menos 48 horas.

## Divulgação

- [ ] Sem o endereço do backend em prints, vídeos e textos.
- [ ] Sem dados reais de ninguém nas imagens: usar uma conta de demonstração com valores fictícios.
- [ ] Texto sem prometer o que ainda não existe (o chatbot, por exemplo, é plano futuro).