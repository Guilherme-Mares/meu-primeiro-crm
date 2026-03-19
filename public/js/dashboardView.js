/**
 * dashboardView.js - Gerencia os Cards de KPI e o Gráfico do Funil de Vendas
 * Requer app.js e Chart.js carregados primeiro.
 */

// Referência única ao objeto do gráfico para evitar duplicatas ao recarregar
let funnelChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!estado.token) return;
    carregarDashboard();
});

// =========================================================
// CARREGAMENTO DE DADOS
// =========================================================

/**
 * Busca os KPIs da API e orquestra a atualização da UI.
 */
async function carregarDashboard() {
    try {
        const kpis = await apiFetch('/dashboard/kpis');

        // Atualiza os cards de números
        document.getElementById('kpi-total').textContent = kpis.totalLeads;
        document.getElementById('kpi-fechados').textContent = kpis.leadsFechados;
        document.getElementById('kpi-conversao').textContent = `${kpis.taxaConversao}%`;

        // Renderiza o gráfico com a distribuição dos status
        renderizarGrafico(kpis.distribuicaoStatus);

        // Revela a seção (estava oculta para evitar "flash" de zeros)
        document.getElementById('dashboard-resumo').style.display = '';

    } catch (erro) {
        console.error('[Dashboard] Erro ao carregar KPIs:', erro.message);
        // Dashboard é complementar: não exibimos um alerta agressive,
        // apenas registramos o erro e a seção permanece oculta.
    }
}

// =========================================================
// GRÁFICO (CHART.JS)
// =========================================================

// Paleta de cores consistente com o design system do CRM
const CORES_STATUS = {
    'Novo':        'rgba(96, 165, 250, 0.85)',   // Azul claro
    'Contatado':   'rgba(251, 191, 36, 0.85)',   // Amarelo
    'Qualificado': 'rgba(167, 139, 250, 0.85)',  // Roxo
    'Proposta':    'rgba(251, 146, 60, 0.85)',   // Laranja
    'Fechado':     'rgba(52, 211, 153, 0.85)',   // Verde
    'Perdido':     'rgba(248, 113, 113, 0.85)',  // Vermelho
};

const BORDA_STATUS = {
    'Novo':        'rgb(96, 165, 250)',
    'Contatado':   'rgb(251, 191, 36)',
    'Qualificado': 'rgb(167, 139, 250)',
    'Proposta':    'rgb(251, 146, 60)',
    'Fechado':     'rgb(52, 211, 153)',
    'Perdido':     'rgb(248, 113, 113)',
};

/**
 * Instancia ou atualiza o gráfico do funil usando Chart.js.
 * @param {Object} distribuicaoStatus - Ex: { Novo: 5, Fechado: 2 }
 */
function renderizarGrafico(distribuicaoStatus) {
    const labels = Object.keys(distribuicaoStatus);
    const valores = Object.values(distribuicaoStatus);
    const cores = labels.map(l => CORES_STATUS[l] || 'rgba(148, 163, 184, 0.85)');
    const bordas = labels.map(l => BORDA_STATUS[l] || 'rgb(148, 163, 184)');

    const ctx = document.getElementById('funnelChart').getContext('2d');

    // Se o gráfico já existe, destroemos antes de recriar para evitar bugs visuais
    if (funnelChartInstance) {
        funnelChartInstance.destroy();
    }

    funnelChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderColor: bordas,
                borderWidth: 1.5,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: { size: 11, family: "'Inter', sans-serif" },
                        color: getComputedStyle(document.documentElement)
                                   .getPropertyValue('--color-text').trim() || '#334155'
                    }
                },
                tooltip: {
                    callbacks: {
                        // Exibe o percentual no tooltip ao passar o mouse
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((context.parsed / total) * 100).toFixed(1);
                            return ` ${context.label}: ${context.parsed} (${pct}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 600
            }
        }
    });
}
