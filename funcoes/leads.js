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
const fs = require("fs");
const path = require("path");

// Caminho até o nosso "banco de dados" JSON.
// 📚 CONCEITO: path.join()
//    Monta o caminho do arquivo de forma que funcione em qualquer
//    sistema operacional (Windows, Mac, Linux).
//    __dirname = pasta onde ESTE arquivo está (funcoes/)
//    ".."      = sobe um nível (volta para a raiz do projeto)
const CAMINHO_ARQUIVO = path.join(__dirname, "..", "dados", "leads.json");

// =============================================================
// FUNÇÕES DE PERSISTÊNCIA (Ler / Gravar no arquivo JSON)
// =============================================================

/**
 * Carrega todos os leads salvos no arquivo JSON.
 *
 * 📚 CONCEITO: fs.readFileSync()
 *    Lê o conteúdo de um arquivo de forma SÍNCRONA (espera terminar).
 *    Retorna o texto bruto do arquivo (uma string).
 *
 * 📚 CONCEITO: JSON.parse()
 *    Transforma uma string JSON em um objeto/array do JavaScript.
 *    Exemplo: '["a","b"]' (texto) → ["a","b"] (array de verdade)
 *
 * @returns {Array} Array com todos os leads salvos
 */
function carregarLeads() {
  try {
    const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, "utf-8");
    return JSON.parse(conteudo);
  } catch (erro) {
    // Se o arquivo não existir ou estiver corrompido, retorna vazio.
    // Isso evita que o programa quebre na primeira execução.
    console.log("⚠️  Arquivo de dados não encontrado. Criando um novo...");
    salvarLeads([]);
    return [];
  }
}

/**
 * Salva o array de leads no arquivo JSON.
 *
 * 📚 CONCEITO: JSON.stringify(dados, null, 2)
 *    Transforma um objeto/array JS em uma string JSON.
 *    - null → não filtra nenhuma propriedade
 *    - 2    → indenta com 2 espaços (fica bonito de ler)
 *
 * 📚 CONCEITO: fs.writeFileSync()
 *    Grava o conteúdo no arquivo, SUBSTITUINDO o que tinha antes.
 *
 * @param {Array} leads - Array de leads para salvar
 */
function salvarLeads(leads) {
  const json = JSON.stringify(leads, null, 2);
  fs.writeFileSync(CAMINHO_ARQUIVO, json, "utf-8");
}

// =============================================================
// FUNÇÕES DE NEGÓCIO (Seguem o Fluxograma e o DER)
// =============================================================

/**
 * Cadastra um novo lead seguindo o fluxo do fluxograma:
 * Início → Validação → Criptografia → Salvar no DB → Fim
 *
 * 📚 CONCEITO: Fluxo condicional (if/else)
 *    Reproduzimos exatamente o losango "Campos obrigatórios
 *    preenchidos?" do fluxograma.
 *
 * @param {string} nome     - Nome do cliente
 * @param {string} email    - Email do cliente
 * @param {string} telefone - Telefone do cliente
 * @returns {object|null}   - O lead criado ou null se houve erro
 */
function cadastrarNovoLead(nome, email, telefone) {
  console.log("\n--- [SISTEMA] Iniciando processo de cadastro... ---");

  // ┌─────────────────────────────────────────────────────────┐
  // │ FLUXOGRAMA: Losango "Campos obrigatórios preenchidos?"  │
  // └─────────────────────────────────────────────────────────┘
  if (!nome || !email || !telefone) {
    // Seta "Não" → Retângulo "Exibir erro ao usuário"
    console.log("❌ ERRO DE VALIDAÇÃO: Todos os campos devem ser preenchidos.");
    return null;
  }

  // ┌─────────────────────────────────────────────────────────┐
  // │ FLUXOGRAMA: "Criptografar dados sensíveis e salvar"     │
  // └─────────────────────────────────────────────────────────┘
  // 📚 CONCEITO: Buffer.from().toString('base64')
  //    Converte o email para Base64 (uma forma simples de codificação).
  //    Em um sistema real, usaríamos criptografia de verdade (ex: bcrypt).
  const emailSeguro = Buffer.from(email).toString("base64");
  console.log("🔒 Dados sensíveis criptografados com sucesso.");

  // Carrega os leads existentes para descobrir o próximo ID
  const leads = carregarLeads();

  // 📚 CONCEITO: Gerar ID automático
  //    Pegamos o maior ID que já existe e somamos 1.
  //    Se não existe nenhum lead, o ID começa em 1.
  const maiorId = leads.length > 0
    ? Math.max(...leads.map((lead) => lead.id_lead))
    : 0;

  // Criando o objeto Lead conforme o DER (Entidade "Leads")
  const novoLead = {
    id_lead: maiorId + 1,
    nome_cliente: nome,
    email: emailSeguro,
    telefone: telefone,
    status: "Novo",
    data_criacao: new Date().toLocaleDateString("pt-BR"),
  };

  // ┌─────────────────────────────────────────────────────────┐
  // │ FLUXOGRAMA: "Salvar no DB" (agora salva no JSON!)       │
  // └─────────────────────────────────────────────────────────┘
  leads.push(novoLead);
  salvarLeads(leads);

  // ┌─────────────────────────────────────────────────────────┐
  // │ FLUXOGRAMA: Oval "Fim: Lead disponível no Dashboard"    │
  // └─────────────────────────────────────────────────────────┘
  console.log("✅ SUCESSO: Lead cadastrado e salvo no arquivo!");
  console.log("Visualização do Registro:", novoLead);
  return novoLead;
}

/**
 * Lista TODOS os leads salvos no arquivo JSON.
 *
 * 📚 CONCEITO: console.table()
 *    Exibe dados em formato de tabela no terminal.
 *    Muito mais legível do que console.log() para arrays de objetos.
 */
function listarLeads() {
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
 * Busca leads pelo nome (busca parcial, sem diferenciar maiúsculas).
 *
 * 📚 CONCEITO: Array.filter()
 *    Cria um NOVO array contendo apenas os itens que passam no teste.
 *    Não modifica o array original.
 *
 * 📚 CONCEITO: String.toLowerCase()
 *    Converte para minúsculas para comparar sem diferenciar
 *    "Guilherme" de "guilherme" (case-insensitive).
 *
 * 📚 CONCEITO: String.includes()
 *    Verifica se uma string contém outra string dentro dela.
 *    Exemplo: "Guilherme Mares".includes("guilh") → false
 *    Mas: "guilherme mares".includes("guilh") → true (por isso o toLowerCase)
 *
 * @param {string} termoBusca - Texto para buscar no nome do lead
 * @returns {Array} Array com os leads encontrados
 */
function buscarLeadPorNome(termoBusca) {
  const leads = carregarLeads();

  // Filtra os leads cujo nome_cliente contém o termo buscado
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

// =============================================================
// EXPORTANDO AS FUNÇÕES
//
// 📚 CONCEITO: module.exports
//    Torna as funções disponíveis para outros arquivos usarem.
//    Sem isso, as funções ficariam "presas" dentro deste arquivo.
//    Quem fizer require('./funcoes/leads') recebe este objeto.
// =============================================================
module.exports = {
  cadastrarNovoLead,
  listarLeads,
  buscarLeadPorNome,
};
