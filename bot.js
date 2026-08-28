const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
let questions = require('./questions');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Admin ID raqamingiz
const ADMIN_ID = 7759134597; // <-- O'z Telegram ID ingizni yozing!

// Render porti
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot online!');
}).listen(port);

// Bazasiz ma'lumotlar (RAM)
const userStats = {};
const userState = {};
const userSubjects = {};
const adminState = {};
const newQuestionDraft = {}; // Yangi savol qo'shish jarayoni uchun

// Fanlarning nomlari lug'ati
const subjectNames = {
  'math': '📐 Matematika',
  'english': '🇬🇧 Ingliz tili',
  'russian': '🇷🇺 Rus tili',
  'logic': '🧩 Mantiq',
  'geography': '🌍 Geografiya',
  'history': '📜 Tarix'
};

// ============= MAIN MENU =============
function getMainMenu(chatId) {
  const keyboard = [
    [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
    [{ text: "🇷🇺 Rus tili" }, { text: "🧩 Mantiq" }],
    [{ text: "🌍 Geografiya" }, { text: "📜 Tarix" }],
    [{ text: "👤 Mening profilim" }, { text: "🏆 Peshqadamlar" }],
    [{ text: "ℹ️ Yordam" }]
  ];

  if (chatId === ADMIN_ID) {
    keyboard.push([{ text: "⚙️ Admin Panel" }]);
  }

  return {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true
    }
  };
}

// ============= SUBJECT MENU =============
function getSubjectMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "🔰 Oson" }, { text: "⚡ O'rta" }],
        [{ text: "🔥 Qiyin" }, { text: "🎲 Aralash" }],
        [{ text: "🔙 Asosiy menyu" }]
      ],
      resize_keyboard: true
    }
  };
}

// ============= PESHQADAMLAR MENYUSI =============
function getLeaderboardMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "🏆 Matematika" }, { text: "🏆 Ingliz tili" }],
        [{ text: "🏆 Rus tili" }, { text: "🏆 Mantiq" }],
        [{ text: "🏆 Geografiya" }, { text: "🏆 Tarix" }],
        [{ text: "🔙 Asosiy menyu" }]
      ],
      resize_keyboard: true
    }
  };
}

// ============= ADMIN MENYU =============
function getAdminMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📊 Statistika" }, { text: "📢 Xabar yuborish" }],
        [{ text: "➕ Yangi savol qo'shish" }, { text: "🗑 Savolni o'chirish" }],
        [{ text: "🔙 Asosiy menyu" }]
      ],
      resize_keyboard: true
    }
  };
}

// Admin uchun fan tanlash menyusi
function getAdminSubjectMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
        [{ text: "🇷🇺 Rus tili" }, { text: "🧩 Mantiq" }],
        [{ text: "🌍 Geografiya" }, { text: "📜 Tarix" }],
        [{ text: "🔙 Admin Panel" }]
      ],
      resize_keyboard: true
    }
  };
}

// Admin uchun daraja tanlash menyusi
function getAdminLevelMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "🔰 Oson" }, { text: "⚡ O'rta" }, { text: "🔥 Qiyin" }],
        [{ text: "🔙 Admin Panel" }]
      ],
      resize_keyboard: true
    }
  };
}

// ============= /START =============
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  clearQuestionTimer(chatId);
  delete userState[chatId];
  delete userSubjects[chatId];
  delete adminState[chatId];
  delete newQuestionDraft[chatId];

  if (!userStats[chatId]) {
    userStats[chatId] = {
      name: msg.from.first_name || "Foydalanuvchi",
      username: msg.from.username || null,
      totalScore: 0,
      testsPassed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      subjectScores: { math: 0, english: 0, russian: 0, logic: 0, geography: 0, history: 0 },
      joinedDate: new Date().toLocaleDateString('uz-UZ')
    };
  }

  const welcomeMsg = `<b>🎯 Assalomu alaykum, ${userStats[chatId].name}!</b>

Botimizga xush kelibsiz! 👋

<b>📚 Mavjud fanlar:</b>
• 📐 Matematika | 🇬🇧 Ingliz tili
• 🇷🇺 Rus tili | 🧩 Mantiq
• 🌍 Geografiya | 📜 Tarix

⏱ Har bir savolga javob berish uchun <b>30 soniya</b> vaqt beriladi!

Tanlang va bilimingizni sinab ko'ring! 💪`;

  bot.sendMessage(chatId, welcomeMsg, { 
    parse_mode: 'HTML',
    ...getMainMenu(chatId)
  });
});

