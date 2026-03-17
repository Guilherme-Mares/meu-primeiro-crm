// =============================================================
// MÓDULO: funcoes/interacoes.js
// Responsável pela gestão do histórico de comunicação (1:N)
// com o Lead. Salva os registros em outro arquivo (tabela).
// =============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { carregarLeads } from "./leads.js";

// 📚 CONCEITO: Enum para padronizar os tipos canais de contato
export const TIPOS_VALIDOS = [
    "Ligação",
    "E-mail", // Ajustei para E-mail para dar match com o select html
    "Reunião",
    "WhatsApp"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARQUIVO_DB = process.env.NODE_ENV === "test" ? "interacoes.test.json" : "interacoes.json";
const CAMINHO_ARQUIVO = path.join(__dirname, "..", "dados", ARQUIVO_DB);

// =============================================================
// FUNÇÕES DE PERSISTÊNCIA (Gravar no arquivo de Interações)
// =============================================================

export function carregarInteracoes() {
    try {
        const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, "utf-8");
        return JSON.parse(conteudo);
    } catch (erro) {
        salvarInteracoes([]);
        return [];
    }
}

export function salvarInteracoes(interacoes) {
    const json = JSON.stringify(interacoes, null, 2);
    fs.writeFileSync(CAMINHO_ARQUIVO, json, "utf-8");
}

// =============================================================
// FUNÇÕES DE NEGÓCIO
// =============================================================

/**
 * Adiciona uma nova interação referenciando um Lead (Chave Estrangeira).
 * 
 * @param {number} id_lead - O ID real do lead que recebeu a interação.
 * @param {string} tipo - Canal de contato (Ligação, Email, etc).
 * @param {string} descricao - Resumo descritivo da interação.
 * @param {number} id_usuario - ID do usuário atendente.
 * @returns {Object|null} - Registro criado ou null caso erro.
 */
export function adicionarInteracao(id_lead, tipo, descricao, id_usuario) {
    // 📚 CONCEITO: Integridade Referencial
    // Um banco de dados real (SQL) se recusaria a criar uma interação
    // "filha" se o "pai" (o Lead) não existir. Faremos essa validação aqui!
    const leads = carregarLeads();
    const leadExiste = leads.some(lead => lead.id_lead === Number(id_lead));

    if (!leadExiste) {
        console.log(`❌ ERRO: Não é possível registrar iteração para um Lead inexistente (ID ${id_lead}).`);
        return null;
    }

    if (!id_usuario) {
        console.log("❌ ERRO: A interação precisa ser vinculada a um usuário existente.");
        return null;
    }

    // 📚 CONCEITO: Validação de Domínio (Enum)
    if (!TIPOS_VALIDOS.includes(tipo)) {
        console.log(`❌ ERRO: O tipo de interação '${tipo}' não é reconhecido pelas diretrizes da empresa.`);
        return null;
    }

    if (!descricao || descricao.trim() === "") {
        console.log("❌ ERRO: A descrição não pode ser vazia.");
        return null;
    }

    const interacoes = carregarInteracoes();
    const maiorId = interacoes.length > 0
        ? Math.max(...interacoes.map(i => i.id_interacao))
        : 0;

    const novaInteracao = {
        id_interacao: maiorId + 1,
        id_lead: Number(id_lead), // Aqui está o nosso "ForeignKey"
        id_usuario: Number(id_usuario), // ForeignKey 2
        tipo: tipo,
        descricao: descricao,
        data_registro: new Date().toLocaleString("pt-BR") // Salva também a hora
    };

    interacoes.push(novaInteracao);
    salvarInteracoes(interacoes);

    console.log(`\n✅ SUCESSO: Interação do tipo '${tipo}' registrada no histórico do lead ID ${id_lead}!`);
    return novaInteracao;
}

/**
 * Retorna as interações exclusivas de um único cliente (Filtro por Chave Estrangeira).
 * 
 * @param {number} id_lead - ID do lead
 * @returns {Array} - Array de objetos interação deste cliente
 */
export function listarInteracoesDoLead(id_lead) {
    const interacoes = carregarInteracoes();

    // Coletando todos os registros onde a coluna 'id_lead' for igual a procurada
    const resultados = interacoes.filter(interacao => interacao.id_lead === Number(id_lead));

    if (resultados.length === 0) {
        console.log(`\n📭 Não há histórico de interações registradas para o Lead ID ${id_lead}.`);
        return [];
    }

    console.log(`\n📖 Retornando ${resultados.length} interação(ões) do Lead ID ${id_lead}:\n`);
    console.table(resultados);
    return resultados;
}
