import { z } from 'zod';
import { STATUS_VALIDOS } from '../funcoes/leads.js';

// 📚 CONCEITO: Esquema de Validação para Leads
// Garantimos que o nome tenha tamanho mínimo, o email seja válido e o status esteja no funil.
export const leadSchema = z.object({
    nome: z.string({
        required_error: "O nome é obrigatório.",
        invalid_type_error: "O nome deve ser uma string."
    })
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome pode ter no máximo 100 caracteres."),

    email: z.string({
        required_error: "O email é obrigatório."
    })
    .email("O formato do email é inválido."),

    telefone: z.string()
    .min(8, "O telefone deve ter pelo menos 8 dígitos.")
    .max(20, "O telefone é muito longo."),

    status: z.enum(STATUS_VALIDOS, {
        error_map: () => ({ message: "O status informado não faz parte do funil de vendas." })
    })
    .optional(),
});
