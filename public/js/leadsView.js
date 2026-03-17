/**
 * leadsView.js - Gerencia a interface da Tabela de Leads
 * Requer app.js carregado primeiro (usa apiFetch).
 */

let leadsLocais = []; // Guarda os leads em memória para edição

document.addEventListener('DOMContentLoaded', () => {
    if (!estado.token) return;

    const tbody = document.getElementById('leads-table-body');
    const modal = document.getElementById('lead-modal');
    const formLead = document.getElementById('form-lead');
    const divErro = document.getElementById('lead-erro');

    // Mapeia os inputs 
    const inputs = {
        id: document.getElementById('lead-id'),
        nome: document.getElementById('lead-nome'),
        email: document.getElementById('lead-email'),
        telefone: document.getElementById('lead-telefone'),
        status: document.getElementById('lead-status')
    };

    // =========================================================
    // RENDERIZAÇÃO
    // =========================================================

    async function carregarLeads() {
        try {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
            leadsLocais = await apiFetch('/leads');
            renderizarTabela();
        } catch (erro) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger" style="text-align:center;">Erro ao carregar leads: ${erro.message}</td></tr>`;
        }
    }

    function renderizarTabela() {
        tbody.innerHTML = '';
        
        if (!leadsLocais || leadsLocais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;" class="text-muted">Nenhum cliente cadastrado ainda.</td></tr>`;
            return;
        }

        leadsLocais.forEach(lead => {
            const tr = document.createElement('tr');
            const statusClass = `badge-status-${lead.status.toLowerCase().replace(' ', '')}`;

            tr.innerHTML = `
                <td style="font-weight: 500;">${lead.nome_cliente}</td>
                <td class="text-muted" title="${lead.email}">Oculto (Segurança)</td>
                <td>${lead.telefone}</td>
                <td><span class="badge ${statusClass}">${lead.status}</span></td>
                <td class="text-muted">${lead.data_criacao}</td>
                <td style="text-align: right;">
                    <button class="action-btn" onclick="event.stopPropagation(); window.abrirModalEdicao(${lead.id_lead})" title="Editar">✏️</button>
                    <button class="action-btn" onclick="event.stopPropagation(); window.excluirLead(${lead.id_lead})" title="Excluir">🗑️</button>
                </td>
            `;

            // Permite clicar na linha inteira para ver o histórico (Issue 8)
            tr.style.cursor = 'pointer';
            tr.onclick = () => window.abrirDrawerInteracoes(lead.id_lead, lead.nome_cliente);

            tbody.appendChild(tr);
        });
    }

    // =========================================================
    // MODAL
    // =========================================================

    // Deixa global para o onclick="window..." funcionar
    window.abrirModalInclusao = function() {
        document.getElementById('modal-titulo').textContent = 'Novo Lead';
        formLead.reset();
        inputs.id.value = '';
        inputs.status.value = 'Novo';
        inputs.email.placeholder = '';
        inputs.email.required = true;
        divErro.classList.add('hidden');
        modal.classList.remove('hidden');
    }

    window.abrirModalEdicao = function(id) {
        const lead = leadsLocais.find(l => l.id_lead === id);
        if (!lead) return;

        document.getElementById('modal-titulo').textContent = 'Editar Lead';
        formLead.reset();
        divErro.classList.add('hidden');

        inputs.id.value = lead.id_lead;
        inputs.nome.value = lead.nome_cliente;
        inputs.email.value = ''; 
        inputs.email.required = false; 
        inputs.email.placeholder = 'Deixe em branco para manter original';
        inputs.telefone.value = lead.telefone;
        inputs.status.value = lead.status;

        modal.classList.remove('hidden');
    }

    window.fecharModal = function() {
        modal.classList.add('hidden');
    }

    // =========================================================
    // CRUD API
    // =========================================================

    formLead.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEdicao = inputs.id.value !== '';
        const payload = {
            nome: inputs.nome.value,
            telefone: inputs.telefone.value,
            status: inputs.status.value
        };

        if (inputs.email.value) payload.email = inputs.email.value;

        const btnSalvar = document.getElementById('btn-salvar-lead');
        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';

        try {
            if (isEdicao) {
                await apiFetch(`/leads/${inputs.id.value}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                if (!payload.email) throw new Error("E-mail é obrigatório.");
                await apiFetch(`/leads`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            window.fecharModal();
            carregarLeads(); // Recarrega
        } catch (erro) {
            divErro.textContent = erro.message;
            divErro.classList.remove('hidden');
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Lead';
        }
    });

    window.excluirLead = async function(id) {
        if (!confirm('Tem certeza que deseja remover este cliente? A ação é irreversível.')) return;
        try {
            await apiFetch(`/leads/${id}`, { method: 'DELETE' });
            carregarLeads();
        } catch (erro) {
            alert('Falha ao excluir lead: ' + erro.message);
        }
    }

    // =========================================================
    // INÍCIO
    // =========================================================
    document.getElementById('btn-novo-lead').addEventListener('click', window.abrirModalInclusao);
    document.getElementById('btn-fechar-modal').addEventListener('click', (e) => { e.preventDefault(); window.fecharModal(); });

    carregarLeads();
});