// ============= MESSAGES =============
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') return;

  // ===== ADMIN BACK TO ADMIN MENU =====
  if (text === "🔙 Admin Panel" && chatId === ADMIN_ID) {
    delete adminState[chatId];
    delete newQuestionDraft[chatId];
    bot.sendMessage(chatId, "<b>⚙️ Admin Paneli</b>", { parse_mode: 'HTML', ...getAdminMenu() });
    return;
  }

  // ===== ASOSIY MENYU =====
  if (text === "🔙 Asosiy menyu") {
    clearQuestionTimer(chatId);
    delete userState[chatId];
    delete userSubjects[chatId];
    delete adminState[chatId];
    delete newQuestionDraft[chatId];
    bot.sendMessage(chatId, "<b>🏠 Asosiy menyuga qaytdingiz!</b>", { parse_mode: 'HTML', ...getMainMenu(chatId) });
    return;
  }

  // ===== ADMIN REKLAMA REJIMI =====
  if (adminState[chatId] === 'WAITING_FOR_BROADCAST') {
    delete adminState[chatId];
    bot.sendMessage(chatId, "🚀 Xabar barcha foydalanuvchilarga yuborilmoqda...");
    let count = 0;
    Object.keys(userStats).forEach(uId => {
      bot.sendMessage(uId, text, { parse_mode: 'HTML' }).then(() => count++).catch(() => {});
    });
    setTimeout(() => {
      bot.sendMessage(chatId, `✅ Xabar ${count} ta foydalanuvchiga yuborildi!`, getAdminMenu());
    }, 2000);
    return;
  }

  // ===== ADMIN: SAVOL QO'SHISH BOSQICHLARI =====
  if (adminState[chatId] === 'ADD_Q_SELECT_SUBJECT') {
    const subjectMap = {
      "📐 Matematika": 'math', "🇬🇧 Ingliz tili": 'english',
      "🇷🇺 Rus tili": 'russian', "🧩 Mantiq": 'logic',
      "🌍 Geografiya": 'geography', "📜 Tarix": 'history'
    };
    if (subjectMap[text]) {
      newQuestionDraft[chatId] = { subject: subjectMap[text] };
      adminState[chatId] = 'ADD_Q_SELECT_LEVEL';
      bot.sendMessage(chatId, "Darajani tanlang:", getAdminLevelMenu());
    } else {
      bot.sendMessage(chatId, "Iltimos, tugmalardan birini tanlang!");
    }
    return;
  }

  if (adminState[chatId] === 'ADD_Q_SELECT_LEVEL') {
    const levelMap = { "🔰 Oson": 'easy', "⚡ O'rta": 'medium', "🔥 Qiyin": 'hard' };
    if (levelMap[text]) {
      newQuestionDraft[chatId].level = levelMap[text];
      adminState[chatId] = 'ADD_Q_ENTER_TEXT';
      bot.sendMessage(chatId, "<b>Savol matnini kiriting:</b>\n<i>Masalan: O'zbekiston poytaxti qaysi shahar?</i>", { parse_mode: 'HTML' });
    } else {
      bot.sendMessage(chatId, "Iltimos, darajani tugmalardan tanlang!");
    }
    return;
  }

  if (adminState[chatId] === 'ADD_Q_ENTER_TEXT') {
    newQuestionDraft[chatId].question = text;
    adminState[chatId] = 'ADD_Q_ENTER_OPTIONS';
    bot.sendMessage(chatId, "<b>Javob variantlarini kiriting (vergul bilan ajratib yozing):</b>\n<i>Masalan: Toshkent, Samarkand, Buxoro, Xiva</i>", { parse_mode: 'HTML' });
    return;
  }

  if (adminState[chatId] === 'ADD_Q_ENTER_OPTIONS') {
    const opts = text.split(',').map(o => o.trim());
    if (opts.length < 2) {
      bot.sendMessage(chatId, "⚠️ Kamida 2 ta variant kiriting (vergul bilan ajratilgan holda):");
      return;
    }
    newQuestionDraft[chatId].options = opts;
    adminState[chatId] = 'ADD_Q_ENTER_ANSWER';

    let optButtons = opts.map(o => [{ text: o }]);
    bot.sendMessage(chatId, "<b>To'g'ri javob variantini tanlang yoki yozing:</b>", {
      parse_mode: 'HTML',
      reply_markup: { keyboard: optButtons, resize_keyboard: true }
    });
    return;
  }

  if (adminState[chatId] === 'ADD_Q_ENTER_ANSWER') {
    const draft = newQuestionDraft[chatId];
    if (!draft.options.includes(text)) {
      bot.sendMessage(chatId, "⚠️ To'g'ri javob kiritilgan variantlar ichida bo'lishi kerak!");
      return;
    }
    draft.answer = text;

    // Savolni xotiraga qo'shish
    if (!questions[draft.subject]) questions[draft.subject] = [];
    questions[draft.subject].push({
      id: Date.now(),
      level: draft.level,
      question: draft.question,
      options: draft.options,
      answer: draft.answer
    });

    delete adminState[chatId];
    delete newQuestionDraft[chatId];

    bot.sendMessage(chatId, "✅ <b>Yangi savol muvaffaqiyatli qo'shildi!</b>", {
      parse_mode: 'HTML',
      ...getAdminMenu()
    });
    return;
  }

  // ===== ADMIN: SAVOL O'CHIRISH =====
  if (adminState[chatId] === 'DELETE_Q_SELECT_SUBJECT') {
    const subjectMap = {
      "📐 Matematika": 'math', "🇬🇧 Ingliz tili": 'english',
      "🇷🇺 Rus tili": 'russian', "🧩 Mantiq": 'logic',
      "🌍 Geografiya": 'geography', "📜 Tarix": 'history'
    };
    if (subjectMap[text]) {
      const subj = subjectMap[text];
      const subjQs = questions[subj] || [];

      if (subjQs.length === 0) {
        bot.sendMessage(chatId, "❌ Bu fanda hali savollar yo'q!", getAdminMenu());
        delete adminState[chatId];
        return;
      }

      adminState[chatId] = 'DELETE_Q_ENTER_ID';
      let qListText = `<b>🗑 ${subjectNames[subj]} SAVOLLARI RO'YXATI:</b>\n\n`;
      subjQs.forEach((q, idx) => {
        qListText += `<b>${idx + 1}. [ID: ${q.id || idx}]</b> ${q.question}\n`;
      });
      qListText += `\nO'chirmoqchi bo'lgan savolingizning <b>tartib raqamini (1, 2, 3...)</b> yuboring:`;

      newQuestionDraft[chatId] = { subject: subj, questions: subjQs };
      bot.sendMessage(chatId, qListText, { parse_mode: 'HTML' });
    }
    return;
  }

  if (adminState[chatId] === 'DELETE_Q_ENTER_ID') {
    const index = parseInt(text) - 1;
    const draft = newQuestionDraft[chatId];

    if (isNaN(index) || index < 0 || index >= draft.questions.length) {
      bot.sendMessage(chatId, "⚠️ Noto'g'ri raqam kiritdingiz. Qaytadan urinib ko'ring:");
      return;
    }

    const removedQ = questions[draft.subject].splice(index, 1);
    delete adminState[chatId];
    delete newQuestionDraft[chatId];

    bot.sendMessage(chatId, `✅ <b>"${removedQ[0].question}"</b> savoli muvaffaqiyatli o'chirildi!`, {
      parse_mode: 'HTML',
      ...getAdminMenu()
    });
    return;
  }

  // ===== INFO & PROFILE =====
  if (text === "ℹ️ Yordam") {
    bot.sendMessage(chatId, 
      `<b>📖 Yordam</b>

• Fan va darajani tanlang
• Har bir savolga <b>30 soniya</b> ajratiladi
• To'g'ri javoblar evaziga ball to'plang
• Fanlar bo'yicha TOP-10 talikka kiring!

<b>📊 Ballaringiz:</b> ${userStats[chatId]?.totalScore || 0}`,
      { parse_mode: 'HTML', ...getMainMenu(chatId) }
    );
    return;
  }

  if (text === "👤 Mening profilim") {
    showProfile(chatId);
    return;
  }

  if (text === "🏆 Peshqadamlar") {
    bot.sendMessage(chatId, "<b>Qaysi fan bo'yicha Top-10 ni ko'rmoqchisiz?</b>", {
      parse_mode: 'HTML',
      ...getLeaderboardMenu()
    });
    return;
  }

  const leaderboardMap = {
    "🏆 Matematika": 'math', "🏆 Ingliz tili": 'english', "🏆 Rus tili": 'russian',
    "🏆 Mantiq": 'logic', "🏆 Geografiya": 'geography', "🏆 Tarix": 'history'
  };
  if (leaderboardMap[text]) {
    showLeaderboard(chatId, leaderboardMap[text]);
    return;
  }

  // ===== ADMIN PANEL MAIN ACTIONS =====
  if (text === "⚙️ Admin Panel" && chatId === ADMIN_ID) {
    bot.sendMessage(chatId, "<b>⚙️ Admin Paneli</b>", { parse_mode: 'HTML', ...getAdminMenu() });
    return;
  }

  if (text === "📊 Statistika" && chatId === ADMIN_ID) {
    const totalUsers = Object.keys(userStats).length;
    bot.sendMessage(chatId, `<b>📊 BOT STATISTIKASI</b>\n\n👥 Jami foydalanuvchilar: <b>${totalUsers} ta</b>`, { parse_mode: 'HTML' });
    return;
  }

  if (text === "📢 Xabar yuborish" && chatId === ADMIN_ID) {
    adminState[chatId] = 'WAITING_FOR_BROADCAST';
    bot.sendMessage(chatId, "Barcha foydalanuvchilarga yuboriladigan <b>matnni kiriting</b>:", {
      parse_mode: 'HTML',
      reply_markup: { keyboard: [[{ text: "🔙 Admin Panel" }]], resize_keyboard: true }
    });
    return;
  }

  if (text === "➕ Yangi savol qo'shish" && chatId === ADMIN_ID) {
    adminState[chatId] = 'ADD_Q_SELECT_SUBJECT';
    bot.sendMessage(chatId, "<b>Qaysi fanga savol qo'shmoqchisiz?</b>", { parse_mode: 'HTML', ...getAdminSubjectMenu() });
    return;
  }

  if (text === "🗑 Savolni o'chirish" && chatId === ADMIN_ID) {
    adminState[chatId] = 'DELETE_Q_SELECT_SUBJECT';
    bot.sendMessage(chatId, "<b>Qaysi fandan savol o'chirmoqchisiz?</b>", { parse_mode: 'HTML', ...getAdminSubjectMenu() });
    return;
  }

  // ===== FAN TANLASH =====
  const subjectMap = {
    "📐 Matematika": 'math', "🇬🇧 Ingliz tili": 'english', "🇷🇺 Rus tili": 'russian',
    "🧩 Mantiq": 'logic', "🌍 Geografiya": 'geography', "📜 Tarix": 'history'
  };

  if (subjectMap[text]) {
    userSubjects[chatId] = subjectMap[text];
    bot.sendMessage(chatId, `✅ <b>${text}</b> tanlandi!\n\nEndi <b>darajani</b> tanlang:`, {
      parse_mode: 'HTML',
      ...getSubjectMenu()
    });
    return;
  }

  const levelMap = { "🔰 Oson": 'easy', "⚡ O'rta": 'medium', "🔥 Qiyin": 'hard', "🎲 Aralash": 'mixed' };
  if (levelMap[text] && userSubjects[chatId]) {
    startTest(chatId, userSubjects[chatId], levelMap[text]);
    return;
  }

  if (userState[chatId]) {
    checkAnswer(chatId, text);
  } else {
    bot.sendMessage(chatId, "Iltimos, avval fan va darajani tanlang!", getMainMenu(chatId));
  }
});

