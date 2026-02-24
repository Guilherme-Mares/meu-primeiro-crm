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
import { cadastrarNovoLead, listarLeads, buscarLeadPorNome } from "./funcoes/leads.js";

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
