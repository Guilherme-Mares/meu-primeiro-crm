// =============================================================
// MÓDULO: funcoes/leads.js
// Lógica de negócio dos Leads — agora usando Prisma + SQLite.
//
// 📚 CONCEITO: "Async/Await"
//    Agora que usamos um banco de dados real, todas as operações
//    de I/O (leitura/escrita) são assíncronas por natureza.
//    Usamos async/await para lidar com isso de forma limpa.
// =============================================================

import prisma from '../lib/prisma.js';
import { encriptar } from './seguranca.js';

// =============================================================
// 📚 CONCEITO: Enum e Validação de Domínio
// =============================================================
export const STATUS_VALIDOS = [
    'Novo',
    'Contatado',
    'Qualificado',
    'Proposta',
    'Fechado',
    'Perdido'
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =============================================================
// FUNÇÕES DE NEGÓCIO
// =============================================================

/**
 * Cadastra um novo lead no banco de dados.
 */
export async function cadastrarNovoLead(nome, email, telefone, id_usuario) {
    console.log('\n--- [SISTEMA] Iniciando processo de cadastro... ---');

    if (!nome || !email || !telefone || !id_usuario) {
        console.log('❌ ERRO DE VALIDAÇÃO: Todos os campos devem ser preenchidos, incluindo o ID do usuário.');
        return null;
    }

    if (!REGEX_EMAIL.test(email)) {
        console.log('❌ ERRO DE VALIDAÇÃO: O email informado possui um formato inválido.');
        return null;
    }

    const emailSeguro = encriptar(email);
    console.log('🔒 Dados sensíveis protegidos com AES-256 com sucesso.');

    const novoLead = await prisma.lead.create({
        data: {
            nome_cliente: nome,
            email: emailSeguro,
            telefone,
            status: 'Novo',
            data_criacao: new Date().toLocaleDateString('pt-BR'),
            id_usuario: Number(id_usuario),
        },
    });

    // Remapeia id para compatibilidade com o frontend/testes existentes
    const leadFormatado = { ...novoLead, id_lead: novoLead.id };

    console.log('✅ SUCESSO: Lead cadastrado e salvo no banco!');
    return leadFormatado;
}

/**
 * Lista TODOS os leads salvos no banco de dados.
 */
export async function listarLeads() {
    const leads = await prisma.lead.findMany({
        orderBy: { id: 'asc' }
    });

    if (leads.length === 0) {
        console.log('\n📭 Nenhum lead cadastrado ainda.');
        return [];
    }

    console.log(`\n📋 Total de leads cadastrados: ${leads.length}`);
    return leads.map(l => ({ ...l, id_lead: l.id }));
}

/**
 * Busca leads pelo nome (partial, case-insensitive).
 */
export async function buscarLeadPorNome(termoBusca) {
    const leads = await prisma.lead.findMany({
        where: {
            nome_cliente: {
                contains: termoBusca,
                // SQLite não suporta mode: 'insensitive', usamos contains
            }
        },
        orderBy: { id: 'asc' }
    });

    console.log(`\n🔍 ${leads.length} lead(s) encontrado(s) para "${termoBusca}"`);
    return leads.map(l => ({ ...l, id_lead: l.id }));
}

/**
 * Exclui um lead pelo seu ID.
 */
export async function excluirLead(id) {
    try {
        await prisma.lead.delete({ where: { id: Number(id) } });
        console.log(`\n🗑️  SUCESSO: Lead com ID ${id} foi removido.`);
        return true;
    } catch {
        console.log(`\n❌ ERRO: Nenhum lead encontrado com o ID ${id}.`);
        return false;
    }
}

/**
 * Edita um lead existente pelo seu ID.
 */
export async function editarLead(id, novosDados) {
    const leadAtual = await prisma.lead.findUnique({ where: { id: Number(id) } });

    if (!leadAtual) {
        console.log(`\n❌ ERRO: Nenhum lead encontrado com o ID ${id}.`);
        return null;
    }

    if (novosDados.email) {
        if (!REGEX_EMAIL.test(novosDados.email)) {
            console.log('❌ ERRO DE VALIDAÇÃO: O email informado possui um formato inválido.');
            return null;
        }
    }

    if (novosDados.status && !STATUS_VALIDOS.includes(novosDados.status)) {
        console.log(`❌ ERRO DE VALIDAÇÃO: O status '${novosDados.status}' não é reconhecido pelo funil de vendas.`);
        return null;
    }

    const dadosParaAtualizar = {
        nome_cliente: novosDados.nome || leadAtual.nome_cliente,
        telefone:     novosDados.telefone || leadAtual.telefone,
        status:       novosDados.status || leadAtual.status,
    };

    if (novosDados.email) {
        dadosParaAtualizar.email = encriptar(novosDados.email);
    }

    const leadAtualizado = await prisma.lead.update({
        where: { id: Number(id) },
        data: dadosParaAtualizar,
    });

    console.log(`\n✅ SUCESSO: Lead com ID ${id} foi atualizado!`);
    return { ...leadAtualizado, id_lead: leadAtualizado.id };
}

/**
 * Atualiza apenas o status de um lead.
 */
export async function atualizarStatusLead(id, novoStatus) {
    if (!STATUS_VALIDOS.includes(novoStatus)) {
        console.log(`\n❌ ERRO DE VALIDAÇÃO: O status '${novoStatus}' é inválido no funil.`);
        return null;
    }
    return editarLead(id, { status: novoStatus });
}
