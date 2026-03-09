import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { fazerLogin } from '../funcoes/usuarios.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'crm-segredo-dev';

/**
 * POST /api/login
 * Recebe { email, senha } e retorna um token JWT se as credenciais forem válidas.
 */
router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = fazerLogin(email, senha);

    if (!usuario) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const payload = {
        id_usuario: usuario.id_usuario,
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
