import { Router } from 'express';
import { verificarSessao } from '../middlewares/verificarSessao.js';
import { listarInteracoesDoLead, adicionarInteracao } from '../funcoes/interacoes.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { interacaoSchema } from '../schemas/interacoes.js';

// mergeParams: true permite acessar o :id definido na rota pai (/api/leads/:id)
const router = Router({ mergeParams: true });

// Todas as rotas exigem autenticação
router.use(verificarSessao);

/**
 * @swagger
 * /api/leads/{id}/interacoes:
 *   get:
 *     summary: Retorna o histórico de interações de um lead
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do lead
 *     responses:
 *       200:
 *         description: Lista de interações do lead
 *       500:
 *         description: Erro ao buscar interações
 */
router.get('/', async (req, res) => {
    try {
        const { id } = req.params;
        const interacoes = await listarInteracoesDoLead(id);
        res.json(interacoes);
    } catch (erro) {
        console.error('❌ ERRO no GET /api/interacoes:', erro);
        res.status(500).json({ erro: 'Erro ao buscar interações do lead.' });
    }
});

/**
 * @swagger
 * /api/leads/{id}/interacoes:
 *   post:
 *     summary: Registra uma nova interação para o lead
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - descricao
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [Ligação, E-mail, WhatsApp, Reunião]
 *                 example: WhatsApp
 *               descricao:
 *                 type: string
 *                 example: Cliente interessado na proposta enviada.
 *     responses:
 *       201:
 *         description: Interação registrada com sucesso
 *       400:
 *         description: Dados inválidos ou ID do lead inexistente
 */
router.post('/', validarSchema(interacaoSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, descricao } = req.body;
        const { id_usuario } = req.usuario;

        if (!tipo || !descricao) {
            return res.status(400).json({ erro: 'Tipo e descrição são obrigatórios.' });
        }

        const novaInteracao = await adicionarInteracao(id, tipo, descricao, id_usuario);

        if (!novaInteracao) {
            return res.status(400).json({ erro: 'Falha ao registrar interação. Verifique o ID do lead e o tipo informado.' });
        }

        res.status(201).json(novaInteracao);
    } catch (erro) {
        console.error('❌ ERRO no POST /api/interacoes:', erro);
        res.status(500).json({ erro: 'Erro interno ao registrar interação.' });
    }
});

export default router;
