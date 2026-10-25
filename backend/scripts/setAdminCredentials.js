import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function setAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.log('\n❌ Uso incorreto.');
    console.log('📌 Exemplo de uso:');
    console.log('   node scripts/setAdminCredentials.js leticia@estudio.com MinhaSenhaSegura2026\n');
    console.log('Ou configure ADMIN_EMAIL e ADMIN_PASSWORD no seu arquivo .env\n');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ A senha deve ter no mínimo 6 caracteres.');
    process.exit(1);
  }

  console.log(`\n🔒 Configurando credenciais seguras para: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Senha atualizada com sucesso para o usuário: ${user.email}`);
  } else {
    // Se existir o usuário admin legado 'admin@studio.com', vamos atualizá-lo para este novo email
    const legacyAdmin = await prisma.user.findUnique({
      where: { email: 'admin@studio.com' }
    });

    if (legacyAdmin) {
      user = await prisma.user.update({
        where: { id: legacyAdmin.id },
        data: {
          email,
          passwordHash,
          role: 'ADMIN'
        }
      });
      console.log(`✅ Usuário administrador legado atualizado para: ${user.email}`);
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN'
        }
      });
      console.log(`✅ Novo usuário administrador criado: ${user.email}`);
    }
  }

  // Garantir que a estilista Letícia esteja vinculada a este usuário
  const stylist = await prisma.stylist.findFirst({
    where: { name: { contains: 'Letícia' } }
  });

  if (stylist) {
    await prisma.stylist.update({
      where: { id: stylist.id },
      data: { userId: user.id }
    });
    console.log(`🔗 Perfil da estilista "${stylist.name}" associado ao usuário administrador.`);
  }

  console.log('\n🎉 Pronto! As credenciais da administradora estão configuradas.');
  console.log(`📧 E-mail: ${user.email}`);
  console.log(`🔑 Senha: [DEFINIDA COM SUCESSO]\n`);

  await prisma.$disconnect();
}

setAdmin().catch((err) => {
  console.error('❌ Erro ao configurar administrador:', err);
  prisma.$disconnect();
  process.exit(1);
});
