import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../rotas/auth.js';

/**
 * Middleware que verifica se o request possui um token JWT válido.
 * Se válido, injeta os dados do usuário em `req.usuario`.
 * Caso contrário, retorna 401.
 */
export function verificarSessao(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token não fornecido. Faça login primeiro.' });
    }

    const token = cabecalho.split(' ')[1];

    try {
        const dadosUsuario = jwt.verify(token, JWT_SECRET);
        req.usuario = dadosUsuario;
        next();
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}
