const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const questions = require('./questions');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Admin ID raqamingizni shu yerga kiriting
const ADMIN_ID = 7834222012; // <-- O'z Telegram ID ingizni qo'ying

// Render porti
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot online!');
}).listen(port);

// Bazasiz ma'lumotlarni saqlash (RAM)
const userStats = {};
const userState = {};
const userSubjects = {};
const adminState = {};

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
      resize_keyboard: true,
      one_time_keyboard: false
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
      resize_keyboard: true,
      one_time_keyboard: false
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
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
}

// ============= ADMIN MENYU =============
function getAdminMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📊 Statistika" }, { text: "📢 Xabar yuborish" }],
        [{ text: "🔙 Asosiy menyu" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
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

  // ===== ADMIN REKLAMA REJIMI =====
  if (adminState[chatId] === 'WAITING_FOR_BROADCAST') {
    if (text === "🔙 Asosiy menyu") {
      delete adminState[chatId];
      bot.sendMessage(chatId, "Bekor qilindi.", getMainMenu(chatId));
      return;
    }

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

  // ===== ASOSIY MENYU =====
  if (text === "🔙 Asosiy menyu") {
    clearQuestionTimer(chatId);
    delete userState[chatId];
    delete userSubjects[chatId];
    delete adminState[chatId];
    bot.sendMessage(chatId, "<b>🏠 Asosiy menyuga qaytdingiz!</b>", { 
      parse_mode: 'HTML',
      ...getMainMenu(chatId) 
    });
    return;
  }

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

  // ===== PROFIL =====
  if (text === "👤 Mening profilim") {
    showProfile(chatId);
    return;
  }

  // ===== PESHQADAMLAR MENYUSI =====
  if (text === "🏆 Peshqadamlar") {
    bot.sendMessage(chatId, "<b>Qaysi fan bo'yicha Top-10 ni ko'rmoqchisiz?</b>", {
      parse_mode: 'HTML',
      ...getLeaderboardMenu()
    });
    return;
  }

  // Top-10 Fanlar bo'yicha
  const leaderboardMap = {
    "🏆 Matematika": 'math',
    "🏆 Ingliz tili": 'english',
    "🏆 Rus tili": 'russian',
    "🏆 Mantiq": 'logic',
    "🏆 Geografiya": 'geography',
    "🏆 Tarix": 'history'
  };

  if (leaderboardMap[text]) {
    showLeaderboard(chatId, leaderboardMap[text]);
    return;
  }

  // ===== ADMIN PANEL =====
  if (text === "⚙️ Admin Panel" && chatId === ADMIN_ID) {
    bot.sendMessage(chatId, "<b>⚙️ Admin Paneli</b>", {
      parse_mode: 'HTML',
      ...getAdminMenu()
    });
    return;
  }

  if (text === "📊 Statistika" && chatId === ADMIN_ID) {
    const totalUsers = Object.keys(userStats).length;
    bot.sendMessage(chatId, `<b>📊 BOT STATISTIKASI</b>\n\n👥 Jami foydalanuvchilar: <b>${totalUsers} ta</b>`, { parse_mode: 'HTML' });
    return;
  }

  if (text === "📢 Xabar yuborish" && chatId === ADMIN_ID) {
    adminState[chatId] = 'WAITING_FOR_BROADCAST';
    bot.sendMessage(chatId, "Barcha foydalanuvchilarga yuboriladigan <b>matnni kiriting</b> (HTML formatida ham yozishingiz mumkin):", {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: "🔙 Asosiy menyu" }]],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== FAN TANLASH =====
  const subjectMap = {
    "📐 Matematika": 'math',
    "🇬🇧 Ingliz tili": 'english',
    "🇷🇺 Rus tili": 'russian',
    "🧩 Mantiq": 'logic',
    "🌍 Geografiya": 'geography',
    "📜 Tarix": 'history'
  };

  if (subjectMap[text]) {
    userSubjects[chatId] = subjectMap[text];
    bot.sendMessage(chatId, `✅ <b>${text}</b> tanlandi!\n\nEndi <b>darajani</b> tanlang:`, {
      parse_mode: 'HTML',
      ...getSubjectMenu()
    });
    return;
  }

  // ===== DARAJA TANLASH =====
  const levelMap = {
    "🔰 Oson": 'easy',
    "⚡ O'rta": 'medium',
    "🔥 Qiyin": 'hard',
    "🎲 Aralash": 'mixed'
  };

  if (levelMap[text] && userSubjects[chatId]) {
    startTest(chatId, userSubjects[chatId], levelMap[text]);
    return;
  }

  // ===== JAVOB TEKSHIRISH =====
  if (userState[chatId]) {
    checkAnswer(chatId, text);
  } else {
    bot.sendMessage(chatId, "Iltimos, avval fan va darajani tanlang!", getMainMenu(chatId));
  }
});

// ============= PROFIL =============
function showProfile(chatId) {
  const user = userStats[chatId] || { 
    name: "Noma'lum", 
    username: null,
    totalScore: 0, 
    testsPassed: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    joinedDate: new Date().toLocaleDateString('uz-UZ')
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

🏅 <b>Daraja:</b> ${level}

━━━━━━━━━━━━━━━
Davom eting va yutuqlarga erishing! 💪`;

  bot.sendMessage(chatId, text, { 
    parse_mode: 'HTML',
    ...getMainMenu(chatId)
  });
}

// ============= FANLAR BO'YICHA TOP-10 PESHQADAMLAR =============
function showLeaderboard(chatId, subjectKey) {
  const users = Object.values(userStats);

  // Tanlangan fan bo'yicha ballarga qarab saralash
  const sorted = users
    .filter(u => u.subjectScores && u.subjectScores[subjectKey] > 0)
    .sort((a, b) => (b.subjectScores[subjectKey] || 0) - (a.subjectScores[subjectKey] || 0))
    .slice(0, 10);

  const subjectName = subjectNames[subjectKey] || 'Fan';

  if (sorted.length === 0) {
    bot.sendMessage(chatId, `🏆 <b>${subjectName}</b> bo'yicha hali hech kim ball to'plamadi. Birinchi bo'ling!`, { parse_mode: 'HTML' });
    return;
  }

  let text = `🏆 <b>TOP-10 PESHQADAMLAR (${subjectName})</b>\n━━━━━━━━━━━━━━━\n\n`;

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  sorted.forEach((u, index) => {
    const medal = medals[index];
    const score = u.subjectScores[subjectKey] || 0;
    text += `${medal} <b>${u.name}</b> — ${score} ball\n`;
  });

  bot.sendMessage(chatId, text, { 
    parse_mode: 'HTML',
    ...getLeaderboardMenu()
  });
}

// ============= TEST BOSHLASH =============
function startTest(chatId, subject, level) {
  let subjectQuestions = questions[subject];
  
  if (!subjectQuestions || subjectQuestions.length === 0) {
    bot.sendMessage(chatId, "❌ Kechirasiz, bu fan bo'yicha savollar mavjud emas!", getMainMenu(chatId));
    return;
  }

  let filteredQuestions;
  
  if (level === 'mixed') {
    filteredQuestions = [...subjectQuestions];
  } else {
    filteredQuestions = subjectQuestions.filter(q => q.level === level);
    if (filteredQuestions.length === 0) {
      bot.sendMessage(chatId, `❌ Bu darajada savollar mavjud emas. Iltimos, boshqa darajani tanlang!`, getSubjectMenu());
      return;
    }
  }

  filteredQuestions = shuffleArray([...filteredQuestions]);

  if (filteredQuestions.length > 10) {
    filteredQuestions = filteredQuestions.slice(0, 10);
  }

  userState[chatId] = {
    subject: subject,
    level: level,
    questions: filteredQuestions,
    index: 0,
    score: 0,
    total: filteredQuestions.length,
    correct: 0,
    wrong: 0,
    timer: null
  };

  sendQuestion(chatId);
}

// ============= TAYMERNI TOZALASH =============
function clearQuestionTimer(chatId) {
  if (userState[chatId] && userState[chatId].timer) {
    clearTimeout(userState[chatId].timer);
    userState[chatId].timer = null;
  }
}

// ============= SAVOL YUBORISH =============
function sendQuestion(chatId) {
  clearQuestionTimer(chatId);

  const state = userState[chatId];
  
  if (!state || state.index >= state.total) {
    finishTest(chatId);
    return;
  }

  const q = state.questions[state.index];
  const progress = `📊 ${state.index + 1}/${state.total}`;
  
  const levelEmoji = { 'easy': '🔰', 'medium': '⚡', 'hard': '🔥' };

  const message = `${progress} ${levelEmoji[state.level] || '🎯'} ${subjectNames[state.subject] || ''}

❓ <b>${q.question}</b>

⏱ <i>Javob berish uchun 30 soniya vaqtingiz bor!</i>

Variantlardan birini tanlang:`;

  const opts = {
    reply_markup: {
      keyboard: q.options.map(opt => [{ text: opt }]),
      resize_keyboard: true,
      one_time_keyboard: false
    },
    parse_mode: 'HTML'
  };

  bot.sendMessage(chatId, message, opts);

  // 30 soniyalik taymer o'rnatamiz
  state.timer = setTimeout(() => {
    bot.sendMessage(chatId, `⏰ <b>Vaqt tugadi!</b> Javob noto'g'ri deb hisoblandi.`, { parse_mode: 'HTML' });
    state.wrong++;
    state.index++;
    setTimeout(() => sendQuestion(chatId), 1000);
  }, 30000);
}

// ============= JAVOB TEKSHIRISH =============
function checkAnswer(chatId, text) {
  const state = userState[chatId];
  
  if (!state) return;

  const q = state.questions[state.index];
  
  if (!q.options.includes(text)) return;

  clearQuestionTimer(chatId);

  const isCorrect = text === q.answer;
  
  if (isCorrect) {
    state.score++;
    state.correct++;
    bot.sendMessage(chatId, "✅ <b>To'g'ri!</b> 🎉", { parse_mode: 'HTML' });
  } else {
    state.wrong++;
    bot.sendMessage(chatId, `❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>${q.answer}</b>`, { parse_mode: 'HTML' });
  }

  state.index++;
  
  setTimeout(() => {
    sendQuestion(chatId);
  }, 800);
}

// ============= TEST TUGASHI =============
function finishTest(chatId) {
  clearQuestionTimer(chatId);

  const state = userState[chatId];
  if (!state) return;

  const total = state.total;
  const score = state.score;
  const percentage = Math.round((score / total) * 100);

  if (userStats[chatId]) {
    userStats[chatId].totalScore += score;
    userStats[chatId].testsPassed += 1;
    userStats[chatId].correctAnswers += state.correct;
    userStats[chatId].wrongAnswers += state.wrong;

    // Fan bo'yicha alohida ball yig'ish
    if (!userStats[chatId].subjectScores) {
      userStats[chatId].subjectScores = { math: 0, english: 0, russian: 0, logic: 0, geography: 0, history: 0 };
    }
    userStats[chatId].subjectScores[state.subject] = (userStats[chatId].subjectScores[state.subject] || 0) + score;
  }

  let emoji = '😊';
  let message = '';
  
  if (percentage >= 80) {
    emoji = '🏆';
    message = "Ajoyib! Siz bu fanni mukammal bilasiz!";
  } else if (percentage >= 60) {
    emoji = '⭐';
    message = "Yaxshi! O'z ustingizda ishlang!";
  } else if (percentage >= 40) {
    emoji = '📚';
    message = "Ko'proq mashq qiling!";
  } else {
    emoji = '💪';
    message = "Harakat qiling! O'z ustingizda ishlang!";
  }

  const resultMsg = `🎯 <b>Test yakunlandi!</b>

${emoji} <b>Natija:</b> ${score}/${total}
📊 <b>Foiz:</b> ${percentage}%
💬 <b>Xulosa:</b> ${message}

✅ To'g'ri: ${state.correct} ta
❌ Noto'g'ri: ${state.wrong} ta

Umumiy ballingiz: ${userStats[chatId]?.totalScore || 0}`;

  delete userState[chatId];
  delete userSubjects[chatId];

  bot.sendMessage(chatId, resultMsg, { 
    parse_mode: 'HTML',
    ...getMainMenu(chatId)
  });
}

// ============= YORDAMCHI FUNKSIYALAR =============
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============= XATOLIKLARNI USHLASH =============
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('🚀 Bot ishga tushdi!');