// ============= PROFIL =============
function showProfile(chatId) {
  const user = userStats[chatId] || { 
    name: "Noma'lum", username: null, totalScore: 0, testsPassed: 0,
    correctAnswers: 0, wrongAnswers: 0, joinedDate: new Date().toLocaleDateString('uz-UZ')
  };
  const usernameText = user.username ? `@${user.username}` : "Mavjud emas";
  const totalQuestions = user.correctAnswers + user.wrongAnswers;
  const accuracy = totalQuestions > 0 ? Math.round((user.correctAnswers / totalQuestions) * 100) : 0;

  let level = "🔰 Boshlang'ich";
  if (accuracy >= 80) level = "🏆 Mutaxassis";
  else if (accuracy >= 60) level = "⭐ O'rtacha";
  else if (accuracy >= 40) level = "📚 O'rganuvchi";

  const text = `<b>👤 FOYDALANUVCHI PROFILI</b>
━━━━━━━━━━━━━━━
📝 <b>Ism:</b> ${user.name}
👤 <b>Username:</b> ${usernameText}
📅 <b>Qo'shilgan:</b> ${user.joinedDate}

📊 <b>STATISTIKA:</b>
✅ Ishlangan testlar: ${user.testsPassed} ta
⭐ Umumiy ball: ${user.totalScore} ball
✓ To'g'ri javoblar: ${user.correctAnswers} ta
✗ Noto'g'ri javoblar: ${user.wrongAnswers} ta
📈 Aniqlik: ${accuracy}%

🏅 <b>Daraja:</b> ${level}`;

  bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getMainMenu(chatId) });
}

