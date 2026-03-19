import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { fazerLogin } from '../funcoes/usuarios.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'crm-segredo-dev';

/**
 * POST /api/login
 * Recebe { email, senha } e retorna um token JWT se as credenciais forem válidas.
 */
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    // fazerLogin agora é async (consulta o banco via Prisma)
    const usuario = await fazerLogin(email, senha);

    if (!usuario) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    // Prisma usa `id` como campo padrão, não `id_usuario`
    const payload = {
        id_usuario: usuario.id,
        nome: usuario.nome,
        email: usuario.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
        mensagem: `Login bem-sucedido! Bem-vindo, ${usuario.nome}.`,
        token
    });
});

export default router;
export { JWT_SECRET };
