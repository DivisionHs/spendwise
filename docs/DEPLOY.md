# Publicação (branch `deploy`)

| Parte | Onde | Configuração |
|---|---|---|
| Frontend | Vercel | Root Directory `frontend`, Vite, variável `VITE_API_URL` apontando para a API (`https://ENDERECO-DA-API/api`) |
| Backend | Render (Docker) | Root Directory `backend`; variáveis `DB_USER`, `DB_PASSWORD` e `SPENDWISE_CORS_ORIGENS` (endereço do frontend, sem barra no final) |
| Banco | Oracle da FIAP | Já configurado pelas variáveis acima |

A senha do banco não fica em nenhum arquivo do repositório: só nas variáveis de ambiente do Render.

## Variáveis de ambiente do backend (Render)

| Variável | Para que serve |
|---|---|
| SUPABASE_DB_URL, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD | Conexão com o Postgres do Supabase (pooler de sessão, IPv4) |
| SPENDWISE_CORS_ORIGENS | Endereço do frontend, sem barra e sem caminho no final |
| MASTER_EMAIL, MASTER_NOME, MASTER_PASSWORD | Conta do administrador, criada ou promovida na subida |
| JWT_SECRET | Segredo do login por token (mínimo de 32 caracteres aleatórios) |

Depois de salvar variáveis no Render, faça um **deploy** (Manual Deploy, Deploy latest commit): o Restart service não pega as variáveis salvas depois do último deploy.

## Monitor de disponibilidade (UptimeRobot)

Um monitor HTTP consulta `GET /api/saude` a cada 5 minutos. Isso mantém o Render acordado (o plano gratuito dorme após 15 minutos sem acesso) e o Supabase ativo (projetos sem uso são pausados), e avisa por e-mail se a API cair. Use sempre uma rota **pública**: se o monitor apontar para uma rota que exige token, ele recebe 401 e acusa a API como fora do ar.
