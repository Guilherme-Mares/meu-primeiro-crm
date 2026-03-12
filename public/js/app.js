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
            mostrarLogin(dados.erro || 'Sessão expirada. Faça login novamente.');
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
            esconderLogin();
        } catch (e) {
            fazerLogout();
        }
    } else {
        mostrarLogin();
    }
}

async function submeterLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const divErro = document.getElementById('login-erro');

    try {
        divErro.classList.add('hidden');
        const resposta = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Falha no login');
        }

        // Sucesso
        estado.token = dados.token;
        localStorage.setItem('crm_token', dados.token);
        
        const payloadDecoded = JSON.parse(atob(dados.token.split('.')[1]));
        estado.usuario = payloadDecoded;
        
        atualizarInterfaceUsuario();
        esconderLogin();
    } catch (erro) {
        divErro.textContent = erro.message;
        divErro.classList.remove('hidden');
    }
}

function fazerLogout() {
    estado.token = null;
    estado.usuario = null;
    localStorage.removeItem('crm_token');
    mostrarLogin();
}

// =========================================================================
// MANIPULAÇÃO DA INTERFACE (DOM)
// =========================================================================

function mostrarLogin(mensagem = '') {
    document.getElementById('app').style.display = 'none';
    const modal = document.getElementById('login-modal');
    modal.classList.remove('hidden');
    
    if (mensagem) {
        const divErro = document.getElementById('login-erro');
        divErro.textContent = mensagem;
        divErro.classList.remove('hidden');
    }
}

function esconderLogin() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('app').style.display = 'flex';
}

function atualizarInterfaceUsuario() {
    if (estado.usuario) {
        document.getElementById('user-name').textContent = estado.usuario.nome;
    }
}

// =========================================================================
// INICIALIZAÇÃO E EVENT LISTENERS
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Configura botões e formulários
    document.getElementById('form-login').addEventListener('submit', submeterLogin);
    document.getElementById('btn-logout').addEventListener('click', fazerLogout);
    
    // Inicia fluxo principal
    inicializarApp();
});
