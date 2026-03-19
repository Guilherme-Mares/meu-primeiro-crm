# Milestone 3: Nível Sênior (Refatoração, Escalabilidade e Governança)

Chegou a hora de elevar o nível do `Meu Primeiro CRM` para padrões exigidos na indústria de software por desenvolvedores Plenos e Seniores. Este milestone foca em robustez, observabilidade, escalabilidade e qualidade.

---

## Issue 9: Dashboard Analítico & KPIs (Visão de Negócios)
**Descrição:** Construir a página principal da aplicação para dar aos gerentes uma visão macro do funil de vendas, algo essencial em qualquer CRM real.
**Tarefas:**
- **Backend:** Criar `GET /api/dashboard/kpis` que retorne total de leads, distribuição por status (ex: 10 Novos, 5 Fechados) e taxa de conversão.
- **Frontend:** Atualizar `index.html` para exibir Cards de Resumo no topo da tela.
- **Gráficos (Opcional Tático):** Integrar a biblioteca `Chart.js` via CDN para mostrar um gráfico de barras ou pizza dinâmico do funil.

## Issue 10: Migração para um Banco de Dados Real (SQL)
**Descrição:** Abandonar o uso de arquivos `.json` usando `fs` e migrar para um banco de dados relacional (SQLite ou PostgreSQL), preparando a aplicação para alta concorrência.
**Tarefas:**
- **Ferramenta:** Instalar um ORM moderno, como o Prisma (`npm install prisma --save-dev` e `npx prisma init`).
- **Esquema:** Modelar as tabelas `User`, `Lead` e `Interaction` no `schema.prisma` refletindo as ForeignKey que já desenhamos.
- **Refatoração:** Reescrever as funções em `funcoes/leads.js` e `funcoes/interacoes.js` para usar o client do banco de dados ao invés de ler e escrever arquivos.

## Issue 11: Padronização de Erros e Validação de Dados (Middlewares)
**Descrição:** Centralizar a forma como a API trata erros e usar uma biblioteca profissional para validar dados de entrada, prevenindo injeções e dados malformados antes de baterem na regra de negócio.
**Tarefas:**
- **Validação:** Instalar uma lib como `zod` ou `joi`.
- **Middleware:** Criar `middlewares/validarSchema.js` para checar os payloads dos `POST /leads` e `POST /interacoes`.
- **ErrorHandler:** Criar um middleware global de tratamento de exceções no `server.js` (`app.use((err, req, res, next) => {...})`) que garanta que o backend nunca "crashe" com erros 500 não tratados.

## Issue 12: CI/CD e Dockerização (DevOps Básico)
**Descrição:** Garantir que o projeto rode da mesma forma em qualquer computador e automatizar os testes, uma competência chave para engenheiros seniores.
**Tarefas:**
- **Docker:** Criar um `Dockerfile` e um `.dockerignore` simples rodando Node.js.
- **Docker Compose:** Criar um `docker-compose.yml` para levantar a aplicação de forma declarativa.
- **CI (Integração Contínua):** Criar uma pasta `.github/workflows/main.yml` que rode o script `npm test` automaticamente no GitHub Actions a cada commit ou Pull Request.

## Issue 13: Revitalização e Padronização da Documentação
**Descrição:** Código não documentado é código legado no momento em que é escrito. O projeto evoluiu de um script CLI para uma API REST + Vanilla JS SPA. Precisamos refletir isso.
**Tarefas:**
- **README.md:** Reescrever descrevendo a nova arquitetura (Backend Node.js/Express, Frontend SPA, Autenticação JWT). Incluir instruções claras de como rodar localmente (explicando sobre o `npm run dev` vs `npm start`).
- **Arquitetura Visual:** Adicionar um diagrama Mermaid simples no README mostrando o fluxo (Browser -> Express -> JWT Middleware -> Funções -> JSON).
- **Swagger/OpenAPI:** Instalar `swagger-ui-express` e documentar interativamente os endpoints (`/api/login`, `/api/leads`, etc.) para que futuros desenvolvedores possam testar a API facilmente pelo navegador sem precisar do Frontend completo.
