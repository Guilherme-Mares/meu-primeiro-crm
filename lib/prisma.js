import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// 📚 CONCEITO: Padrão Singleton
// Criamos UMA única instância do PrismaClient e a reutilizamos em toda a aplicação.
// Usando Prisma v6 para estabilidade com SQLite local.
const prisma = new PrismaClient();

export default prisma;
