import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Não usamos .test.json por enquanto pois não faremos suíte pesada de auth
const CAMINHO_ARQUIVO = path.join(__dirname, "..", "dados", "usuarios.json");

/**
 * Carrega a lista de usuários do banco de dados (JSON)
 * @returns {Array} Array de usuários
 */
function carregarUsuarios() {
    try {
        const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, "utf-8");
        return JSON.parse(conteudo);
    } catch (erro) {
        // Se não existir, retorna array vazio (não recria o admin aqui para não sobrescrever)
        return [];
    }
}

/**
 * Tenta realizar o login de um usuário no sistema.
 * 
 * @param {string} email - Email digitado.
 * @param {string} senha - Senha digitada.
 * @returns {Object|null} Retorna o objeto do usuário logado ou null se falhar.
 */
export function fazerLogin(email, senha) {
    const usuarios = carregarUsuarios();

    const usuarioEncontrado = usuarios.find(
        (u) => u.email === email && u.senha === senha
    );

    if (!usuarioEncontrado) {
        console.log("❌ ERRO: E-mail ou senha inválidos.");
        return null;
    }

    console.log(`\n✅ Login bem-sucedido! Bem-vindo, ${usuarioEncontrado.nome}.`);
    return usuarioEncontrado;
}
