import express from 'express';
import cors from 'cors';
import authRouter from './rotas/auth.js';
import leadsRouter from './rotas/leads.js';
import interacoesRouter from './rotas/interacoes.js';
import dashboardRouter from './rotas/dashboard.js';
// Middleware disponível para rotas protegidas nas próximas Issues
export { verificarSessao } from './middlewares/verificarSessao.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas públicas
app.get('/api/status', (_req, res) => {
    res.json({
        status: 'ok',
        versao: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rotas de autenticação
app.use('/api', authRouter);

// Rotas de leads (protegidas por JWT)
app.use('/api/leads', leadsRouter);

// Rotas de interações aninhadas (protegidas por JWT)
app.use('/api/leads/:id/interacoes', interacoesRouter);

// Rota de Dashboard KPIs (protegida por JWT)
app.use('/api/dashboard', dashboardRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRM rodando em http://localhost:${PORT}`);
});

// 📚 CONCEITO: Tratamento Global de Erros (Resiliência Sênior)
// Centraliza a captura de exceções para evitar que o Node.js encerre o processo.
app.use((err, req, res, next) => {
    // Erros do Prisma costumam ter meta-dados úteis
    if (err.code && err.code.startsWith('P')) {
        console.error('🗄️  ERRO DE BANCO DE DADOS (Prisma):', err.message);
        return res.status(400).json({ erro: 'Erro nas operações de banco de dados. Verifique os dados enviados.' });
    }

    console.error('💥 ERRO NÃO TRATADO:', err);
    res.status(500).json({
        erro: 'Ocorreu um erro interno inesperado.',
        mensagem: process.env.NODE_ENV === 'development' ? err.message : 'Tente novamente mais tarde.'
    });
});

export default app;
