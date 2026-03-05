import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { adicionarInteracao, listarInteracoesDoLead } from '../funcoes/interacoes.js';
import { cadastrarNovoLead, salvarLeads } from '../funcoes/leads.js';

// Configuração de ambiente para os testes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CAMINHO_TEST_DB = path.join(__dirname, '..', 'dados', 'interacoes.test.json');
const CAMINHO_LEAD_DB = path.join(__dirname, '..', 'dados', 'leads.test.json');

describe('Módulo de Interações (1:N)', () => {

    beforeEach(() => {
        // Limpa o banco de testes antes de rodar os cenários
        fs.writeFileSync(CAMINHO_TEST_DB, '[]', 'utf-8');
        fs.writeFileSync(CAMINHO_LEAD_DB, '[]', 'utf-8');
    });

    afterAll(() => {
        // Remove os arquivos de teste
        if (fs.existsSync(CAMINHO_TEST_DB)) fs.unlinkSync(CAMINHO_TEST_DB);
        if (fs.existsSync(CAMINHO_LEAD_DB)) fs.unlinkSync(CAMINHO_LEAD_DB);
    });

    describe('adicionarInteracao()', () => {

        test('deve registrar com sucesso uma nova interação vinculada ao Lead (ForeignKey válida)', () => {
            const lead = cadastrarNovoLead("Joao Teste", "joao@t.com", "123", 1);
            const int = adicionarInteracao(lead.id_lead, "Email", "Enviei apresentação", 1);

            expect(int).not.toBeNull();
            expect(int.tipo).toBe("Email");
            expect(int.descricao).toBe("Enviei apresentação");
            expect(int.id_lead).toBe(lead.id_lead); // A mágica relacional
        });

        test('deve rejeitar uma interação caso o ID do Lead não exista', () => {
            const int = adicionarInteracao(999, "Reunião", "Apresentou erro", 1);
            expect(int).toBeNull();
        });

        test('deve rejeitar quando o tipo de interação for inválido (Fora do Enum)', () => {
            const lead = cadastrarNovoLead("Maria Teste", "maria@t.com", "123", 1);
            const int = adicionarInteracao(lead.id_lead, "Grito", "Gritei com o cliente", 1);

            expect(int).toBeNull();
        });

        test('deve rejeitar histórico sem descrição ou em branco', () => {
            const lead = cadastrarNovoLead("Joao Teste", "joao@t.com", "123", 1);
            const intBranco = adicionarInteracao(lead.id_lead, "Ligação", "", 1);
            const intNula = adicionarInteracao(lead.id_lead, "Ligação", null, 1);

            expect(intBranco).toBeNull();
            expect(intNula).toBeNull();
        });
    });

    describe('listarInteracoesDoLead()', () => {

        test('deve listar o array vazio se o lead não tem interações', () => {
            const lista = listarInteracoesDoLead(10);
            expect(lista).toEqual([]);
        });

        test('deve listar apenas as interações do Lead pesquisado (ignorar de outros)', () => {
            // Setup: Criamos 2 clientes distintos
            const leadUm = cadastrarNovoLead("Primeiro", "um@t.com", "111", 1);
            const leadDois = cadastrarNovoLead("Segundo", "dois@t.com", "222", 1);

            // Cria 3 interações: duas pro Lead 1, uma pro Lead 2
            adicionarInteracao(leadUm.id_lead, "Reunião", "Draft online", 1);
            adicionarInteracao(leadUm.id_lead, "Email", "Follow-up do draft", 1);
            adicionarInteracao(leadDois.id_lead, "Ligação", "Primeiro contato", 1);

            // Exige somente o log do Lead 1
            const resultLeadUm = listarInteracoesDoLead(leadUm.id_lead);

            // Verifica (Asserts)
            expect(resultLeadUm.length).toBe(2);
            expect(resultLeadUm[0].tipo).toBe("Reunião");
            expect(resultLeadUm[1].tipo).toBe("Email");

            // O Log do Lead 2 que é Ligação não pode aparecer na lista do Lead 1
            const ligacoesVazadas = resultLeadUm.filter(i => i.tipo === "Ligação");
            expect(ligacoesVazadas.length).toBe(0);
        });

    });

});
