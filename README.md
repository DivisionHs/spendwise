# SpendWise

Aplicação web de **controle financeiro pessoal**: o usuário registra receitas, despesas, dívidas, metas, contas e investimentos, define limites de gasto por categoria e acompanha tudo em painéis com gráficos, alertas e um relatório mensal.

Projeto final de integração da FIAP (Fase 7), que reúne o que foi construído ao longo do ano: user stories e casos de uso (Fase 1), protótipo (Fase 2), modelagem de dados (Fase 3), telas (Fase 4), Java orientado a objetos (Fase 5), Oracle e acesso a dados (Fase 6) e, agora, Spring Boot com React (Fase 7).

**Autor:** Davi Henrick Souza de Jesus (RM 570197), turma 1TDS.

## Sumário

- [Tecnologias](#tecnologias)
- [Telas](#telas)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [API REST](#api-rest)
- [Regras de negócio](#regras-de-negócio)
- [Como executar](#como-executar)
- [Usuário de teste](#usuário-de-teste)
- [Testes](#testes)
- [Do curso para o projeto](#do-curso-para-o-projeto)
- [Estrutura do repositório](#estrutura-do-repositório)

## Tecnologias

| Camada | O que foi usado |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA (Hibernate), driver JDBC do Oracle, Maven Wrapper |
| Banco de dados | Oracle Database da FIAP (`oracle.fiap.com.br`), tabelas `T_FIN_*` |
| Frontend | ReactJS 18 com TypeScript (TSX), Vite, React Router 6, hooks, Context API, `fetch` |
| Testes | JUnit 5 e Mockito (23 testes unitários, sem banco) |

Nenhuma biblioteca além das apresentadas no curso foi adicionada: os gráficos são SVG desenhados no próprio React e o CSS é escrito à mão.

## Telas

Os prints abaixo usam o usuário de teste com dados fictícios.

### Entrada no sistema

**Login.** Valida e-mail e senha no backend (`POST /api/auth/login`). Credenciais erradas mostram a mensagem de erro devolvida pela API (401). Todas as outras telas só abrem com o usuário logado; quem não está autenticado é redirecionado para cá.

![Tela de login](docs/screenshots/01-login.png)

**Cadastro.** Cria uma conta nova (nome, e-mail, CEP e senha). O e-mail precisa ser único e a senha é guardada como hash PBKDF2 com sal, nunca devolvida pela API.

![Tela de cadastro](docs/screenshots/02-cadastro.png)

### Visão geral

**Dashboard.** Conta "a história do seu dinheiro" nos últimos 3, 6 ou 12 meses: receitas, despesas, quanto foi investido e quanto sobrou. O cartão **"O que os números dizem"** resume tudo em uma frase e tem um guia "Como ler esta página". Os gráficos (feitos em SVG) mostram entradas e saídas por mês, para onde vai cada real, o saldo acumulado e as maiores despesas. Clicar num mês foca nele; clicar na legenda esconde uma série.

![Dashboard](docs/screenshots/03-dashboard.png)

**Extrato.** Receitas e despesas numa lista só, da mais recente para a mais antiga, com filtros de período, categoria, tipo e status (concluído ou pendente, quando a data está no futuro), busca por descrição e paginação. Os totais acima da tabela acompanham os filtros. Daqui é possível exportar o que está na tela em CSV, importar um extrato e lançar uma nova receita ou despesa.

![Extrato](docs/screenshots/04-extrato.png)

**Importar extrato.** Lê um CSV do banco (`data;descricao;valor;categoria`), mostra uma prévia linha a linha com os erros encontrados e, ao confirmar, cadastra tudo de uma vez: valor positivo vira receita e valor negativo vira despesa, e o saldo da conta é atualizado.

![Importar extrato](docs/screenshots/05-extrato-importar.png)

**Centro de Análise.** Mostra para onde o dinheiro vai: rosca por categoria e barras mensais com as quatro categorias em que mais se gastou, para ver como os hábitos mudam no tempo.

![Centro de Análise](docs/screenshots/06-centro-de-analise.png)

**Orçamentos.** Limite de gasto por categoria no mês, com barra de progresso e situação: normal, **atenção** (a partir de 80% do limite), **crítico** (a partir de 90%) e **excedido** (acima de 100%). Há um orçamento por categoria e usuário. Ao salvar uma despesa que leva o orçamento a 80% ou mais, a tela avisa na hora.

![Orçamentos](docs/screenshots/07-orcamentos.png)

**Alertas e Insights.** O que merece atenção agora, calculado por regras sobre os dados. **Alertas** (informativo, atenção ou crítico): orçamentos perto do limite ou estourados, categorias que cresceram em relação ao mês anterior, dívidas vencidas ou perto do vencimento e metas com o prazo chegando. **Insights**: qual categoria concentra mais despesas, quanto da renda foi guardada no último mês completo, onde há espaço para economizar e o progresso de cada meta. O texto descreve os números; não é recomendação financeira.

![Alertas e Insights](docs/screenshots/08-alertas-e-insights.png)

**Relatório mensal.** Compara os gastos do mês com os meses anteriores, com variação percentual, a categoria de maior aumento e uma linha com os três meses anteriores.

![Relatório mensal](docs/screenshots/09-relatorio-mensal.png)

### Cadastros

Cada cadastro corresponde a um controller do backend e permite **consultar, inserir, atualizar e remover**. Inserir e editar abrem em uma janela (pop-up) por cima da própria lista, e toda inclusão, alteração ou exclusão passa por uma confirmação com o resumo dos dados.

**Receitas** e **Despesas** trazem métricas, gráfico mensal, ranking, busca e filtros. Criar, alterar ou excluir um lançamento ajusta o saldo da conta corrente do usuário.

![Receitas](docs/screenshots/10-receitas.png)

![Despesas](docs/screenshots/11-despesas.png)

![Janela de nova despesa](docs/screenshots/12-despesa-nova.png)

**Dívidas.** Valor, vencimento e situação. É possível registrar **pagamento parcial** (abate o valor) ou total (quita a dívida).

![Dívidas](docs/screenshots/13-dividas.png)

**Metas.** Valor alvo, prazo e progresso. Cada aporte registrado soma ao valor acumulado e o percentual alcançado é recalculado.

![Metas](docs/screenshots/14-metas.png)

**Contas.** Contas bancárias (corrente ou poupança) com o saldo de cada uma.

![Contas](docs/screenshots/15-contas.png)

**Investimentos.** Aportes por categoria, com gráfico mensal, carteira por categoria e o risco da carteira (baixo, moderado, alto). O botão **Categorias** abre o cadastro de categorias de investimento.

![Investimentos](docs/screenshots/16-investimentos.png)

**Categorias de investimento.** Tipos de investimento e o risco de cada um, com quanto já foi aportado. Não permite excluir uma categoria que já tem investimentos.

![Categorias de investimento](docs/screenshots/17-categorias.png)

**Usuários.** O cartão "Seu perfil" e a lista de usuários cadastrados. A exclusão fica bloqueada para o próprio usuário logado e para quem já tem lançamentos, com o motivo ao passar o mouse.

![Usuários](docs/screenshots/18-usuarios.png)

### Erro e celular

**Página de erro personalizada.** Qualquer endereço que não existe cai numa página 404 do próprio sistema, com caminho de volta.

![Página de erro 404](docs/screenshots/19-pagina-de-erro.png)

**Versão para celular.** No celular o menu lateral vira uma barra no topo com botão hambúrguer e uma gaveta que fecha ao navegar, ao tocar fora, no X ou com Esc. No computador, o menu pode ser recolhido para mostrar só os ícones.

| Dashboard | Menu |
|---|---|
| ![Dashboard no celular](docs/screenshots/20-celular-dashboard.png) | ![Menu no celular](docs/screenshots/21-celular-menu.png) |

## Arquitetura

```
React (Vite, TypeScript)  --fetch-->  RestController  ->  Service  ->  Repository (JPA)  ->  Oracle
   páginas, hooks, contexto            GET POST PUT DELETE     regras        Spring Data       T_FIN_*
```

**Backend** (`backend/src/main/java/br/com/fiap/spendwise/`)

| Pacote | Responsabilidade |
|---|---|
| `model` | Entidades JPA. `Receita` e `Despesa` herdam da classe abstrata `Transacao` (herança e polimorfismo da Fase 5): cada uma sabe o seu efeito no saldo |
| `model/enums` | `CategoriaDespesa`, `TipoConta`, `SituacaoOrcamento` |
| `repository` | Interfaces `JpaRepository` |
| `service` | Regras de negócio, validações e cálculos (saldo, orçamentos, análise, resumo) |
| `controller` | `@RestController` com GET, POST, PUT e DELETE e os códigos HTTP corretos |
| `exception` | Exceções personalizadas e um único `@RestControllerAdvice` (`TratadorDeErros`) |
| `dto` | Objetos de entrada e saída (resumo, alertas, status de orçamento) |
| `config` | CORS e carga inicial do usuário de teste |

**Frontend** (`frontend/src/`)

| Pasta | Conteúdo |
|---|---|
| `pages` | Uma pasta por tela (receitas, despesas, dívidas, metas, contas, investimentos, categorias, usuários, orçamentos, extrato, análise) |
| `components` | `Layout`, `ListaCrud` e `FormularioCrud` (recebem colunas, campos e funções por props), `JanelaFormulario`, gráficos em SVG, `Analise` |
| `hooks` | `useLista`, `useRegistro`, `useFinancas` |
| `context` | `AuthContext` (usuário logado) e `DialogosContext` (confirmações e avisos) |
| `services` | `api.ts` (chamadas REST tipadas), agregações e análise |
| `tipos.ts` | Interfaces TypeScript do domínio |

## Modelo de dados

Nove entidades (o enunciado pedia no mínimo três), todas com Model, Repository, Service, Controller e tela.

| Entidade | Tabela Oracle | Origem no curso |
|---|---|---|
| Usuário | `T_FIN_USUARIO` | Fase 3 |
| Receita | `T_FIN_RECEITA` | Fase 3 |
| Despesa (com categoria) | `T_FIN_DESPESA` | Fase 3 e US01 da Fase 1 |
| Dívida | `T_FIN_DIVIDA` | Fase 3 e classe `Divida` da Fase 5 |
| Meta | `T_FIN_METAS` | Fase 3 e classe `Meta` da Fase 5 |
| Conta bancária | `T_FIN_CONTA` | Fase 6 |
| Categoria de investimento | `T_FIN_CAT_INVEST` | Fase 3 |
| Investimento | `T_FIN_INVESTIMENTO` | Fase 3 |
| Orçamento | `T_FIN_ORCAMENTO` | US03 da Fase 1 |

Os scripts estão em `database/`: `ddl_tabelas_fintech.sql` cria todas as tabelas em um banco novo e `ddl_evolucao_fase7.sql` acrescenta apenas o que falta a quem já tem o esquema da Fase 6. A tabela `T_FIN_LOG_CHAT` (telemetria do chatbot das Fases 2 e 3) é criada pelo DDL, mas não tem tela porque este projeto não tem chatbot.

## API REST

Base: `http://localhost:8080/api`. Em receitas, despesas, dívidas, metas, contas, orçamentos e investimentos, `?idUsuario=` filtra a listagem. Exemplos prontos em [`docs/requisicoes-api.http`](docs/requisicoes-api.http).

| Recurso | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/usuarios`, `/receitas`, `/despesas`, `/dividas`, `/metas`, `/contas`, `/categorias-investimento`, `/investimentos` | lista e `/{id}` | cria | `/{id}` | `/{id}` |
| `/orcamentos` | lista, `/{id}` e `/status` | cria | `/{id}` | `/{id}` |
| `/dividas/{id}/pagamentos` | | paga (parcial ou total) | | |
| `/metas/{id}/progressos` | | registra progresso | | |
| `/auth/login` | | login | | |
| `/resumo/{idUsuario}` | totais e saldos | | | |
| `/analise/{idUsuario}` | alertas e insights | | | |

| Situação | Código |
|---|---|
| Consulta ou atualização com sucesso, login correto | 200 OK |
| Criação com sucesso (cabeçalho `Location`) | 201 Created |
| Exclusão com sucesso (sem corpo) | 204 No Content |
| Dado inválido, regra violada, JSON malformado | 400 Bad Request |
| Login com e-mail ou senha incorretos | 401 Unauthorized |
| Registro inexistente | 404 Not Found |
| E-mail ou orçamento repetidos, exclusão de registro em uso | 409 Conflict |
| Erro inesperado | 500 Internal Server Error |

**Exceções personalizadas.** Todas herdam de `SpendWiseException`, que carrega o código HTTP, e o `TratadorDeErros` as traduz em um JSON padronizado (`timestamp`, `status`, `erro`, `mensagem`, `caminho`): `RegraNegocioException` e filhas (400), `RecursoNaoEncontradoException` (404), `ConflitoException` e filhas (409) e `NaoAutorizadoException` e filha (401).

## Regras de negócio

- **Usuário:** nome obrigatório; e-mail válido e único; CEP com 8 dígitos; senha com no mínimo 6 caracteres; não exclui quem já tem registros.
- **Receita e Despesa:** valor maior que zero, descrição e data obrigatórias; despesa exige categoria. Criar, alterar e excluir ajustam o saldo da conta corrente.
- **Conta:** banco, agência e número obrigatórios; tipo `CORRENTE` ou `POUPANCA`; saldo inicial não negativo.
- **Dívida:** pagamento parcial abate o valor e, se cobrir tudo, quita; dívida quitada não recebe pagamento.
- **Meta:** valor alvo maior que zero; prazo que não esteja no passado; progresso soma ao acumulado.
- **Orçamento:** limite maior que zero; um por usuário e categoria; normal até 80%, atenção a partir de 80%, crítico a partir de 90%, excedido acima de 100%.
- **Categoria de investimento:** nome único; risco `BAIXO`, `MODERADO` ou `ALTO`; não exclui categoria com investimentos.
- **Investimento:** usuário e categoria existentes; valor maior que zero; data não futura.

## Como executar

**Pré-requisitos:** JDK 17 ou superior, Node.js 18 ou superior, acesso à rede da FIAP para alcançar `oracle.fiap.com.br:1521`. Não é preciso instalar o Maven (o projeto traz o Maven Wrapper).

**1. Banco de dados.** No SQL Developer, conectado com o seu usuário RM, execute `database/ddl_tabelas_fintech.sql` (banco novo) ou `database/ddl_evolucao_fase7.sql` (já tem o esquema da Fase 6).

**2. Backend.** Na pasta `backend`, informe a senha do Oracle por variável de ambiente e suba a API em `http://localhost:8080`:

```powershell
# Windows (PowerShell)
$env:DB_PASSWORD = "sua_senha_oracle"
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
export DB_PASSWORD="sua_senha_oracle"
./mvnw spring-boot:run
```

Para usar outro usuário, defina também `DB_USER` (o padrão é `RM570197`). Atenção: três tentativas de login erradas bloqueiam o usuário da FIAP. Na primeira execução o backend cria o usuário de teste com dados de exemplo.

**3. Frontend.** Em outro terminal, na pasta `frontend`:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O frontend espera a API em `http://localhost:8080/api` (ajustável por `VITE_API_URL`, veja `frontend/.env.example`).

## Usuário de teste

| Campo | Valor |
|---|---|
| E-mail | `teste@spendwise.com` |
| Senha | `Teste@123` |

## Testes

- **Unitários (JUnit e Mockito, sem banco):** `.\mvnw.cmd test` na pasta `backend`. São 23 testes cobrindo a herança de `Transacao`, o pagamento de dívidas, o progresso de metas, o cálculo de orçamentos (incluindo os limites de 80%, 90% e 100%), as regras de despesa, o hash de senha e o tratador de exceções.
- **API contra o Oracle:** 84 chamadas verificadas (todos os verbos, status HTTP, regras de negócio, login, resumo, saldo da conta, dívidas, metas, orçamentos e alertas).
- **Frontend:** `npm run build` (`tsc -b` em modo estrito e build do Vite) sem erros, e as telas conferidas no navegador, incluindo a versão para celular.

## Do curso para o projeto

| Fase | O que foi pedido ou ensinado | Onde está no projeto |
|---|---|---|
| 1 | US01 a US05 e casos de uso (inclui importar extrato) | Despesas com categoria, Centro de Análise, Orçamentos com alertas a 80% e acima de 100%, Relatório mensal, confirmação antes de editar e excluir, Importar extrato |
| 2 | Telas: Dashboard, Extrato, Centro de Análise, Orçamentos, Alertas e Insights | As cinco telas, com o mesmo nome e a mesma ideia |
| 3 | Modelo lógico e físico | `database/ddl_tabelas_fintech.sql` |
| 4 | Telas com a identidade visual slate, verde, rosa e âmbar | Mesma paleta (CSS próprio). O dashboard em HTML e Tailwind está em [`fase-4-dashboard-html`](fase-4-dashboard-html) |
| 5 | `Transacao` abstrata, `Receita`, `Despesa`, `Divida.pagarParcial`, `Meta.registrarProgresso`, exceções | Mesmos nomes e métodos nas entidades; exceções viram exceções personalizadas |
| 6 | DDL, DML e acesso ao Oracle da FIAP | JPA sobre as mesmas tabelas, pacotes por responsabilidade, hierarquia de exceções |
| 7 | Spring Boot (Controller, Service, Repository, status HTTP), React, Router, hooks, Context API, `fetch` | Todo o projeto |

## Estrutura do repositório

```
backend/                  API Java / Spring Boot (Maven)
frontend/                 aplicação ReactJS com TypeScript (Vite)
database/                 scripts DDL do Oracle
docs/                     requisições da API (.http) e prints das telas
fase-4-dashboard-html/    entrega da Fase 4: dashboard em HTML e Tailwind CSS
```

---

Desenvolvido por **Davi Henrick** para fins acadêmicos (FIAP).
