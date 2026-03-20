import { z } from 'zod';

/**
 * Middleware de Validação de Esquema (Padrão Sênior)
 * @param {z.ZodSchema} schema - O esquema Zod para validar o corpo da requisição.
 * @returns {Function} Middleware Express.
 */
export const validarSchema = (schema) => (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
        // Formata os erros do Zod para algo legível pelo frontend
        // Usamos .issues pois é o padrão mais estável do Zod
        const errosSimples = (resultado.error.issues || []).map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
        }));

        console.log(`⚠️  FALHA NA VALIDAÇÃO:`, errosSimples);
        
        return res.status(400).json({
            erro: 'Dados de entrada inválidos.',
            detalhes: errosSimples
        });
    }

    // Se validou, injeta os dados "limpos" no body e prossegue
    req.body = resultado.data;
    next();
};
