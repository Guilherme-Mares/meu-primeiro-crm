// =============================================================
// PROJETO: MEU PRIMEIRO CRM (Lógica de Cadastro de Lead)
// =============================================================

// 1. O "BANCO DE DADOS" (Uma lista na memória do PC)
const bancoDeDados = [];

/**
 * Função que executa o fluxo de cadastro desenhado no Lucidchart
 */
function cadastrarNovoLead(nome, email, telefone) {
    console.log("\n--- [SISTEMA] Iniciando processo de cadastro... ---");

    // [RAIA DO VENDEDOR] -> [INPUT: Vendedor preenche formulário]
    // Os dados chegam aqui através das variáveis nome, email e telefone.

    // [RAIA DO SISTEMA] -> [LOSANGO: Campos obrigatórios preenchidos?]
    if (!nome || !email || !telefone) {
        // [RETÂNGULO: Exibir erro ao usuário]
        console.log("❌ ERRO DE VALIDAÇÃO: Todos os campos devem ser preenchidos.");
        return; // Encerra aqui, exatamente como a seta "Não" do desenho.
    }

    // [RETÂNGULO: Criptografar dados sensíveis]
    // Simulando uma criptografia simples para fins de aprendizado
    const emailSeguro = Buffer.from(email).toString('base64'); 
    console.log("🔒 Dados sensíveis criptografados com sucesso.");

    // [RETÂNGULO: Salvar no DB]
    // Criando o objeto conforme o DER (Entidade Lead)
    const novoLead = {
        id_lead: bancoDeDados.length + 1,
        nome_cliente: nome,
        email: emailSeguro,
        telefone: telefone,
        status: "Novo",
        data_criacao: new Date().toLocaleDateString()
    };

    bancoDeDados.push(novoLead);

    // [OVAL: Fim; Lead disponível no Dashboard]
    console.log("✅ SUCESSO: Lead cadastrado e disponível no sistema!");
    console.log("Visualização do Registro:", novoLead);
}

// =============================================================
// ÁREA DE TESTES (Simulando o uso real)
// =============================================================

// Teste 1: Tentando cadastrar sem e-mail (Deve cair no erro)
cadastrarNovoLead("Carlos Alberto", "", "11977776666");

// Teste 2: Cadastrando corretamente (Deve funcionar)
cadastrarNovoLead("Guilherme Mares", "guilherme@teste.com", "11988884444");

// Verificando quantos leads temos agora
console.log(`\nTotal de leads no banco: ${bancoDeDados.length}`);