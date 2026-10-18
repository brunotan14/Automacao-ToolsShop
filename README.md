<div align="center">

# 🛠️ Automação Toolshop

**Testes E2E do [Practice Software Testing — Toolshop](https://practicesoftwaretesting.com) com Playwright + TypeScript**

[![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Faker](https://img.shields.io/badge/Faker-10-FF6B6B)](https://fakerjs.dev)
[![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![Allure](https://img.shields.io/badge/Allure-3-FF7A00)](https://allurereport.org)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://prettier.io)

</div>

---

## 📖 Sobre

Suíte de testes ponta a ponta para o Toolshop, uma loja de ferramentas de demonstração feita para treinar testes de software. A primeira entrega cobre **cadastro e login**: 18 casos de teste, de validações de formulário a bloqueio de conta.

Os testes seguem três princípios:

- 🔍 **Explorar antes de automatizar.** Cada cenário é executado manualmente no navegador via [Playwright MCP](https://github.com/microsoft/playwright-mcp), e só depois vira código.
- 🧩 **Actions + Fixtures, sem Page Objects.** Funções que agrupam comportamentos de negócio são injetadas nos testes pela fixture `app`. Não há classes nem herança.
- 🧪 **Testes independentes.** Cada teste cria o próprio usuário via API, com dados gerados pelo Faker. Os testes podem rodar em qualquer ordem e em paralelo.

---

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org) 24+
- [Google Chrome](https://www.google.com/chrome/) instalado (os testes usam o canal `chrome`)

### Instalação

```bash
git clone https://github.com/brunotan14/Automacao-ToolsShop.git
cd Automacao-ToolsShop
npm install
```

### Variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz. Sem ele, valem os valores padrão abaixo:

```env
BASE_URL=https://practicesoftwaretesting.com
API_URL=https://api.practicesoftwaretesting.com
```

---

## ▶️ Executando

| Comando                           | O que faz                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run test`                    | Roda a suíte em modo **headless** (sem abrir o navegador)      |
| `npm run test:headed`             | Roda com o navegador visível, útil para depurar                |
| `npm run test:ui`                 | Abre o modo UI do Playwright (watch, time travel, filtros)     |
| `npm run report`                  | Abre o relatório HTML da última execução                       |
| `npm run allure:report`           | Gera e abre o relatório Allure (com histórico entre execuções) |
| `npm run typecheck`               | Verifica os tipos com o compilador TypeScript                  |
| `npm run lint` / `lint:fix`       | Analisa o código com ESLint (com o plugin do Playwright)       |
| `npm run format` / `format:check` | Formata o código com Prettier                                  |

### 📊 Relatórios e evidências

Quando um teste **falha**, o Playwright guarda automaticamente o **trace**, o **screenshot** e o **vídeo** da execução. Eles aparecem nos dois relatórios:

- **Playwright HTML** (`npm run report`): abre o trace direto no navegador, com a linha do tempo, o DOM, a rede e o console.
- **Allure** (`npm run allure:report`): mostra os passos de negócio (`Validar conta bloqueada`, `Validar usuário logado`...), os anexos de cada falha e o histórico entre execuções.

Para rodar um teste específico:

```bash
npx playwright test -g "CT06"
```

---

## 🏗️ Arquitetura

```
.
├── e2e/                        # Specs: apenas testes
│   └── auth/
│       ├── login.spec.ts       # CT01–CT10
│       └── register.spec.ts    # CT11–CT18
├── support/
│   ├── actions/                # Comportamentos de negócio por contexto
│   │   ├── accountActions.ts
│   │   ├── loginActions.ts
│   │   ├── navbarActions.ts
│   │   └── registerActions.ts
│   ├── api/
│   │   └── usersApi.ts         # Preparação de estado via API
│   ├── factories/
│   │   └── userFactory.ts      # Dados aleatórios com Faker
│   └── fixtures.ts             # Fixtures `app` e `user`
├── allurerc.ts                 # Configuração do relatório Allure
└── playwright.config.ts
```

### Camadas

| Camada                               | Responsabilidade                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Specs** (`e2e/`)                   | Contêm só os testes: chamam actions e fazem as asserções. Não têm funções auxiliares.                                 |
| **Actions** (`support/actions/`)     | `create<Contexto>Actions(page)` devolve um objeto com localizadores, interações e validações de negócio (`expect*`).  |
| **API** (`support/api/`)             | Prepara o estado do teste sem passar pela UI, por exemplo o cadastro de usuário.                                      |
| **Factories** (`support/factories/`) | `buildUser(overrides)` gera dados válidos que respeitam as regras do site, e `overrides` monta os cenários negativos. |
| **Fixtures** (`support/fixtures.ts`) | `app` reúne todas as actions; `user` entrega um usuário novo, já cadastrado via API.                                  |

### Como fica um teste

```ts
test('CT07 - conta bloqueada deve recusar a senha correta', async ({ app, user }) => {
  await app.login.failSignIn(user.email, 3);
  await app.login.signIn(user.email, user.password);

  await app.login.expectAccountLocked();
});
```

### Adicionando uma nova action

1. Crie `support/actions/<contexto>Actions.ts` exportando `create<Contexto>Actions(page: Page)`.
2. Registre a action no tipo `App` e na fixture `app` em `support/fixtures.ts`.
3. Use nos testes: `async ({ app }) => { await app.<contexto>.<acao>() }`.

---

## ✅ Cobertura

### 🔐 Login

| ID   | Cenário                                                   |
| ---- | --------------------------------------------------------- |
| CT01 | Login com credenciais válidas                             |
| CT02 | Campos obrigatórios (email e senha)                       |
| CT03 | Email em formato inválido                                 |
| CT04 | Senha muito curta                                         |
| CT05 | Credenciais inexistentes                                  |
| CT06 | Bloqueio da conta após 3 tentativas falhas                |
| CT07 | Conta bloqueada recusa até a senha correta                |
| CT08 | Logout encerra a sessão                                   |
| CT09 | Área logada redireciona para o login quando não há sessão |
| CT10 | Navegação do login para o cadastro                        |

### 📝 Cadastro

| ID   | Cenário                                      |
| ---- | -------------------------------------------- |
| CT11 | Cadastro com dados válidos, seguido de login |
| CT12 | Todos os campos obrigatórios                 |
| CT13 | Email já cadastrado                          |
| CT14 | Cliente menor de 18 anos                     |
| CT15 | Telefone com letras                          |
| CT16 | Email em formato inválido                    |
| CT17 | Senha sem os requisitos de complexidade      |
| CT18 | Checklist de requisitos da senha             |

---

## 📐 Convenções

- **Localizadores, em ordem de preferência:** `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` (o site usa o atributo `data-test`).
- **Asserções:** só `expect` nativo do Playwright, que já espera e tenta de novo sozinho. Nada de `waitForTimeout`.
- **Validações de negócio** que se repetem viram métodos `expect*` nas actions, dentro de `test.step(..., { box: true })`, para a falha apontar a linha do spec.
- **Massa de dados:** emails únicos (`qa.auto.<timestamp>.<sufixo>@example.com`), porque o Toolshop é um ambiente público e compartilhado.
- ⚠️ **Nunca use as contas padrão do site** (ex.: `customer@practicesoftwaretesting.com`) em testes que bloqueiam ou alteram a conta.

---

<div align="center">

Feito com ☕ e Playwright por **Bruno Nathan**

</div>
