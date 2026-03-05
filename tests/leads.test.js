import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    cadastrarNovoLead,
    listarLeads,
    buscarLeadPorNome,
    salvarLeads,
    excluirLead,
    editarLead,
    atualizarStatusLead
} from '../funcoes/leads.js';
import { decriptar } from '../funcoes/seguranca.js';

// Configuração de ambiente para os testes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CAMINHO_TEST_DB = path.join(__dirname, '..', 'dados', 'leads.test.json');

/**
 * 📚 CONCEITO: Testes Automatizados (Jest)
 * 
 * Antes de começar, limpamos o banco de dados de teste.
 * 
 * beforeEach: Executa antes de CADA teste (it/test).
 * afterAll: Executa uma vez ao final de todos os testes da suite.
 */

describe('Módulo de Leads', () => {

    beforeEach(() => {
        // 📚 CONCEITO: Estado Limpo
        // Sempre começamos com um array vazio para não um teste não interferir no outro.
        fs.writeFileSync(CAMINHO_TEST_DB, '[]', 'utf-8');
    });

    afterAll(() => {
        // Remove o arquivo de teste ao final para manter a pasta limpa.
        if (fs.existsSync(CAMINHO_TEST_DB)) {
            fs.unlinkSync(CAMINHO_TEST_DB);
        }
    });

    describe('cadastrarNovoLead()', () => {

        test('deve cadastrar um lead com sucesso quando os dados são válidos', () => {
            // Arrange (Preparar)
            const nome = "Fulano de Tal";
            const email = "fulano@teste.com";
            const telefone = "11999998888";

            // Act (Agir)
            const resultado = cadastrarNovoLead(nome, email, telefone, 1);

            // Assert (Verificar)
            expect(resultado).not.toBeNull();
            expect(resultado.nome_cliente).toBe(nome);
            expect(resultado.id_lead).toBe(1); // Primeiro lead deve ter ID 1
            expect(resultado.status).toBe("Novo");
        });

        test('deve retornar null se faltar algum campo obrigatório', () => {
            const resultado = cadastrarNovoLead("Sem Email", "", "11988887777", 1);
            expect(resultado).toBeNull();
        });

        test('deve retornar null se o formato do email for inválido (regex)', () => {
            // E-mail sem @
            let resultado = cadastrarNovoLead("Teste", "emailinvalido.com", "123", 1);
            expect(resultado).toBeNull();

            // E-mail sem ponto após o domínio
            resultado = cadastrarNovoLead("Teste", "email@dominio", "123", 1);
            expect(resultado).toBeNull();

            // Email com espaços
            resultado = cadastrarNovoLead("Teste", "em ail@dominio.com", "123", 1);
            expect(resultado).toBeNull();
        });

        test('deve gerar IDs incrementais corretamente', () => {
            fs.writeFileSync(path.join(__dirname, '..', 'dados', 'leads.test.json'), '[]', 'utf-8');

            cadastrarNovoLead("Primeiro", "p@t.com", "123", 1);
            const segundo = cadastrarNovoLead("Segundo", "s@t.com", "456", 1);

            expect(segundo.id_lead).toBe(2);
        });

        test('deve encriptar o email de forma segura (não ser Base64 simples)', () => {
            const email = "secreto@teste.com";
            const resultado = cadastrarNovoLead("Admin", email, "000", 1);

            // Verifica se o resultado contém o separador ':' do IV
            expect(resultado.email).toContain(':');
            // Verifica se o email decriptado volta ao original
            expect(decriptar(resultado.email)).toBe(email);
        });
    });

    describe('listarLeads()', () => {

        test('deve retornar um array vazio se não houver leads', () => {
            const lista = listarLeads();
            expect(lista).toEqual([]);
        });

        test('deve retornar todos os leads cadastrados', () => {
            cadastrarNovoLead("Lead 1", "l1@t.com", "1", 1);
            cadastrarNovoLead("Lead 2", "l2@t.com", "2", 1);

            const lista = listarLeads();
            expect(lista.length).toBe(2);
        });
    });

    describe('buscarLeadPorNome()', () => {

        beforeEach(() => {
            cadastrarNovoLead("Guilherme Mares", "g@m.com", "123", 1);
            cadastrarNovoLead("Carlos Alberto", "c@a.com", "456", 1);
        });

        test('deve encontrar um lead pelo nome exato', () => {
            const busca = buscarLeadPorNome("Guilherme Mares");
            expect(busca.length).toBe(1);
            expect(busca[0].nome_cliente).toBe("Guilherme Mares");
        });

        test('deve encontrar usando busca parcial e case-insensitive', () => {
            const busca = buscarLeadPorNome("guilh");
            expect(busca.length).toBe(1);
            expect(busca[0].nome_cliente).toBe("Guilherme Mares");
        });

        test('deve retornar array vazio se o fornecedor não existir', () => {
            const busca = buscarLeadPorNome("Inexistente");
            expect(busca).toEqual([]);
        });
    });

    describe('excluirLead()', () => {

        test('deve excluir um lead existente pelo ID', () => {
            // Cria um lead primeiro
            const lead = cadastrarNovoLead("Para Deletar", "del@test.com", "000", 1);
            const id = lead.id_lead;

            // Executa a exclusão
            const resultado = excluirLead(id);

            // Verifica se retornou true e se a lista está vazia
            expect(resultado).toBe(true);
            expect(listarLeads().length).toBe(0);
        });

        test('deve retornar false ao tentar excluir um ID inexistente', () => {
            const resultado = excluirLead(999);
            expect(resultado).toBe(false);
        });
    });

    describe('editarLead()', () => {

        test('deve retornar null se o lead não existir', () => {
            const resultado = editarLead(999, { nome: "Teste" });
            expect(resultado).toBeNull();
        });

        test('deve atualizar apenas os dados fornecidos e manter os antigos', () => {
            const lead = cadastrarNovoLead("Nome Original", "original@teste.com", "111", 1);
            const id = lead.id_lead;

            const resultado = editarLead(id, { nome: "Nome Editado", telefone: "222" });

            expect(resultado).not.toBeNull();
            expect(resultado.nome_cliente).toBe("Nome Editado");
            expect(resultado.telefone).toBe("222");
            // Email não foi passado, deve permanecer o antigo
            expect(decriptar(resultado.email)).toBe("original@teste.com");
            expect(resultado.status).toBe("Novo");
        });

        test('deve rejeitar e-mail inválido na edição (Regex)', () => {
            const lead = cadastrarNovoLead("Nome", "valido@teste.com", "111", 1);
            const id = lead.id_lead;

            const resultado = editarLead(id, { email: "invalido@.com" });
            expect(resultado).toBeNull();
        });

        test('deve encriptar o e-mail caso ele seja alterado', () => {
            const lead = cadastrarNovoLead("Nome", "antigo@teste.com", "111", 1);
            const id = lead.id_lead;

            const resultado = editarLead(id, { email: "novo@teste.com" });

            expect(resultado).not.toBeNull();
            expect(resultado.email).toContain(':'); // IV format validation
            expect(decriptar(resultado.email)).toBe("novo@teste.com");
        });

        test('deve rejeitar uma alteração para um status inválido', () => {
            const lead = cadastrarNovoLead("Teste Status", "status@teste.com", "111", 1);
            const id = lead.id_lead;

            // "Inexistente" não está no nosso Enum do Funil
            const resultado = editarLead(id, { status: "Inexistente" });
            expect(resultado).toBeNull();
        });
    });

    describe('atualizarStatusLead() (Funil de Vendas)', () => {
        test('deve atualizar o status de um lead corretamente', () => {
            const lead = cadastrarNovoLead("Funil", "funil@teste.com", "111", 1);
            // Por padrão, começa como "Novo"
            expect(lead.status).toBe("Novo");

            const resultado = atualizarStatusLead(lead.id_lead, "Qualificado");
            expect(resultado).not.toBeNull();
            expect(resultado.status).toBe("Qualificado");
        });

        test('deve retornar null se passar um status que não existe no funil', () => {
            const lead = cadastrarNovoLead("Erro", "erro@teste.com", "111", 1);

            const resultado = atualizarStatusLead(lead.id_lead, "StatusInventado");
            expect(resultado).toBeNull();
        });
    });

});
