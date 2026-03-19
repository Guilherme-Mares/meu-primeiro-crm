# 🎯 Milestone: v2.0 - CRM Web Interface (Full-Stack)

**Descrição do Milestone:**  
Transformar o nosso CRM baseado em terminal (CLI) em uma aplicação Web completa (Full-Stack). Para fazer isso como um desenvolvedor **Sênior**, vamos adotar a arquitetura de **API REST**. Isso significa que nosso "backend" (as funções que criamos) servirá dados via HTTP, e nosso "frontend" (HTML/CSS/JS) fará o consumo desses dados de forma dinâmica e assíncrona.

---

## 🛠️ Issue 1: Setup do Servidor Web (Express.js) & Configuração Inicial
**Labels:** `backend`, `enhancement`, `setup`

**Objetivo:** Inicializar o motor web que substituirá o `readline` do terminal. O servidor Express será a porta de entrada para a rede.
* **Arquivos a criar/modificar:**
  - `server.js` (Novo ponto de entrada que substituirá o `crm.js`)
  - `package.json` (Instalar dependências: `npm install express cors`)
* **Tarefas:**
  - [ ] Importar o Express e inicializar o app (`const app = express()`).
  - [ ] Configurar para entender JSON (`app.use(express.json())`).
  - [ ] Subir o servidor numa porta (ex: `app.listen(3000)`).
  - [ ] Criar endpoint básico de "Saúde" (`GET /api/status`).

---

## 🔐 Issue 2: API REST - Autenticação & Segurança (Middleware)
**Labels:** `backend`, `security`

**Objetivo:** Transformar nosso `fazerLogin` em um sistema de autenticação via HTTP. Num sistema real Web, precisamos de um mecanismo para identificar o usuário a cada request.
* **Arquivos a criar/modificar:**
  - `rotas/auth.js`
  - `middlewares/verificarSessao.js`
* **Tarefas:**
  - [ ] Criar endpoint `POST /api/login` que receba `{ email, senha }`.
  - [ ] Retornar um token ou gerar um cookie de sessão caso o usuário seja validado.
  - [ ] Criar um *Middleware* HTTP (Função interceptadora) exigindo o login antes de mostrar qualquer dado sigiloso de cliente.

---

## 👥 Issue 3: API REST - Gerenciamento de Leads (CRUD)
**Labels:** `backend`, `api`

**Objetivo:** Expor para a web as funções incríveis que já temos no `/funcoes/leads.js`.
* **Arquivos a criar/modificar:**
  - `rotas/leads.js`
* **Tarefas:**
  - [ ] `GET /api/leads` -> Retorna a lista de leads em formato JSON.
  - [ ] `POST /api/leads` -> Recebe dados, decodifica o usuário autenticado, e chama `cadastrarNovoLead`.
  - [ ] `PUT /api/leads/:id` -> Chama `editarLead` e/ou `atualizarStatusLead`.
  - [ ] `DELETE /api/leads/:id` -> Chama `excluirLead`.

---

## 📞 Issue 4: API REST - Histórico de Interações (Relação 1:N)
**Labels:** `backend`, `api`

**Objetivo:** Disponibilizar os dados de `interacoes.js` com rotas aninhadas.
* **Arquivos a criar/modificar:**
  - `rotas/interacoes.js`
* **Tarefas:**
  - [ ] `GET /api/leads/:id/interacoes` -> Chama `listarInteracoesDoLead(id)` via HTTP.
  - [ ] `POST /api/leads/:id/interacoes` -> Recebe tipo/descrição, junta com o `id_usuario` logado, e grava usando `adicionarInteracao(id, ...)`.

---

## 🎨 Issue 5: Frontend - Estrutura Estática e Design System (UI)
**Labels:** `frontend`, `ui`, `design`

**Objetivo:** Deixar o prompt preto pra trás. Criaremos uma interface rica, responsiva e dinâmica usando HTML, CSS atual e JavaScript no navegador (Vanilla, seguindo os fundamentos).
* **Arquivos a criar/modificar:**
  - `public/index.html` (Nossa Single Page inicial)
  - `public/css/style.css` (Módulo central de estilo, paleta de cores, tipografia)
  - `public/js/app.js` (Gerenciador de requisições base / `fetch()`)
* **Tarefas:**
  - [ ] Estruturar barra lateral (Sidebar) e área de conteúdo principal.
  - [ ] Definir cores modernas para um CRM (Azul Profundo, Branco, Cinza Neutro, Verde para "Fechado").
  - [ ] Criar utilitários em CSS (buttons, cards, inputs).

---

## 🚪 Issue 6: Frontend - Tela de Login Dinâmica
**Labels:** `frontend`, `ux`

**Objetivo:** A porta de entrada visual do sistema. Ocultar o sistema inteiro até que haja login com sucesso.
* **Arquivos a criar/modificar:**
  - `public/login.html` (Página de login ou modal)
  - `public/js/authFront.js`
* **Tarefas:**
  - [ ] Criar formulário bonito e centralizado para Email e Senha.
  - [ ] Conectar formulário ao evento `submit` interceptado via JS.
  - [ ] Fazer `<fetch POST>` para `/api/login`.
  - [ ] Se sucesso, guardar o token no `localStorage` e redirecionar para a Dashboard.

---

## 📊 Issue 7: Frontend - Tabela de Leads & Modal de Ações
**Labels:** `frontend`, `feature`

**Objetivo:** Exibição visual dos nossos dados encriptados.
* **Arquivos a criar/modificar:**
  - `public/js/leadsView.js` (Isolamento da lógica visual dos leads)
* **Tarefas:**
  - [ ] Na inicialização da página, disparar um `<fetch GET>` em `/api/leads`.
  - [ ] Renderizar no DOM uma `<table class="crm-table">` ou lista de "Cards" (Estilo Kanban) para os clientes.
  - [ ] Criar botões lógicos: [Novo Lead], [✏️ Editar], [🗑️ Excluir].
  - [ ] Abrir Formulários de inputs flutuantes (Modais) para as edições.

---

## 📖 Issue 8: Frontend - Painel Mestre-Detalhe de Interações
**Labels:** `frontend`, `feature`, `complex`

**Objetivo:** A peça mais Sênior do frontend. Visualizar Interações sem sair da tela do Lead.
* **Arquivos a criar/modificar:**
  - `public/js/interacoesView.js`
* **Tarefas:**
  - [ ] Criar evento de clique na linha da tabela de Leads.
  - [ ] Ao clicar, fazer `<fetch GET /api/leads/:id/interacoes>` disparando assincronamente.
  - [ ] Exibir uma painel lateral "Drawer" com a linha do tempo (Timeline Histórico) daquele Lead.
  - [ ] Embutir um mini-formulário no mesmo painel para `<fetch POST>` registrando nova ligação ou email na hora.
