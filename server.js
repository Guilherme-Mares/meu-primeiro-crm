import express from 'express';
import cors from 'cors';
import authRouter from './rotas/auth.js';
import leadsRouter from './rotas/leads.js';
import interacoesRouter from './rotas/interacoes.js';
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRM rodando em http://localhost:${PORT}`);
});

export default app;