// ============= FANLAR BO'YICHA TOP-10 =============
function showLeaderboard(chatId, subjectKey) {
  const users = Object.values(userStats);
  const sorted = users
    .filter(u => u.subjectScores && u.subjectScores[subjectKey] > 0)
    .sort((a, b) => (b.subjectScores[subjectKey] || 0) - (a.subjectScores[subjectKey] || 0))
    .slice(0, 10);

  const subjectName = subjectNames[subjectKey] || 'Fan';

  if (sorted.length === 0) {
    bot.sendMessage(chatId, `🏆 <b>${subjectName}</b> bo'yicha hali hech kim ball to'plamadi!`, { parse_mode: 'HTML' });
    return;
  }

  let text = `🏆 <b>TOP-10 PESHQADAMLAR (${subjectName})</b>\n━━━━━━━━━━━━━━━\n\n`;
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  sorted.forEach((u, index) => {
    text += `${medals[index]} <b>${u.name}</b> — ${u.subjectScores[subjectKey] || 0} ball\n`;
  });

  bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...getLeaderboardMenu() });
}

// ============= TEST LOGIKASI =============
function startTest(chatId, subject, level) {
  let subjectQuestions = questions[subject];
  if (!subjectQuestions || subjectQuestions.length === 0) {
    bot.sendMessage(chatId, "❌ Kechirasiz, bu fan bo'yicha savollar mavjud emas!", getMainMenu(chatId));
    return;
  }

  let filteredQuestions = (level === 'mixed') 
    ? [...subjectQuestions] 
    : subjectQuestions.filter(q => q.level === level);

  if (filteredQuestions.length === 0) {
    bot.sendMessage(chatId, `❌ Bu darajada savollar mavjud emas.`, getSubjectMenu());
    return;
  }

  filteredQuestions = shuffleArray([...filteredQuestions]);
  if (filteredQuestions.length > 10) filteredQuestions = filteredQuestions.slice(0, 10);

  userState[chatId] = {
    subject: subject, level: level, questions: filteredQuestions,
    index: 0, score: 0, total: filteredQuestions.length, correct: 0, wrong: 0, timer: null
  };

  sendQuestion(chatId);
}

