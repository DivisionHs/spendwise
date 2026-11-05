# Publicação (branch `deploy`)

| Parte | Onde | Configuração |
|---|---|---|
| Frontend | Vercel | Root Directory `frontend`, Vite, variável `VITE_API_URL` apontando para a API (`https://ENDERECO-DA-API/api`) |
| Backend | Render (Docker) | Root Directory `backend`; variáveis `DB_USER`, `DB_PASSWORD` e `SPENDWISE_CORS_ORIGENS` (endereço do frontend, sem barra no final) |
| Banco | Oracle da FIAP | Já configurado pelas variáveis acima |

A senha do banco não fica em nenhum arquivo do repositório: só nas variáveis de ambiente do Render.
