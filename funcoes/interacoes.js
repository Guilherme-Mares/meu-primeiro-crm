// =============================================================
// MÓDULO: funcoes/interacoes.js
// Lógica de negócio das Interações (1:N) — usando Prisma + SQLite.
// =============================================================

import prisma from '../lib/prisma.js';

// 📚 CONCEITO: Enum para padronizar os tipos canais de contato
export const TIPOS_VALIDOS = [
    'Ligação',
    'E-mail',
    'Reunião',
    'WhatsApp'
];

/**
 * Adiciona uma nova interação referenciando um Lead.
 */
export async function adicionarInteracao(id_lead, tipo, descricao, id_usuario) {
    // 📚 CONCEITO: Integridade Referencial — verificar se o pai existe
    const leadExiste = await prisma.lead.findUnique({ where: { id: Number(id_lead) } });

    if (!leadExiste) {
        console.log(`❌ ERRO: Não é possível registrar interação para um Lead inexistente (ID ${id_lead}).`);
        return null;
    }

    if (!id_usuario) {
        console.log('❌ ERRO: A interação precisa ser vinculada a um usuário existente.');
        return null;
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
        console.log(`❌ ERRO: O tipo de interação '${tipo}' não é reconhecido pelas diretrizes da empresa.`);
        return null;
    }

    if (!descricao || descricao.trim() === '') {
        console.log('❌ ERRO: A descrição não pode ser vazia.');
        return null;
    }

    const novaInteracao = await prisma.interacao.create({
        data: {
            tipo,
            descricao,
            data_registro: new Date().toLocaleString('pt-BR'),
            id_lead: Number(id_lead),
            id_usuario: Number(id_usuario),
        }
    });

    console.log(`\n✅ SUCESSO: Interação do tipo '${tipo}' registrada no histórico do lead ID ${id_lead}!`);
    // Mapeamos id para id_interacao por compatibilidade com o código legado
    return { ...novaInteracao, id_interacao: novaInteracao.id };
}

/**
 * Retorna as interações exclusivas de um único lead.
 */
export async function listarInteracoesDoLead(id_lead) {
    const interacoes = await prisma.interacao.findMany({
        where: { id_lead: Number(id_lead) },
        orderBy: { id: 'asc' }
    });

    if (interacoes.length === 0) {
        console.log(`\n📭 Não há histórico de interações registradas para o Lead ID ${id_lead}.`);
        return [];
    }

    console.log(`\n📖 Retornando ${interacoes.length} interação(ões) do Lead ID ${id_lead}`);
    return interacoes.map(i => ({ ...i, id_interacao: i.id }));
}