function clearQuestionTimer(chatId) {
  if (userState[chatId] && userState[chatId].timer) {
    clearTimeout(userState[chatId].timer);
    userState[chatId].timer = null;
  }
}

function sendQuestion(chatId) {
  clearQuestionTimer(chatId);
  const state = userState[chatId];
  
  if (!state || state.index >= state.total) {
    finishTest(chatId);
    return;
  }

  const q = state.questions[state.index];
  const levelEmoji = { 'easy': '🔰', 'medium': '⚡', 'hard': '🔥' };

  const message = `📊 ${state.index + 1}/${state.total} ${levelEmoji[state.level] || '🎯'} ${subjectNames[state.subject] || ''}

❓ <b>${q.question}</b>

⏱ <i>Javob berish uchun 30 soniya vaqtingiz bor!</i>`;

  const opts = {
    reply_markup: {
      keyboard: q.options.map(opt => [{ text: opt }]),
      resize_keyboard: true
    },
    parse_mode: 'HTML'
  };

  bot.sendMessage(chatId, message, opts);

  state.timer = setTimeout(() => {
    bot.sendMessage(chatId, `⏰ <b>Vaqt tugadi!</b> Javob noto'g'ri deb hisoblandi.`, { parse_mode: 'HTML' });
    state.wrong++;
    state.index++;
    setTimeout(() => sendQuestion(chatId), 1000);
  }, 30000);
}

