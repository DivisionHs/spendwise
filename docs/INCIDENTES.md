# Registro de incidentes

Todo problema que afetou, ou pareceu afetar, o SpendWise em produção, com o que aconteceu, a causa e o que mudou para não se repetir. Sem culpa: o objetivo é aprender. Alterações do produto estão em [`CHANGELOG.md`](CHANGELOG.md).

| ID | Data | O que aconteceu | Impacto |
|---|---|---|---|
| [INC-001](#inc-001) | 05 a 06/11/2026 | Monitor acusou o servidor como fora do ar | Nenhum usuário; 33 min 41 s de alerta falso |
| [INC-002](#inc-002) | 05/11/2026 (noite) | Login do site não conversava com a API | Login impossível pelo site até corrigir |
| [INC-003](#inc-003) | 05/11/2026 (noite) | `/login` direto e F5 davam 404 | Só quem digitava o endereço direto |
| [INC-004](#inc-004) | 05/11/2026 (22h a 23h11) | Conta master não era criada | Nenhum; recurso novo |
| [INC-005](#inc-005) | 05/11/2026 (noite) | Usuária comum via a lista de usuários | Exposição de nomes e e-mails na tela |
| [INC-006](#inc-006) | 05/11/2026 (noite) | Quase-incidente: endereço do backend era de outro aplicativo | Nenhum; evitado antes de apontar o frontend |

## INC-001

**Monitor acusou o servidor como fora do ar (05/11 23:33:56 a 06/11 cerca de 00:07).**

- **Impacto:** nenhum usuário foi afetado: o site abria, o login respondia em menos de 200 ms. O monitor enviou alertas de queda por 33 minutos e 41 segundos.
- **Linha do tempo:** 23:32 o login por token entra no ar. 23:33:56 o monitor registra 401 e abre o incidente. Cerca de 23:50 a causa é confirmada (a rota monitorada passou a exigir token). Rota pública criada e publicada. O monitor continua em queda. Cerca de 00:05 o registro do incidente mostra a requisição como `HEAD`. Correção publicada, monitor volta a Up cerca de 00:07.
- **Causa raiz (dupla):** (1) o monitor consultava uma rota de negócio que passou a exigir token, e o monitor trata 401 como queda. (2) A rota de saúde criada para ele só liberava `GET`, e o monitor usa `HEAD`.
- **Correção:** `GET` e `HEAD` públicos em `/api/saude`, que não devolve dado nenhum e só faz uma consulta simples ao banco (mantém também o Supabase ativo). Monitor apontado para a rota nova. Testes para as duas rotas e para o `HEAD` em outras rotas continuar exigindo token.
- **O que funcionou:** o alerta chegou rápido; o painel guarda o registro de cada verificação.
- **O que não funcionou:** a primeira correção foi testada só com `GET`.
- **Lições e ações:** monitor deve usar rota pública e estável; ao fechar uma API, listar tudo o que a consultava sem credencial; testar com o mesmo método do monitor (`curl -I`).

## INC-002

**Login do site não conversava com a API (noite de 05/11).**

- **Impacto:** quem abria o site publicado não conseguia entrar. Sem usuários reais ainda.
- **Causa:** a variável de origem permitida (CORS) estava com `/login` no final. A origem deve ser só o endereço do site, sem caminho.
- **Correção:** valor trocado para o endereço puro. O teste de pré-verificação passou a liberar só o site e a recusar outras origens.
- **Lição:** variável de CORS é endereço, não página; conferir com um teste de `OPTIONS`.

## INC-003

**`/login` direto e F5 em rotas internas davam 404 na Vercel (noite de 05/11).**

- **Impacto:** quem digitava o endereço de uma tela interna ou atualizava a página caía numa página de erro; a navegação dentro do site funcionava.
- **Causa:** o site foi publicado a partir da `main`, que não tinha `frontend/vercel.json` com a regra de rotas do React Router (existia um `vercel.json` na raiz, sem efeito).
- **Correção:** publicar a partir da branch `deploy`, que tem o arquivo certo.
- **Lição:** sistema de uma página só precisa de regra de reescrita no servidor; testar o endereço direto de uma rota interna, não só clicar.

## INC-004

**Conta master não era criada (05/11, 22h a 23h11).**

- **Impacto:** nenhum; recurso novo, sem usuário dependendo dele.
- **Causa:** as variáveis foram salvas com "Save only" e o **Restart service** do Render reinicia com as variáveis do último deploy. O backend leu `MASTER_EMAIL` vazio e saiu em silêncio, sem nada no log.
- **Correção:** Manual Deploy (Deploy latest commit).
- **Lição:** depois de salvar variáveis, fazer deploy; "sem log" pode significar "saiu cedo por configuração vazia"; vale registrar um aviso quando uma configuração opcional é ignorada.

## INC-005

**Usuária comum via a lista de usuários (noite de 05/11).**

- **Impacto:** nomes e e-mails de outros usuários visíveis na tela dela.
- **Causa:** o navegador tinha a versão antiga do site na memória, de antes da regra de papéis. O site publicado já estava certo.
- **Correção:** recarregar com Ctrl+F5. A causa de fundo (a API respondia a qualquer um) foi resolvida logo depois com o login por token e a autorização no servidor (versão 1.4.0).
- **Lição:** restrição só na tela não protege dado; a proteção tem que estar na API.

## INC-006

**Quase-incidente: endereço do backend era de outro aplicativo (noite de 05/11).**

- **Impacto:** nenhum. O endereço `spendwise.onrender.com` pertencia a um aplicativo de terceiros; o serviço recebeu um endereço com sufixo.
- **Risco evitado:** apontar o frontend para o endereço errado enviaria dados de usuários para um aplicativo desconhecido.
- **Lição:** conferir sempre o endereço que o painel mostra.