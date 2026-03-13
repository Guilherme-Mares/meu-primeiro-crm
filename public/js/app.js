/**
 * app.js - Ponto de entrada do Frontend
 * Gerencia a comunicação com a API (fetch) e o estado da interface.
 */

const API_BASE = '/api';

// Estado global simples
const estado = {
    token: localStorage.getItem('crm_token') || null,
    usuario: null
};

// =========================================================================
// MÓDULO DE REQUISIÇÕES (HTTP CLIENT)
// =========================================================================

/**
 * Faz requisições para a API injetando o Token JWT e tratando erros.
 */
async function apiFetch(endpoint, opcoes = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(opcoes.headers || {})
    };

    if (estado.token) {
        headers['Authorization'] = `Bearer ${estado.token}`;
    }

    try {
        const resposta = await fetch(`${API_BASE}${endpoint}`, {
            ...opcoes,
            headers
        });

        const dados = await resposta.json().catch(() => ({}));

        // Se o token for inválido, limpa e pede login
        if (resposta.status === 401) {
            fazerLogout();
            throw new Error('Não autorizado');
        }

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro na requisição');
        }

        return dados;
    } catch (erro) {
        console.error('Erro de API:', erro);
        throw erro;
    }
}

// =========================================================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// =========================================================================

function inicializarApp() {
    if (estado.token) {
        // Obter os dados do usuário a partir do token (payload JWT)
        try {
            const payloadDecoded = JSON.parse(atob(estado.token.split('.')[1]));
            estado.usuario = payloadDecoded;
            atualizarInterfaceUsuario();
        } catch (e) {
            fazerLogout();
        }
    } else {
        redirecionarParaLogin();
    }
}

function fazerLogout() {
    estado.token = null;
    estado.usuario = null;
    localStorage.removeItem('crm_token');
    redirecionarParaLogin();
}

function redirecionarParaLogin() {
    window.location.href = '/login.html';
}

// =========================================================================
// MANIPULAÇÃO DA INTERFACE (DOM)
// =========================================================================

function atualizarInterfaceUsuario() {
    if (estado.usuario) {
        document.getElementById('user-name').textContent = estado.usuario.nome;
    }
}

// =========================================================================
// INICIALIZAÇÃO E EVENT LISTENERS
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Configura botões
    document.getElementById('btn-logout').addEventListener('click', fazerLogout);
    
    // Inicia fluxo principal
    inicializarApp();
});