function checkAnswer(chatId, text) {
  const state = userState[chatId];
  if (!state) return;
  const q = state.questions[state.index];
  if (!q.options.includes(text)) return;

  clearQuestionTimer(chatId);

  if (text === q.answer) {
    state.score++; state.correct++;
    bot.sendMessage(chatId, "✅ <b>To'g'ri!</b> 🎉", { parse_mode: 'HTML' });
  } else {
    state.wrong++;
    bot.sendMessage(chatId, `❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>${q.answer}</b>`, { parse_mode: 'HTML' });
  }

  state.index++;
  setTimeout(() => sendQuestion(chatId), 800);
}

function finishTest(chatId) {
  clearQuestionTimer(chatId);
  const state = userState[chatId];
  if (!state) return;

  const score = state.score;
  const total = state.total;
  const percentage = Math.round((score / total) * 100);

  if (userStats[chatId]) {
    userStats[chatId].totalScore += score;
    userStats[chatId].testsPassed += 1;
    userStats[chatId].correctAnswers += state.correct;
    userStats[chatId].wrongAnswers += state.wrong;
    if (!userStats[chatId].subjectScores) {
      userStats[chatId].subjectScores = { math: 0, english: 0, russian: 0, logic: 0, geography: 0, history: 0 };
    }
    userStats[chatId].subjectScores[state.subject] = (userStats[chatId].subjectScores[state.subject] || 0) + score;
  }

  const resultMsg = `🎯 <b>Test yakunlandi!</b>

Natija: <b>${score}/${total} (${percentage}%)</b>
✅ To'g'ri: ${state.correct} ta
❌ Noto'g'ri: ${state.wrong} ta

Umumiy ballingiz: ${userStats[chatId]?.totalScore || 0}`;

  delete userState[chatId];
  delete userSubjects[chatId];

  bot.sendMessage(chatId, resultMsg, { parse_mode: 'HTML', ...getMainMenu(chatId) });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

bot.on('polling_error', (err) => console.error('Polling error:', err.message));
console.log('🚀 Bot ishga tushdi!');