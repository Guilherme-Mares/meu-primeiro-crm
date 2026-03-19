import prisma from '../lib/prisma.js';

/**
 * Tenta realizar o login de um usuário consultando o banco de dados.
 *
 * @param {string} email - Email digitado.
 * @param {string} senha - Senha digitada.
 * @returns {Object|null} Objeto do usuário logado ou null.
 */
export async function fazerLogin(email, senha) {
    const usuario = await prisma.usuario.findFirst({
        where: { email, senha }
    });

    if (!usuario) {
        console.log('❌ ERRO: E-mail ou senha inválidos.');
        return null;
    }

    console.log(`\n✅ Login bem-sucedido! Bem-vindo, ${usuario.nome}.`);
    return usuario;
}
