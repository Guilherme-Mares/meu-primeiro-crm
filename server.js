import express from 'express';
import cors from 'cors';
import authRouter from './rotas/auth.js';
// Middleware disponível para rotas protegidas nas próximas Issues
export { verificarSessao } from './middlewares/verificarSessao.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRM rodando em http://localhost:${PORT}`);
});

export default app;
