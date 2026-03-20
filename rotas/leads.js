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
 * GET /api/leads
 * Retorna todos os leads. Aceita ?busca=nome para filtrar.
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
 * POST /api/leads
 * Cria um novo lead. Usa o id_usuario do token JWT.
 * Body: { nome, email, telefone }
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
 * Edita um lead existente.
 * Body: { nome?, email?, telefone?, status? }
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
 * DELETE /api/leads/:id
 * Exclui um lead pelo ID.
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
