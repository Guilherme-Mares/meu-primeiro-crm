import { Router } from 'express';
import { verificarSessao } from '../middlewares/verificarSessao.js';
import { listarInteracoesDoLead, adicionarInteracao } from '../funcoes/interacoes.js';

// mergeParams: true permite acessar o :id definido na rota pai (/api/leads/:id)
const router = Router({ mergeParams: true });

// Todas as rotas exigem autenticação
router.use(verificarSessao);

/**
 * GET /api/leads/:id/interacoes
 * Retorna o histórico de interações de um lead específico.
 */
router.get('/', (req, res) => {
    const { id } = req.params;
    const interacoes = listarInteracoesDoLead(id);
    res.json(interacoes);
});

/**
 * POST /api/leads/:id/interacoes
 * Registra uma nova interação para o lead.
 * Body: { tipo, descricao }
 */
router.post('/', (req, res) => {
    const { id } = req.params;
    const { tipo, descricao } = req.body;
    const { id_usuario } = req.usuario;

    if (!tipo || !descricao) {
        return res.status(400).json({ erro: 'Tipo e descrição são obrigatórios.' });
    }

    const novaInteracao = adicionarInteracao(id, tipo, descricao, id_usuario);

    if (!novaInteracao) {
        return res.status(400).json({ erro: 'Falha ao registrar interação. Verifique o ID do lead e o tipo informado.' });
    }

    res.status(201).json(novaInteracao);
});

export default router;
