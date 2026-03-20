import { z } from 'zod';

// 📚 CONCEITO: Esquema de Validação para Interações
// Define os tipos permitidos e as regras para a descrição.
export const interacaoSchema = z.object({
    tipo: z.enum(['Ligação', 'E-mail', 'WhatsApp', 'Reunião'], {
        error_map: () => ({ message: "Tipo de interação inválido. Use: Ligação, E-mail, WhatsApp ou Reunião." })
    }),
    
    descricao: z.string({
        required_error: "A descrição é obrigatória."
    })
    .min(5, "A descrição deve ter pelo menos 5 caracteres.")
    .max(500, "A descrição é muito longa (máx 500 caracteres)."),
});
