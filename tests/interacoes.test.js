import { adicionarInteracao, listarInteracoesDoLead } from '../funcoes/interacoes.js';
import { cadastrarNovoLead } from '../funcoes/leads.js';
import prisma from '../lib/prisma.js';

/**
 * 📚 CONCEITO: Testes de Integração (1:N) com Prisma
 * 
 * Verificamos se as interações estão sendo corretamente vinculadas aos leads
 * no banco de dados SQLite.
 */

describe('Módulo de Interações (Prisma)', () => {
    let idUsuarioTeste = 1;

    beforeAll(async () => {
        // Garante usuário para os testes
        const usuario = await prisma.usuario.upsert({
            where: { email: 'test-int@externo.com' },
            update: {},
            create: {
                nome: 'Admin Teste',
                email: 'test-int@externo.com',
                senha: '123'
            }
        });
        idUsuarioTeste = usuario.id;
    });

    beforeEach(async () => {
        // Limpeza em ordem para respeitar FKs (Interacao primeiro, depois Lead)
        // Embora deleteMany de Lead com onDelete: Cascade no schema resolveria,
        // é boa prática ser explícito nos testes.
        await prisma.interacao.deleteMany();
        await prisma.lead.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('adicionarInteracao()', () => {

        test('deve registrar com sucesso uma nova interação vinculada ao Lead', async () => {
            const lead = await cadastrarNovoLead("Joao Teste", "joao@t.com", "123", idUsuarioTeste);
            const int = await adicionarInteracao(lead.id_lead, "E-mail", "Enviei apresentação", idUsuarioTeste);

            expect(int).not.toBeNull();
            expect(int.tipo).toBe("E-mail");
            expect(int.id_lead).toBe(lead.id_lead);
        });

        test('deve rejeitar uma interação caso o ID do Lead não exista', async () => {
            const int = await adicionarInteracao(9999, "Reunião", "Apresentou erro", idUsuarioTeste);
            expect(int).toBeNull();
        });

        test('deve rejeitar quando o tipo de interação for inválido', async () => {
            const lead = await cadastrarNovoLead("Maria Teste", "maria@t.com", "123", idUsuarioTeste);
            const int = await adicionarInteracao(lead.id_lead, "Grito", "Gritei com o cliente", idUsuarioTeste);

            expect(int).toBeNull();
        });

        test('deve rejeitar histórico sem descrição ou em branco', async () => {
            const lead = await cadastrarNovoLead("Joao Teste", "joao@t.com", "123", idUsuarioTeste);
            const intBranco = await adicionarInteracao(lead.id_lead, "Ligação", " ", idUsuarioTeste);

            expect(intBranco).toBeNull();
        });
    });

    describe('listarInteracoesDoLead()', () => {

        test('deve listar o array vazio se o lead não tem interações', async () => {
            const lista = await listarInteracoesDoLead(9999);
            expect(lista).toEqual([]);
        });

        test('deve listar apenas as interações do Lead pesquisado', async () => {
            const leadUm = await cadastrarNovoLead("Primeiro", "um@t.com", "111", idUsuarioTeste);
            const leadDois = await cadastrarNovoLead("Segundo", "dois@t.com", "222", idUsuarioTeste);

            await adicionarInteracao(leadUm.id_lead, "Reunião", "Draft online", idUsuarioTeste);
            await adicionarInteracao(leadUm.id_lead, "E-mail", "Follow-up", idUsuarioTeste);
            await adicionarInteracao(leadDois.id_lead, "Ligação", "Contato", idUsuarioTeste);

            const resultLeadUm = await listarInteracoesDoLead(leadUm.id_lead);

            expect(resultLeadUm.length).toBe(2);
            expect(resultLeadUm.every(i => i.id_lead === leadUm.id_lead)).toBe(true);
        });
    });
});
