import prisma from '../src/config/prisma.js';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'studio_beleza_super_secret_jwt_key_2026';

async function runTests() {
  console.log('🚀 Iniciando testes integrados das novas funcionalidades...\n');

  // Buscar usuário admin do banco
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@studio.com',
        passwordHash: 'hashed_pw',
        role: 'ADMIN'
      }
    });
  }

  // Criar token de admin válido para os testes
  const adminToken = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  let server;
  const PORT = 5099;

  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[TestServer] Executando na porta ${PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // -------------------------------------------------------------
    // TESTE 1: Alteração de Redes Sociais & Conteúdo do Site
    // -------------------------------------------------------------
    console.log('--- TESTE 1: Redes Sociais & Informações da Página ---');
    const stylistBefore = await prisma.stylist.findFirst();
    const stylistId = stylistBefore ? stylistBefore.id : 1;

    const updateRes = await fetch(`${baseUrl}/stylists/${stylistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        phone: '5551995037223',
        instagram: '@leticia_r.oliveira',
        facebook: 'leticia.oliveira.studio',
        twitter: '@leticia_studio',
        tiktok: '@leticia_sobrancelhas',
        otherSocials: JSON.stringify([{ label: 'Threads', url: 'https://threads.net/@leticia' }]),
        headline: 'Transformando olhares com amor & visagismo',
        greetingBadge: 'Prazer, sou a Letícia! ✨ • Studio Exclusivo',
        heroQuote: 'A verdadeira beleza está no respeito aos traços únicos de cada mulher.',
        aboutTitle: 'Nosso Refúgio de Bem-Estar e Beleza',
        aboutDescription: 'Espaço cuidadosamente planejado para oferecer conforto e biossegurança.',
        experienceYears: 'Desde 2023 · Designer Certificada'
      })
    });

    const updatedData = await updateRes.json();
    if (!updateRes.ok) throw new Error(updatedData.error || 'Falha ao atualizar estilista');

    console.log('✔ Redes Sociais salvas com sucesso:', {
      instagram: updatedData.instagram,
      facebook: updatedData.facebook,
      tiktok: updatedData.tiktok
    });
    console.log('✔ Conteúdo da Página salvo com sucesso:', {
      headline: updatedData.headline,
      greetingBadge: updatedData.greetingBadge
    });

    // -------------------------------------------------------------
    // TESTE 2: Upload de Imagem (Celular / Google Fotos em Base64)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: Upload de Foto via Base64 ---');
    // Mini JPEG 1x1 pixel em base64
    const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    const uploadRes = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        image: sampleBase64,
        filename: 'foto-cliente-design'
      })
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || 'Falha no upload');
    console.log('✔ Foto enviada e salva com sucesso:', uploadData.url);

    // -------------------------------------------------------------
    // TESTE 3: Bloqueio de Mês, Semana e Dias
    // -------------------------------------------------------------
    console.log('\n--- TESTE 3: Bloqueio de Meses na Agenda ---');
    // Bloquear Novembro de 2026 (Mês 11)
    const blockRes = await fetch(`${baseUrl}/schedules/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        stylistId,
        type: 'MONTH',
        year: 2026,
        month: 11,
        isOpen: false,
        reason: 'Mês de Novembro Lotado / Sem atendimento'
      })
    });

    const blockData = await blockRes.json();
    if (!blockRes.ok) throw new Error(blockData.error || 'Falha no bloqueio');
    console.log('✔ Resultado do Bloqueio:', blockData.message);

    // Verificar se a consulta do mês reflete o bloqueio total
    const checkMonthRes = await fetch(`${baseUrl}/schedules/month?stylistId=${stylistId}&year=2026&month=11`);
    const checkMonthData = await checkMonthRes.json();
    console.log('✔ Status do Mês de Novembro/2026:', {
      isEntireMonthBlocked: checkMonthData.isEntireMonthBlocked,
      blockedDaysCount: checkMonthData.blockedDaysCount,
      reason: checkMonthData.monthBlockReason
    });

    if (!checkMonthData.isEntireMonthBlocked) {
      throw new Error('O mês de novembro deveria constar como 100% bloqueado!');
    }

    // Desbloquear para restaurar
    const unblockRes = await fetch(`${baseUrl}/schedules/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        stylistId,
        type: 'MONTH',
        year: 2026,
        month: 11,
        isOpen: true,
        reason: 'Atendimento liberado'
      })
    });
    const unblockData = await unblockRes.json();
    console.log('✔ Mês liberado novamente:', unblockData.message);

    // -------------------------------------------------------------
    // TESTE 4: Campanhas de Bônus e Trava dos 15 Dias
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: Sistema de Bônus & Trava de 15 Dias ---');
    // 4.1 Criar Campanha
    const createCampRes = await fetch(`${baseUrl}/bonus/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Bônus Especial de Design com Henna',
        description: 'Ganhe 20% OFF no seu procedimento de visagismo com henna castanho.',
        discountType: 'PERCENT',
        discountValue: 20,
        active: true,
        badgeText: 'Exclusivo do Mês'
      })
    });

    const campData = await createCampRes.json();
    if (!createCampRes.ok) throw new Error(campData.error || 'Falha ao criar campanha');
    console.log('✔ Campanha criada com sucesso! ID:', campData.id, '| Título:', campData.title);

    // 4.2 Cliente aplica para o bônus pela 1ª vez
    const testPhone = `519988${Date.now().toString().slice(-5)}`;
    const applyRes1 = await fetch(`${baseUrl}/bonus/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campData.id,
        clientName: 'Mariana Silva',
        clientPhone: testPhone,
        serviceName: 'Design com Henna'
      })
    });

    const applyData1 = await applyRes1.json();
    if (!applyRes1.ok) throw new Error(applyData1.error || 'Falha ao aplicar para bônus');
    console.log('✔ 1ª Solicitação da cliente aceita! Código:', applyData1.code, '| Status: Pendente');

    // 4.3 Cliente tenta aplicar NOVAMENTE em menos de 15 dias (DEVE SER BLOQUEADO)
    const applyRes2 = await fetch(`${baseUrl}/bonus/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campData.id,
        clientName: 'Mariana Silva',
        clientPhone: testPhone,
        serviceName: 'Design com Henna'
      })
    });

    const applyData2 = await applyRes2.json();
    if (applyRes2.status === 400 && applyData2.error.includes('15 dias')) {
      console.log('✔ Trava de 15 dias funcionou com perfeição! Mensagem de bloqueio:', applyData2.error);
    } else {
      throw new Error(`A trava de 15 dias falhou! Status: ${applyRes2.status}, resposta: ${JSON.stringify(applyData2)}`);
    }

    // 4.4 Cliente consulta o status do seu bônus
    const statusRes = await fetch(`${baseUrl}/bonus/status?phone=${testPhone}`);
    const statusData = await statusRes.json();
    console.log('✔ Consulta de status da cliente:', {
      total: statusData.length,
      codigo: statusData[0]?.code,
      status: statusData[0]?.status
    });

    // 4.5 Administradora aprova o bônus
    const appId = applyData1.application.id;
    const approveRes = await fetch(`${baseUrl}/bonus/admin/applications/${appId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'APROVADO',
        adminNote: 'Liberado com carinho! Nos vemos no Studio.'
      })
    });

    const approveData = await approveRes.json();
    if (!approveRes.ok) throw new Error(approveData.error || 'Falha ao aprovar bônus');
    console.log('✔ Bônus aprovado pela Administradora! Status:', approveData.application.status);
    console.log('✔ Link automático de notificação para WhatsApp:', approveData.whatsappNotifyUrl ? 'Gerado com sucesso' : 'Não gerado');

    console.log('\n======================================================');
    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! 🎉');
    console.log('======================================================');
  } catch (error) {
    console.error('\n❌ ERRO DURANTE OS TESTES:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
