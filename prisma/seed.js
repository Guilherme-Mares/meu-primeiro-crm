import prisma from '../lib/prisma.js';

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Cria o usuário Admin padrão se não existir
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@crm.com' },
        update: {},
        create: {
            nome: 'Admin',
            email: 'admin@crm.com',
            senha: '123',
        },
    });

    console.log(`✅ Usuário Admin garantido: ID ${admin.id} — ${admin.email}`);
}

main()
    .then(() => {
        console.log('🚀 Seed concluído com sucesso!');
        prisma.$disconnect();
    })
    .catch((e) => {
        console.error('❌ Falha no seed:', e);
        prisma.$disconnect();
        process.exit(1);
    });
