# 🌸 Studio Letícia Oliveira — Beleza & Sobrancelhas

Sistema web full-stack completo de agendamento online e gestão para o estúdio de estética, visagismo e design de sobrancelhas/facial de **Letícia Oliveira**.

---

## 📍 Informações do Studio
- **Profissional:** Letícia Oliveira (25 anos, atuando desde 2023 no design de sobrancelhas e visagismo)
- **Instagram:** [@leticia_r.oliveira](https://instagram.com/leticia_r.oliveira)
- **WhatsApp:** (51) 99503-7223 (`5551995037223`)
- **Endereço Completo:** Condomínio Altos da Theodomiro 2, 2435
  - ➡️ 2ª portaria (último prédio da rua, são dois condomínios no local)
  - 🏢 Bloco 6, Apê 652 – 5º andar

---

## ⏰ Política Oficial de Agendamento & Cancelamento
- Cancelamentos ou remarcações devem ser realizados com **24h de antecedência**.
- Após esse prazo ou em caso de **não comparecimento**, é cobrado **50% do valor do procedimento**, referente ao horário reservado exclusivamente para a cliente.
- Essa política existe para organizar a agenda e respeitar o horário de todas as clientes.

---

## 📋 Tabela Oficial de Procedimentos
1. **Design de Sobrancelhas:** R$ 35,00 (30 min)
2. **Design com Henna:** R$ 50,00 (60 min)
3. **Buço:** R$ 10,00 (10 min)
4. **Epilação no Rosto:** R$ 20,00 (20 min)
5. **Brow Lamination:** R$ 90,00 (60 min)
6. **Despigmentação Química (Sessão):** R$ 100,00 (90 min / 1h30)
7. **Pacote Despigmentação Química (3 Sessões):** R$ 255,00 (90 min por sessão — economia de R$ 45)

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
- Node.js 18+ instalado.

### 1. Iniciar o Backend
```bash
cd backend
npm install
# Para atualizar o banco SQLite com os dados da Letícia:
node prisma/seed.js
# Iniciar a API:
npm run dev
```
> O backend rodará em `http://localhost:5000`

### 2. Iniciar o Frontend
```bash
cd frontend
npm install
npm run dev
```
> O frontend rodará em `http://localhost:5173`

---

## 🔑 Credenciais Padrão do Painel da Dona
- **E-mail:** `admin@studio.com`
- **Senha:** `admin123`

---

## 🛠️ Tecnologias Utilizadas
- **Backend:** Node.js, Express, Prisma ORM, SQLite, JWT, Bcrypt.
- **Frontend:** React, Vite, Tailwind CSS v4, Lucide React, Google Fonts (*Playfair Display* & *Inter*).
- **Notificações:** Módulo modular de WhatsApp (`whatsappService.js`) conectado ao número `5551995037223`.
