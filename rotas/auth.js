import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { fazerLogin } from '../funcoes/usuarios.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'crm-segredo-dev';

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: guilherme@crm.pro
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: E-mail e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
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
