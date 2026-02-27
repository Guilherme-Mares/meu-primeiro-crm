// =============================================================
// MÓDULO: funcoes/leads.js
// Responsável por TODA a lógica de negócio dos Leads.
//
// 📚 CONCEITO: "Separação de Responsabilidades"
//    Em vez de colocar tudo num só arquivo, separamos a lógica
//    em módulos. Isso deixa o código organizado e reutilizável.
// =============================================================

// 📚 CONCEITO: "Módulos nativos do Node.js"
//    O Node.js já vem com módulos prontos. Aqui usamos:
//    - 'fs'   → File System, para ler e gravar arquivos
//    - 'path' → Para montar caminhos de arquivo de forma segura
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { encriptar } from "./seguranca.js";

// 📚 CONCEITO: __dirname no ES Modules
//    No padrão ESM (import/export), as variáveis __dirname e __filename não existem.
//    Abaixo usamos um "truque" padrão do Node.js moderno para recriar o __dirname
//    usando a URL do módulo atual (import.meta.url).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determina qual arquivo de banco de dados usar (Real ou Teste)
// 📚 CONCEITO: Variáveis de Ambiente
//    Seniors usam variáveis como NODE_ENV para saber se o código
//    está rodando em "Produção" ou em "Teste".
const ARQUIVO_DB = process.env.NODE_ENV === "test" ? "leads.test.json" : "leads.json";

// Caminho até o nosso "banco de dados" JSON.
const CAMINHO_ARQUIVO = path.join(__dirname, "..", "dados", ARQUIVO_DB);

// =============================================================
// FUNÇÕES DE PERSISTÊNCIA (Ler / Gravar no arquivo JSON)
// =============================================================

/**
 * Carrega todos os leads salvos no arquivo JSON.
 */
export function carregarLeads() {
  try {
    const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, "utf-8");
    return JSON.parse(conteudo);
  } catch (erro) {
    console.log("⚠️  Arquivo de dados não encontrado. Criando um novo...");
    salvarLeads([]);
    return [];
  }
}

/**
 * Salva o array de leads no arquivo JSON.
 */
export function salvarLeads(leads) {
  const json = JSON.stringify(leads, null, 2);
  fs.writeFileSync(CAMINHO_ARQUIVO, json, "utf-8");
}

// =============================================================
// FUNÇÕES DE NEGÓCIO (Seguem o Fluxograma e o DER)
// =============================================================

/**
 * Cadastra um novo lead seguindo o fluxo do fluxograma.
 */
export function cadastrarNovoLead(nome, email, telefone) {
  console.log("\n--- [SISTEMA] Iniciando processo de cadastro... ---");

  if (!nome || !email || !telefone) {
    console.log("❌ ERRO DE VALIDAÇÃO: Todos os campos devem ser preenchidos.");
    return null;
  }

  const emailSeguro = encriptar(email);
  console.log("🔒 Dados sensíveis protegidos com AES-256 com sucesso.");

  const leads = carregarLeads();

  const maiorId = leads.length > 0
    ? Math.max(...leads.map((lead) => lead.id_lead))
    : 0;

  const novoLead = {
    id_lead: maiorId + 1,
    nome_cliente: nome,
    email: emailSeguro,
    telefone: telefone,
    status: "Novo",
    data_criacao: new Date().toLocaleDateString("pt-BR"),
  };

  leads.push(novoLead);
  salvarLeads(leads);

  console.log("✅ SUCESSO: Lead cadastrado e salvo no arquivo!");
  console.log("Visualização do Registro:", novoLead);
  return novoLead;
}

/**
 * Lista TODOS os leads salvos no arquivo JSON.
 */
export function listarLeads() {
  const leads = carregarLeads();

  if (leads.length === 0) {
    console.log("\n📭 Nenhum lead cadastrado ainda.");
    return [];
  }

  console.log(`\n📋 Total de leads cadastrados: ${leads.length}\n`);
  console.table(leads);
  return leads;
}

/**
 * Busca leads pelo nome.
 */
export function buscarLeadPorNome(termoBusca) {
  const leads = carregarLeads();

  const resultados = leads.filter((lead) =>
    lead.nome_cliente.toLowerCase().includes(termoBusca.toLowerCase())
  );

  if (resultados.length === 0) {
    console.log(`\n🔍 Nenhum lead encontrado com o nome "${termoBusca}".`);
    return [];
  }

  console.log(`\n🔍 ${resultados.length} lead(s) encontrado(s) para "${termoBusca}":\n`);
  console.table(resultados);
  return resultados;
}

