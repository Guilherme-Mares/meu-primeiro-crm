import crypto from 'crypto';

/**
 * 📚 CONCEITO: Criptografia Simétrica (AES-256-CBC)
 * 
 * Usamos a mesma chave para encriptar e decriptar.
 * 
 * Componentes:
 * - ALGORITMO: 'aes-256-cbc' (Padrão de alta segurança).
 * - CHAVE (Key): Deve ter exatamente 32 caracteres (256 bits).
 * - IV (Vetor de Inicialização): 16 caracteres aleatórios para garantir que
 *   o mesmo texto encriptado duas vezes resulte em hashes diferentes.
 */

const ALGORITMO = 'aes-256-cbc';

// 🔌 PRÁTICA SENIOR: Chaves devem vir de variáveis de ambiente (.env)
// Por enquanto, usaremos uma chave fixa para facilitar seu teste local,
// mas em um projeto real, NUNCA deixe a chave no código.
const CHAVE_SECRETA = Buffer.from('12345678901234567890123456789012'); // 32 caracteres
const IV_TAMANHO = 16;

/**
 * Encripta um texto plano em uma string cifrada.
 * Formato de saída: iv_hexadecimal:texto_cifrado_hexadecimal
 */
export function encriptar(texto) {
    const iv = crypto.randomBytes(IV_TAMANHO);
    const cipher = crypto.createCipheriv(ALGORITMO, CHAVE_SECRETA, iv);

    let encriptado = cipher.update(texto, 'utf8', 'hex');
    encriptado += cipher.final('hex');

    // Retornamos o IV junto com o texto porque precisaremos dele para decriptar depois
    return `${iv.toString('hex')}:${encriptado}`;
}

/**
 * Decripta um texto cifrado (no formato iv:texto) de volta para o original.
 */
export function decriptar(textoCifradoCompleto) {
    try {
        const [ivHex, encriptadoHex] = textoCifradoCompleto.split(':');

        if (!ivHex || !encriptadoHex) return "Erro: Formato inválido";

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITMO, CHAVE_SECRETA, iv);

        let decriptado = decipher.update(encriptadoHex, 'hex', 'utf8');
        decriptado += decipher.final('utf8');

        return decriptado;
    } catch (erro) {
        return "Erro: Falha ao decriptar dados.";
    }
}
