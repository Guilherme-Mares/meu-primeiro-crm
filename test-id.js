import { cadastrarNovoLead, listarLeads } from "./funcoes/leads.js";
console.log("Cadastrando Primeiro...");
cadastrarNovoLead("Primeiro", "p@t.com", "123", 1);
console.log("Cadastrando Segundo...");
cadastrarNovoLead("Segundo", "s@t.com", "456", 1);
console.log("Listando:");
console.log(listarLeads());
