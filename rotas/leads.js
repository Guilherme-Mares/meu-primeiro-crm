import { Router } from 'express';
import { verificarSessao } from '../middlewares/verificarSessao.js';
import {
    listarLeads,
    buscarLeadPorNome,
    cadastrarNovoLead,
    editarLead,
    atualizarStatusLead,
    excluirLead
} from '../funcoes/leads.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { leadSchema } from '../schemas/leads.js';

const router = Router();

// Todas as rotas de leads exigem autenticação
router.use(verificarSessao);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Lista todos os leads ou busca por nome
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Nome do lead para filtrar
 *     responses:
 *       200:
 *         description: Lista de leads retornada com sucesso
 */
router.get('/', async (req, res) => {
    const { busca } = req.query;

    if (busca) {
        const resultados = await buscarLeadPorNome(busca);
        return res.json(resultados);
    }

    const leads = await listarLeads();
    res.json(leads);
});

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Cria um novo lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - telefone
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@cliente.com.br
 *               telefone:
 *                 type: string
 *                 example: "11999998888"
 *     responses:
 *       201:
 *         description: Lead criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validarSchema(leadSchema), async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;
        const { id_usuario } = req.usuario;

        const novoLead = await cadastrarNovoLead(nome, email, telefone, id_usuario);

        if (!novoLead) {
            return res.status(400).json({ erro: 'Dados inválidos. Verifique nome, email e telefone.' });
        }

        res.status(201).json(novoLead);
    } catch (erro) {
        console.error('❌ ERRO CRÍTICO no POST /api/leads:', erro);
        res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar lead.' });
    }
});

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Edita um lead existente
 *     tags: [Leads]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Novo, Contatado, Qualificado, Proposta, Fechado, Perdido]
 *     responses:
 *       200:
 *         description: Lead atualizado com sucesso
 *       400:
 *         description: ID inválido ou dados incorretos
 */
router.put('/:id', validarSchema(leadSchema.partial()), async (req, res) => {
    try {
        const { id } = req.params;
        const novosDados = req.body;

        const atualizado = await editarLead(id, novosDados);

        if (!atualizado) {
            return res.status(400).json({ erro: 'Lead não encontrado ou dados inválidos.' });
        }

        res.json(atualizado);
    } catch (erro) {
        console.error('❌ ERRO no PUT /api/leads:', erro);
        res.status(500).json({ erro: 'Erro ao atualizar lead.' });
    }
});

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Exclui um lead pelo ID
 *     tags: [Leads]
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
 *         description: Lead removido com sucesso
 *       404:
 *         description: Lead não encontrado
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const deletado = await excluirLead(id);

    if (!deletado) {
        return res.status(404).json({ erro: `Lead com ID ${id} não encontrado.` });
    }

    res.json({ mensagem: `Lead com ID ${id} removido com sucesso.` });
});

export default router;
