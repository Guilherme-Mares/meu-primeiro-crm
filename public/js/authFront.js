/**
 * authFront.js - Gerencia autenticação na página de login.
 * Executado em login.html
 */

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
    // Se o usuário já estiver logado (tem token), redireciona direto
    if (localStorage.getItem('crm_token')) {
        window.location.href = '/index.html';
        return;
    }

    const formLogin = document.getElementById('form-login');
    const divErro = document.getElementById('login-erro');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

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

            // Sucesso - Guardar o token
            localStorage.setItem('crm_token', dados.token);
            
            // Redirecionar para Dashboard
            window.location.href = '/index.html';
            
        } catch (erro) {
            divErro.textContent = erro.message;
            divErro.classList.remove('hidden');
        }
    });
});
