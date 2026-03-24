import { Router } from 'express';
import { verificarSessao } from '../middlewares/verificarSessao.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Dashboard exige autenticação
router.use(verificarSessao);

/**
 * @swagger
 * /api/dashboard/kpis:
 *   get:
 *     summary: Retorna os KPIs do funil de vendas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo estatístico dos leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLeads:
 *                   type: integer
 *                 leadsFechados:
 *                   type: integer
 *                 taxaConversao:
 *                   type: number
 *                 distribuicaoStatus:
 *                   type: object
 */
router.get('/kpis', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany();

        const totalLeads = leads.length;
        let leadsFechados = 0;
        const distribuicaoStatus = {};

        leads.forEach(lead => {
            if (lead.status === 'Fechado') leadsFechados++;

            distribuicaoStatus[lead.status] = (distribuicaoStatus[lead.status] || 0) + 1;
        });

        const taxaConversao = totalLeads === 0 ? 0 : ((leadsFechados / totalLeads) * 100).toFixed(2);

        res.json({
            totalLeads,
            leadsFechados,
            taxaConversao: Number(taxaConversao),
            distribuicaoStatus
        });
    } catch (erro) {
        console.error('Erro ao calcular KPIs do dashboard:', erro);
        res.status(500).json({ erro: 'Falha ao processar os dados do dashboard.' });
    }
});

export default router;
