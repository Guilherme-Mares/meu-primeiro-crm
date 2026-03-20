import request from 'supertest';
import app from '../server.js';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../rotas/auth.js';

describe('🚀 Testes de Validação (Zod + Middlewares)', () => {
    let token;

    beforeAll(async () => {
        // Garante usuário admin para o token
        const user = await prisma.usuario.upsert({
            where: { email: 'admin@crm.com' },
            update: {},
            create: { nome: 'Admin', email: 'admin@crm.com', senha: '123' }
        });
        token = jwt.sign({ id_usuario: user.id, email: user.email }, JWT_SECRET);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('Deve rejeitar cadastro de lead com email inválido', async () => {
        const response = await request(app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Teste Invalido',
                email: 'email_errado',
                telefone: '12345678'
            });

        expect(response.status).toBe(400);
        expect(response.body.erro).toBe('Dados de entrada inválidos.');
        expect(response.body.detalhes[0].campo).toBe('email');
    });

    test('Deve rejeitar cadastro de lead com nome muito curto', async () => {
        const response = await request(app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nome: 'Ab',
                email: 'teste@valid.com',
                telefone: '12345678'
            });

        expect(response.status).toBe(400);
        expect(response.body.detalhes[0].mensagem).toContain('pelo menos 3 caracteres');
    });

    test('Deve rejeitar interação com tipo inválido', async () => {
        // Primeiro precisamos de um lead
        const lead = await prisma.lead.create({
            data: {
                nome_cliente: 'Lead Teste',
                email: 'lead@teste.com',
                telefone: '11111111',
                data_criacao: '20/03/2026',
                id_usuario: 1
            }
        });

        const response = await request(app)
            .post(`/api/leads/${lead.id}/interacoes`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                tipo: 'Sinal de Fumaça',
                descricao: 'Teste de erro'
            });

        expect(response.status).toBe(400);
        expect(response.body.detalhes[0].mensagem).toContain('Tipo de interação inválido');
    });
});
