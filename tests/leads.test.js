import {
    cadastrarNovoLead,
    listarLeads,
    buscarLeadPorNome,
    excluirLead,
    editarLead,
    atualizarStatusLead
} from '../funcoes/leads.js';
import { decriptar } from '../funcoes/seguranca.js';
import prisma from '../lib/prisma.js';

/**
 * 📚 CONCEITO: Testes Automatizados com Banco de Dados
 * 
 * Agora que usamos Prisma, precisamos garantir que o banco esteja limpo
 * antes de cada teste para evitar interferência.
 */

describe('Módulo de Leads (Prisma)', () => {
    let idUsuarioTeste = 1;

    beforeAll(async () => {
        // Garante que existe pelo menos um usuário para os testes de Lead
        const usuario = await prisma.usuario.upsert({
            where: { email: 'test@externo.com' },
            update: {},
            create: {
                nome: 'Usuario Teste',
                email: 'test@externo.com',
                senha: '123'
            }
        });
        idUsuarioTeste = usuario.id;
    });

    beforeEach(async () => {
        // Limpa os leads antes de cada teste
        // Nota: Interações são deletadas em cascata (conforme definido no schema)
        await prisma.lead.deleteMany();
    });

    afterAll(async () => {
        // Fecha a conexão com o Prisma ao final
        await prisma.$disconnect();
    });

    describe('cadastrarNovoLead()', () => {

        test('deve cadastrar um lead com sucesso quando os dados são válidos', async () => {
            const nome = "Fulano de Tal";
            const email = "fulano@teste.com";
            const telefone = "11999998888";

            const resultado = await cadastrarNovoLead(nome, email, telefone, idUsuarioTeste);

            expect(resultado).not.toBeNull();
            expect(resultado.nome_cliente).toBe(nome);
            expect(resultado.id_lead).toBeDefined(); 
            expect(resultado.status).toBe("Novo");
        });

        test('deve retornar null se faltar algum campo obrigatório', async () => {
            const resultado = await cadastrarNovoLead("Sem Email", "", "11988887777", idUsuarioTeste);
            expect(resultado).toBeNull();
        });

        test('deve retornar null se o formato do email for inválido', async () => {
            let resultado = await cadastrarNovoLead("Teste", "emailinvalido.com", "123", idUsuarioTeste);
            expect(resultado).toBeNull();
        });

        test('deve encriptar o email de forma segura', async () => {
            const email = "secreto@teste.com";
            const resultado = await cadastrarNovoLead("Admin", email, "000", idUsuarioTeste);

            expect(resultado.email).toContain(':');
            expect(decriptar(resultado.email)).toBe(email);
        });
    });

    describe('listarLeads()', () => {

        test('deve retornar um array vazio se não houver leads', async () => {
            const lista = await listarLeads();
            expect(lista).toEqual([]);
        });

        test('deve retornar todos os leads cadastrados', async () => {
            await cadastrarNovoLead("Lead 1", "l1@t.com", "1", idUsuarioTeste);
            await cadastrarNovoLead("Lead 2", "l2@t.com", "2", idUsuarioTeste);

            const lista = await listarLeads();
            expect(lista.length).toBe(2);
        });
    });

    describe('buscarLeadPorNome()', () => {

        beforeEach(async () => {
            await cadastrarNovoLead("Guilherme Mares", "g@m.com", "123", idUsuarioTeste);
            await cadastrarNovoLead("Carlos Alberto", "c@a.com", "456", idUsuarioTeste);
        });

        test('deve encontrar um lead pelo nome exato', async () => {
            const busca = await buscarLeadPorNome("Guilherme Mares");
            expect(busca.length).toBe(1);
            expect(busca[0].nome_cliente).toBe("Guilherme Mares");
        });

        test('deve encontrar usando busca parcial', async () => {
            const busca = await buscarLeadPorNome("Guilherme");
            expect(busca.length).toBe(1);
        });
    });

    describe('excluirLead()', () => {

        test('deve excluir um lead existente pelo ID', async () => {
            const lead = await cadastrarNovoLead("Para Deletar", "del@test.com", "000", idUsuarioTeste);
            const id = lead.id_lead;

            const resultado = await excluirLead(id);

            expect(resultado).toBe(true);
            const lista = await listarLeads();
            expect(lista.length).toBe(0);
        });

        test('deve retornar false ao tentar excluir um ID inexistente', async () => {
            const resultado = await excluirLead(9999);
            expect(resultado).toBe(false);
        });
    });

    describe('editarLead()', () => {

        test('deve atualizar apenas os dados fornecidos', async () => {
            const lead = await cadastrarNovoLead("Original", "orig@t.com", "111", idUsuarioTeste);
            const id = lead.id_lead;

            const resultado = await editarLead(id, { nome: "Editado" });

            expect(resultado).not.toBeNull();
            expect(resultado.nome_cliente).toBe("Editado");
            expect(decriptar(resultado.email)).toBe("orig@t.com");
        });

        test('deve rejeitar status inválido', async () => {
            const lead = await cadastrarNovoLead("Teste", "t@t.com", "111", idUsuarioTeste);
            const resultado = await editarLead(lead.id_lead, { status: "Inexistente" });
            expect(resultado).toBeNull();
        });
    });

    describe('atualizarStatusLead()', () => {

        test('deve atualizar o status corretamente', async () => {
            const lead = await cadastrarNovoLead("Funil", "f@t.com", "111", idUsuarioTeste);
            const resultado = await atualizarStatusLead(lead.id_lead, "Qualificado");
            expect(resultado.status).toBe("Qualificado");
        });
    });
});
