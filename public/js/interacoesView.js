/**
 * interacoesView.js - Gerencia o painel lateral (Drawer) de Interações
 * Requer app.js carregado primeiro (usa apiFetch).
 */

let leadInteracaoAtualId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!estado.token) return;

    // Referências DOM - Drawer
    const overlay = document.getElementById('interacoes-overlay');
    const drawer = document.getElementById('interacoes-drawer');
    const btnFechar = document.getElementById('btn-fechar-drawer');
    const timeline = document.getElementById('timeline-interacoes');
    const titulo = document.getElementById('drawer-titulo');
    
    // Referências DOM - Form
    const formInteracao = document.getElementById('form-interacao');
    const inputTipo = document.getElementById('interacao-tipo');
    const inputDescricao = document.getElementById('interacao-descricao');
    const divErro = document.getElementById('interacao-erro');
    const btnSalvar = document.getElementById('btn-salvar-interacao');

    // =========================================================
    // ABERTURA DO DRAWER
    // =========================================================

    // Função global para ser chamada ao clicar na linha da tabela em leadsView.js
    window.abrirDrawerInteracoes = async function(idLead, nomeLead) {
        leadInteracaoAtualId = idLead;
        
        // Setup UI
        titulo.textContent = nomeLead;
        
        // 1. Garante que o overlay vai aparecer e ser clicável
        overlay.classList.remove('hidden');
        // 2. Em seguida adiciona open no drawer para ativar a transição CSS
        setTimeout(() => drawer.classList.add('open'), 10);
        
        formInteracao.reset();
        divErro.classList.add('hidden');

        await carregarInteracoes();
    };

    window.fecharDrawerInteracoes = function() {
        // 1. Slide para fora
        drawer.classList.remove('open');
        // 2. Após a animação de saída, bloqueia cliques no overlay
        setTimeout(() => {
            overlay.classList.add('hidden');
            leadInteracaoAtualId = null;
        }, 310); // levemente após o transition de 0.3s
    };

    // =========================================================
    // LISTAGEM (TIMELINE)
    // =========================================================

    async function carregarInteracoes() {
        if (!leadInteracaoAtualId) return;

        try {
            timeline.innerHTML = '<p class="text-muted" style="text-align: center; margin-top: 2rem;">Buscando histórico...</p>';
            
            const interacoes = await apiFetch(`/leads/${leadInteracaoAtualId}/interacoes`);
            renderizarTimeline(interacoes);

        } catch (erro) {
            timeline.innerHTML = `<p class="text-danger" style="text-align: center; margin-top: 2rem;">Erro ao carregar: ${erro.message}</p>`;
        }
    }

    function renderizarTimeline(interacoes) {
        timeline.innerHTML = '';
        
        if (!interacoes || interacoes.length === 0) {
            timeline.innerHTML = `
                <div style="text-align: center; margin-top: 3rem; color: var(--color-text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📭</div>
                    <p>Nenhuma interação registrada.</p>
                    <p style="font-size: 0.85rem;">Registre o primeiro contato abaixo!</p>
                </div>
            `;
            return;
        }

        // Renderiza do mais antigo para o mais novo, ou vice-versa. 
        // Vamos inverter para mostrar o mais recente no topo.
        const interacoesReversas = [...interacoes].reverse();

        interacoesReversas.forEach(int => {
            const divItem = document.createElement('div');
            divItem.className = 'timeline-item';
            
            // Emoji inteligente com base no tipo
            let icon = '📝';
            if (int.tipo === 'Ligação') icon = '📞';
            if (int.tipo === 'E-mail') icon = '✉️';
            if (int.tipo === 'WhatsApp') icon = '💬';
            if (int.tipo === 'Reunião') icon = '🤝';

            divItem.innerHTML = `
                <div class="timeline-card">
                    <div class="timeline-header">
                        <span class="timeline-tipo">${icon} ${int.tipo}</span>
                        <span class="timeline-data">${int.data_hora || int.data_interacao}</span>
                    </div>
                    <div class="timeline-desc text-muted" style="font-size: 0.9rem; margin-top: 0.5rem; white-space: pre-wrap;">${int.descricao}</div>
                </div>
            `;
            timeline.appendChild(divItem);
        });
    }

    // =========================================================
    // CRIAÇÃO (POST)
    // =========================================================

    formInteracao.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!leadInteracaoAtualId) return;

        const payload = {
            tipo: inputTipo.value.replace(/[^a-zA-Zçãáéíóú-]/g, '').trim(), // Limpa os emojis do select caso o value passe
            descricao: inputDescricao.value
        };
        
        // Garante que o tipo seja um dos válidos (Ligação, E-mail, WhatsApp, Reunião)
        // O HTML value já os enviará corretos. Ex: value="Ligação" mesmo que no option mostre 📞 Ligação
        const tipoReal = inputTipo.value;

        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Registrando...';
        divErro.classList.add('hidden');

        try {
            await apiFetch(`/leads/${leadInteracaoAtualId}/interacoes`, {
                method: 'POST',
                body: JSON.stringify({
                    tipo: tipoReal,
                    descricao: inputDescricao.value
                })
            });

            // Sucesso!
            formInteracao.reset(); // Limpa apenas a descrição e volta para o seletor padrão
            inputTipo.focus(); // Facilita novo cadastro
            await carregarInteracoes(); // Atualiza a timeline instantaneamente

        } catch (erro) {
            divErro.textContent = erro.message;
            divErro.classList.remove('hidden');
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Registrar Interação';
        }
    });

    // =========================================================
    // EVENT LISTENERS GLOBAIS
    // =========================================================
    
    btnFechar.addEventListener('click', window.fecharDrawerInteracoes);
    overlay.addEventListener('click', window.fecharDrawerInteracoes); // Clicar fora fecha o drawer
});
