import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados com dados da Letícia Oliveira...');

  // 1. Limpar dados existentes em ordem de dependência
  await prisma.portfolioItem.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.stylistService.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.stylist.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Criar Usuário Administrador (Dona do Studio)
  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@studio.com').trim().toLowerCase();
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
  const adminUser = await prisma.user.create({
    data: {
      email: defaultAdminEmail,
      passwordHash,
      role: 'ADMIN'
    }
  });
  console.log(`👤 Usuário administrador criado: ${adminUser.email}`);

  // 3. Criar Estilista Principal (Letícia Oliveira)
  const leticiaBio = `Prazer, sou a Letícia! ✨

Tenho 25 anos e sempre fui apaixonada por embelezar mulheres. Antes mesmo de imaginar que isso se tornaria minha profissão, eu já era aquela pessoa que fazia as sobrancelhas de todo mundo. As pessoas gostavam de como eu fazia as minhas e logo começaram a me pedir para fazer as delas também.

Foi em 2023 que comecei a me enxergar nessa área e percebi que aquela paixão poderia se transformar em algo muito maior. Assim, dei início à minha caminhada no universo das sobrancelhas, descobrindo, a cada etapa, novas possibilidades de crescimento e realização.

Hoje, meu trabalho vai muito além de um procedimento estético. É sobre valorizar a beleza individual, respeitar cada expressão e contribuir para que cada mulher se sinta ainda mais bonita e confiante.

Sigo construindo minha história com dedicação, amor pelo que faço e o desejo de evoluir cada vez mais.

Seja bem-vinda ao meu espaço! Será um prazer cuidar de você.`;

  const stylist = await prisma.stylist.create({
    data: {
      userId: adminUser.id,
      name: 'Letícia Oliveira',
      bio: leticiaBio,
      photoUrl: '/leticia-perfil.jpg',
      phone: '5551995037223',
      active: true
    }
  });
  console.log(`💄 Estilista criada: ${stylist.name}`);

  // 4. Inserir a Tabela Oficial de Serviços da Letícia Oliveira
  const initialServices = [
    {
      name: 'Design',
      description: 'Mapeamento facial personalizado, remoção precisa dos pelos com pinça/linha e alinhamento do olhar.',
      price: 35.0,
      durationMinutes: 30,
      category: 'Sobrancelhas'
    },
    {
      name: 'Design com henna',
      description: 'Alinhamento com aplicação de henna para preenchimento de falhas e efeito sombreado marcante e duradouro.',
      price: 50.0,
      durationMinutes: 60,
      category: 'Sobrancelhas'
    },
    {
      name: 'Buço',
      description: 'Epilação rápida e suave da região do buço com fórmula hipoalergênica.',
      price: 10.0,
      durationMinutes: 10,
      category: 'Facial'
    },
    {
      name: 'Epilação no rosto',
      description: 'Remoção completa dos pelos indesejados da face, promovendo pele macia e toque sedoso.',
      price: 20.0,
      durationMinutes: 20,
      category: 'Facial'
    },
    {
      name: 'Brow lamination',
      description: 'Técnica que alinha e fixa os fios naturais para cima, proporcionando volume, efeito ' + 'fluffy' + ' e definição moderna.',
      price: 90.0,
      durationMinutes: 60,
      category: 'Sobrancelhas'
    },
    {
      name: 'Micropigmentação fio a fio',
      description: 'Técnica hiper-realista que desenha fios milimétricos preenchendo falhas com naturalidade e longa durabilidade.',
      price: 250.0,
      durationMinutes: 120,
      category: 'Micropigmentação'
    },
    {
      name: 'Despigmentação química (sessão)',
      description: 'Procedimento químico seguro para clarear e remover micropigmentações ou pigmentos antigos indesejados de forma gradual e controlada.',
      price: 100.0,
      durationMinutes: 90,
      category: 'Despigmentação'
    },
    {
      name: 'Pacote Despigmentação Química (3 sessões)',
      description: 'Tratamento completo em 3 sessões para despigmentação gradual e eficaz. Economia de R$ 45,00 em relação às sessões avulsas.',
      price: 255.0,
      durationMinutes: 90,
      category: 'Pacotes Promocionais'
    }
  ];

  const createdServices = [];
  for (const s of initialServices) {
    const service = await prisma.service.create({ data: s });
    createdServices.push(service);

    // Relacionar com a estilista principal
    await prisma.stylistService.create({
      data: {
        stylistId: stylist.id,
        serviceId: service.id,
        active: true
      }
    });
  }
  console.log(`✨ ${createdServices.length} serviços cadastrados com os valores oficiais da Letícia.`);

  // 5. Configurar Horários de Trabalho (Segunda a Sábado, Domingo folga)
  const schedules = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00', isActive: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '13:30', isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '13:30', isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '13:30', isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '13:30', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '13:30', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true }
  ];

  for (const sch of schedules) {
    await prisma.schedule.create({
      data: {
        stylistId: stylist.id,
        ...sch
      }
    });
  }
  console.log('⏰ Horários de atendimento configurados.');

  // 6. Cadastrar Itens Iniciais no Portfólio (com fotos reais do catálogo)
  const portfolioItems = [
    {
      stylistId: stylist.id,
      imageUrl: '/catalogo/design-simples-hq.png',
      title: 'Design de Sobrancelhas Simples',
      category: 'Design',
      description: 'Mapeamento facial completo com pinça e linha de precisão, valorizando a expressão natural.'
    },
    {
      stylistId: stylist.id,
      imageUrl: '/catalogo/brow-lamination-hq.png',
      title: 'Brow Lamination Fluffy',
      category: 'Lamination',
      description: 'Alinhamento dos fios rebeldes para cima com efeito encorpado, nutrição e acabamento glow.'
    },
    {
      stylistId: stylist.id,
      imageUrl: '/catalogo/micropigmentacao-hq.png',
      title: 'Micropigmentação Fio a Fio',
      category: 'Micropigmentação',
      description: 'Técnica hiper-realista para preenchimento de falhas com naturalidade e longa durabilidade.'
    },
    {
      stylistId: stylist.id,
      imageUrl: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=800&q=80',
      title: 'Design com Henna Natural',
      category: 'Henna',
      description: 'Preenchimento harmônico com henna dermatológica respeitando o subtom de pele.'
    },
    {
      stylistId: stylist.id,
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
      title: 'Despigmentação Química',
      category: 'Despigmentação',
      description: 'Procedimento seguro para clarear e remover pigmentos antigos indesejados de forma gradual.'
    },
    {
      stylistId: stylist.id,
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      title: 'Epilação Facial & Buço',
      category: 'Facial',
      description: 'Pele macia, remoção delicada de pelos com fórmula suave hipoalergênica.'
    }
  ];

  for (const item of portfolioItems) {
    await prisma.portfolioItem.create({ data: item });
  }
  console.log('📸 Portfólio inicial cadastrado.');

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
