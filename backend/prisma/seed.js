import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando verificação de segurança do seed...');

  // 🛡️ TRAVA DE SEGURANÇA MÁXIMA: NUNCA APAGAR DADOS SE JÁ HOUVER REGISTROS NO BANCO!
  // Preserva 100% de serviços, preços ajustados pela dona, campanhas de bônus, agendamentos e cadastros.
  const countServices = await prisma.service.count();
  const countStylists = await prisma.stylist.count();
  const countBonus = await prisma.bonusCampaign.count();
  const countAppointments = await prisma.appointment.count();

  if (countServices > 0 || countStylists > 0 || countBonus > 0 || countAppointments > 0) {
    console.log('🛡️ [SEGURANÇA ATIVA] O banco de dados já possui serviços, agendamentos ou campanhas reais cadastradas.');
    console.log('🛡️ NENHUM dado foi alterado ou apagado. Todos os valores, registros e bônus permanecem 100% preservados!');
    return;
  }

  console.log('🌱 Banco vazio detectado. Populando dados iniciais da Letícia Oliveira...');

  // 1. Limpar dados existentes em ordem de dependência
  await prisma.portfolioItem.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.dateSchedule.deleteMany({});
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
  const leticiaBio = `Prazer, sou a Letícia!

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
      active: true,
      address: 'Condomínio Altos da Theodomiro 2, 2435',
      addressDetails: '2ª portaria (último prédio da rua), Bloco 6, Apê 652 – 5º andar',
      instagram: '@leticia_r.oliveira',
      pixKey: '5551995037223',
      pixType: 'Telefone',
      cancellationNoticeHours: 24,
      cancellationFeePercent: 50,
      customPolicyText: 'Cancelamentos ou remarcações devem ser realizados com 24h de antecedência. Após esse prazo ou em caso de não comparecimento, é cobrado 50% do valor do procedimento, referente ao horário reservado exclusivamente para você.',
      bufferMinutes: 10
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

  // 6. Cadastrar Itens Iniciais no Portfólio (com fotos reais de alta qualidade da Letícia)
  const portfolioItems = [
    {
      stylistId: stylist.id,
      title: 'Design de Sobrancelhas (Antes & Depois)',
      category: 'Design',
      imageUrl: '/catalogo/design-sobrancelhas-real.jpg',
      description: 'Mapeamento facial simétrico e remoção precisa dos pelos, valorizando a expressão natural e o desenho harmônico.'
    },
    {
      stylistId: stylist.id,
      title: 'Brow Lamination Fluffy & Cílios',
      category: 'Lamination',
      imageUrl: '/catalogo/brow-lamination-real.jpg',
      description: 'Alinhamento completo dos fios com efeito encorpado moderno, nutrição e acabamento glow iluminado.'
    },
    {
      stylistId: stylist.id,
      title: 'Micropigmentação Fio a Fio Hiper-realista',
      category: 'Micropigmentação',
      imageUrl: '/catalogo/micropigmentacao-fio-a-fio-real.jpg',
      description: 'Técnica de fios milimétricos hiper-realistas para preenchimento de falhas com máxima naturalidade e longa duração.'
    },
    {
      stylistId: stylist.id,
      title: 'Transformação Brow Lamination',
      category: 'Lamination',
      imageUrl: '/catalogo/brow-lamination-transformacao-real.jpg',
      description: 'Transformação completa de antes e depois: olhar aberto, fios direcionados e simetria perfeita.'
    },
    {
      stylistId: stylist.id,
      title: 'Design com Henna & Definição',
      category: 'Henna',
      imageUrl: '/catalogo/design-henna-real.jpg',
      description: 'Preenchimento harmônico com henna de alta fixação para correção de falhas e sombreamento natural.'
    },
    {
      stylistId: stylist.id,
      title: 'Design Masculino com Harmonia Natural',
      category: 'Design Masculino',
      imageUrl: '/catalogo/design-masculino-real.jpg',
      description: 'Alinhamento anatômico para homens, limpando o excesso sem afinar e preservando a naturalidade da expressão.'
    },
    {
      stylistId: stylist.id,
      title: 'Efeito Fluffy Natural',
      category: 'Lamination',
      imageUrl: '/catalogo/brow-fluffy-real.jpg',
      description: 'Fios alinhados e penteados para cima com caimento orgânico e elegante, ideal para o dia a dia.'
    },
    {
      stylistId: stylist.id,
      title: 'Alinhamento & Visagismo Facial',
      category: 'Design',
      imageUrl: '/catalogo/alinhamento-expressao-real.jpg',
      description: 'Visagismo facial exclusivo Studio Letícia Oliveira para destacar o melhor do seu olhar com delicadeza.'
    }
  ];

  for (const item of portfolioItems) {
    await prisma.portfolioItem.create({ data: item });
  }
  console.log('📸 Portfólio oficial atualizado com fotos reais.');

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
