import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    cadastrarNovoLead,
    listarLeads,
    buscarLeadPorNome,
    salvarLeads,
    excluirLead
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
            const resultado = cadastrarNovoLead(nome, email, telefone);

            // Assert (Verificar)
            expect(resultado).not.toBeNull();
            expect(resultado.nome_cliente).toBe(nome);
            expect(resultado.id_lead).toBe(1); // Primeiro lead deve ter ID 1
            expect(resultado.status).toBe("Novo");
        });

        test('deve retornar null se faltar algum campo obrigatório', () => {
            const resultado = cadastrarNovoLead("Sem Email", "", "11988887777");
            expect(resultado).toBeNull();
        });

        test('deve retornar null se o formato do email for inválido (regex)', () => {
            // E-mail sem @
            let resultado = cadastrarNovoLead("Teste", "emailinvalido.com", "123");
            expect(resultado).toBeNull();

            // E-mail sem ponto após o domínio
            resultado = cadastrarNovoLead("Teste", "email@dominio", "123");
            expect(resultado).toBeNull();

            // Email com espaços
            resultado = cadastrarNovoLead("Teste", "em ail@dominio.com", "123");
            expect(resultado).toBeNull();
        });

        test('deve gerar IDs incrementais corretamente', () => {
            cadastrarNovoLead("Primeiro", "p@t.com", "123");
            const segundo = cadastrarNovoLead("Segundo", "s@t.com", "456");

            expect(segundo.id_lead).toBe(2);
        });

        test('deve encriptar o email de forma segura (não ser Base64 simples)', () => {
            const email = "secreto@teste.com";
            const resultado = cadastrarNovoLead("Admin", email, "000");

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
            cadastrarNovoLead("Lead 1", "l1@t.com", "1");
            cadastrarNovoLead("Lead 2", "l2@t.com", "2");

            const lista = listarLeads();
            expect(lista.length).toBe(2);
        });
    });

    describe('buscarLeadPorNome()', () => {

        beforeEach(() => {
            cadastrarNovoLead("Guilherme Mares", "g@m.com", "123");
            cadastrarNovoLead("Carlos Alberto", "c@a.com", "456");
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
            const lead = cadastrarNovoLead("Para Deletar", "del@test.com", "000");
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

});
