// =============================================================
// ARQUIVO PRINCIPAL: crm.js
// Ponto de entrada do sistema — Menu interativo no terminal.
//
// 📚 CONCEITO: "Ponto de Entrada"
//    Todo programa precisa de um lugar por onde começar.
//    Este é o arquivo que rodamos com: node crm.js
// =============================================================

// 📚 CONCEITO: require()
//    Importa código de outros arquivos ou módulos do Node.js.
//    - 'readline' é um módulo NATIVO (já vem com o Node, não precisa instalar)
//    - './funcoes/leads' é o NOSSO módulo com a lógica de negócio
import readline from "readline";
import { cadastrarNovoLead, listarLeads, buscarLeadPorNome, excluirLead, editarLead, atualizarStatusLead, STATUS_VALIDOS } from "./funcoes/leads.js";

// 📚 CONCEITO: readline.createInterface()
//    Cria uma "interface" para ler dados que o usuário digita no terminal.
//    - input: process.stdin  → entrada padrão (teclado)
//    - output: process.stdout → saída padrão (tela do terminal)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// =============================================================
// FUNÇÃO: Fazer uma pergunta e esperar a resposta
// =============================================================

/**
 * 📚 CONCEITO: Promises
 *    Uma Promise é uma "promessa" de que um valor vai chegar no futuro.
 *    Usamos isso porque readline.question() é assíncrono — o programa
 *    não pode simplesmente parar e esperar o usuário digitar.
 *    Com await, conseguimos "pausar" de forma elegante.
 *
 * @param {string} pergunta - Texto exibido ao usuário
 * @returns {Promise<string>} A resposta digitada pelo usuário
 */
function perguntar(pergunta) {
    return new Promise((resolve) => {
        rl.question(pergunta, (resposta) => {
            resolve(resposta.trim());
        });
    });
}

// =============================================================
// FUNÇÃO: Exibir o Menu Principal
// =============================================================

function exibirMenu() {
    console.log("\n========================================");
    console.log("        🧑‍💼 MEU PRIMEIRO CRM");
    console.log("========================================");
    console.log("  1. 📝 Cadastrar novo lead");
    console.log("  2. 📋 Listar todos os leads");
    console.log("  3. 🔍 Buscar lead por nome");
    console.log("  4. 🗑️  Excluir lead pelo ID");
    console.log("  5. ✏️  Editar lead pelo ID");
    console.log("  6. 🔄 Avançar status do lead (Funil)");
    console.log("  0. 🚪 Sair");
    console.log("========================================");
}

// =============================================================
// FLUXO: Cadastrar Lead (pede os dados ao usuário)
// =============================================================

/**
 * 📚 CONCEITO: async/await
 *    - async: marca a função como assíncrona
 *    - await: "espera" uma Promise resolver antes de continuar
 *    Isso deixa o código parecendo síncrono (linha por linha),
 *    mesmo sendo assíncrono por baixo dos panos.
 */
async function fluxoCadastrar() {
    console.log("\n--- 📝 CADASTRO DE NOVO LEAD ---\n");

    const nome = await perguntar("Nome do cliente: ");
    const email = await perguntar("Email: ");
    const telefone = await perguntar("Telefone: ");

    cadastrarNovoLead(nome, email, telefone);
}

// =============================================================
// FLUXO: Buscar Lead por Nome
// =============================================================

async function fluxoBuscar() {
    console.log("\n--- 🔍 BUSCA POR NOME ---\n");

    const termo = await perguntar("Digite o nome (ou parte dele): ");
    buscarLeadPorNome(termo);
}

// =============================================================
// FLUXO: Excluir Lead pelo ID
// =============================================================

async function fluxoExcluir() {
    console.log("\n--- 🗑️  EXCLUIR LEAD ---\n");

    const id = await perguntar("Digite o ID do lead que deseja excluir: ");
    excluirLead(id);
}

// =============================================================
// FLUXO: Editar Lead pelo ID
// =============================================================

async function fluxoEditar() {
    console.log("\n--- ✏️  EDITAR LEAD ---\n");
    console.log("Dica: Deixe em branco e aperte Enter para não alterar um campo.");

    const id = await perguntar("ID do lead que deseja editar: ");
    if (!id) return; // Cancela se não passar nada

    const nome = await perguntar("Novo Nome: ");
    const email = await perguntar("Novo Email: ");
    const telefone = await perguntar("Novo Telefone: ");

    editarLead(id, { nome, email, telefone });
}

// =============================================================
// FLUXO: Atualizar Status do Funil de Vendas
// =============================================================

async function fluxoAtualizarStatus() {
    console.log("\n--- 🔄 ATUALIZAR STATUS (FUNIL) ---\n");

    const id = await perguntar("ID do lead: ");
    if (!id) return;

    console.log("\nStatus disponíveis no funil:");
    STATUS_VALIDOS.forEach((status, index) => {
        console.log(`  ${index + 1}. ${status}`);
    });

    const opcao_status = await perguntar("\nDigite o NÚMERO do novo status: ");
    const indice = Number(opcao_status) - 1;

    if (indice >= 0 && indice < STATUS_VALIDOS.length) {
        const novoStatus = STATUS_VALIDOS[indice];
        atualizarStatusLead(id, novoStatus);
    } else {
        console.log("❌ ERRO: Opção de status inválida.");
    }
}

// =============================================================
// LOOP PRINCIPAL DO MENU
//
// 📚 CONCEITO: Loop do-while com switch-case
//    - do-while: executa pelo menos uma vez, depois repete
//      enquanto a condição for verdadeira.
//    - switch-case: escolhe o bloco de código a executar
//      baseado no valor da variável (mais limpo que vários if/else).
// =============================================================

async function iniciar() {
    let opcao = "";

    console.log("\n🚀 Bem-vindo ao seu CRM! Os dados são salvos automaticamente.");

    do {
        exibirMenu();
        opcao = await perguntar("Escolha uma opção: ");

        switch (opcao) {
            case "1":
                await fluxoCadastrar();
                break;

            case "2":
                listarLeads();
                break;

            case "3":
                await fluxoBuscar();
                break;

            case "4":
                await fluxoExcluir();
                break;

            case "5":
                await fluxoEditar();
                break;

            case "6":
                await fluxoAtualizarStatus();
                break;

            case "0":
                console.log("\n👋 Até a próxima! Seus dados estão salvos com segurança.\n");
                break;

            default:
                // 📚 CONCEITO: default no switch
                //    É o "else" do switch — executa quando nenhum case combina.
                console.log("⚠️  Opção inválida! Tente novamente.");
                break;
        }
    } while (opcao !== "0");

    // 📚 CONCEITO: rl.close()
    //    Fecha a interface readline, liberando o terminal.
    //    Sem isso, o programa ficaria "travado" esperando mais input.
    rl.close();
}

// =============================================================
// INICIAR O PROGRAMA
//
// 📚 CONCEITO: Chamada da função principal
//    Declarar uma função não a executa. Precisamos CHAMÁ-LA.
//    É como ligar o motor do carro depois de montá-lo.
// =============================================================
iniciar();
