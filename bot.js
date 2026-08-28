const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const questions = require('./questions');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

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

// ============= MAIN MENU =============
function getMainMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
        [{ text: "🇷🇺 Rus tili" }, { text: "🧩 Mantiq" }],
        [{ text: "🌍 Geografiya" }, { text: "📜 Tarix" }],
        [{ text: "👤 Mening profilim" }, { text: "ℹ️ Yordam" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
}

// ============= SUBJECT MENU =============
function getSubjectMenu(subject) {
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

// ============= /START =============
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  delete userState[chatId];
  delete userSubjects[chatId];

  if (!userStats[chatId]) {
    userStats[chatId] = {
      name: msg.from.first_name || "Foydalanuvchi",
      username: msg.from.username || null,
      totalScore: 0,
      testsPassed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      joinedDate: new Date().toLocaleDateString('uz-UZ')
    };
  }

  const welcomeMsg = `<b>🎯 Assalomu alaykum, ${userStats[chatId].name}!</b>

Botimizga xush kelibsiz! 👋

<b>📚 Mavjud fanlar:</b>
• 📐 Matematika
• 🇬🇧 Ingliz tili
• 🇷🇺 Rus tili
• 🧩 Mantiq
• 🌍 Geografiya
• 📜 Tarix

Har bir fanda <b>3 xil daraja</b> mavjud:
🔰 Oson | ⚡ O'rta | 🔥 Qiyin

Tanlang va bilimingizni sinab ko'ring! 💪`;

  bot.sendMessage(chatId, welcomeMsg, { 
    parse_mode: 'HTML',
    ...getMainMenu()
  });
});

// ============= MESSAGES =============
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') return;

  // ===== ASOSIY MENYU =====
  if (text === "🔙 Asosiy menyu") {
    delete userState[chatId];
    delete userSubjects[chatId];
    bot.sendMessage(chatId, "<b>🏠 Asosiy menyuga qaytdingiz!</b>", { 
      parse_mode: 'HTML',
      ...getMainMenu() 
    });
    return;
  }

  if (text === "ℹ️ Yordam") {
    bot.sendMessage(chatId, 
      `<b>📖 Yordam</b>

• Fan tanlang va testni boshlang
• Darajani tanlang (Oson/O'rta/Qiyin/Aralash)
• Har bir savolda variantlardan birini tanlang
• To'g'ri javob uchun ball olasiz
• Profilingizda natijalaringizni ko'rishingiz mumkin

<b>📊 Statistika:</b>
• Umumiy ball: ${userStats[chatId]?.totalScore || 0}
• Testlar soni: ${userStats[chatId]?.testsPassed || 0}

<b>🎯 Omad tilaymiz!</b>`,
      { parse_mode: 'HTML', ...getMainMenu() }
    );
    return;
  }

  // ===== PROFIL =====
  if (text === "👤 Mening profilim") {
    showProfile(chatId);
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
    const subjectName = text;
    bot.sendMessage(chatId, `✅ <b>${subjectName}</b> tanlandi!\n\nEndi <b>darajani</b> tanlang:`, {
      parse_mode: 'HTML',
      ...getSubjectMenu(subjectMap[text])
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
    bot.sendMessage(chatId, "Iltimos, avval fan va darajani tanlang!", getMainMenu());
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
    ...getMainMenu()
  });
}

// ============= TEST BOSHLASH =============
function startTest(chatId, subject, level) {
  let subjectQuestions = questions[subject];
  
  if (!subjectQuestions || subjectQuestions.length === 0) {
    bot.sendMessage(chatId, "❌ Kechirasiz, bu fan bo'yicha savollar mavjud emas!", getMainMenu());
    return;
  }

  let filteredQuestions;
  
  if (level === 'mixed') {
    filteredQuestions = [...subjectQuestions];
  } else {
    filteredQuestions = subjectQuestions.filter(q => q.level === level);
    if (filteredQuestions.length === 0) {
      bot.sendMessage(chatId, `❌ Bu darajada savollar mavjud emas. Iltimos, boshqa darajani tanlang!`, getSubjectMenu(subject));
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
    wrong: 0
  };

  sendQuestion(chatId);
}

// ============= SAVOL YUBORISH =============
function sendQuestion(chatId) {
  const state = userState[chatId];
  
  if (!state || state.index >= state.total) {
    finishTest(chatId);
    return;
  }

  const q = state.questions[state.index];
  const progress = `📊 ${state.index + 1}/${state.total}`;
  
  const levelEmoji = {
    'easy': '🔰',
    'medium': '⚡',
    'hard': '🔥'
  };

  const subjectEmoji = {
    'math': '📐',
    'english': '🇬🇧',
    'russian': '🇷🇺',
    'logic': '🧩',
    'geography': '🌍',
    'history': '📜'
  };

  const message = `${progress} ${levelEmoji[state.level] || '🎯'} ${subjectEmoji[state.subject] || ''}

❓ <b>${q.question}</b>

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
}

// ============= JAVOB TEKSHIRISH =============
function checkAnswer(chatId, text) {
  const state = userState[chatId];
  
  if (!state) return;

  const q = state.questions[state.index];
  
  if (!q.options.includes(text)) {
    return;
  }

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
    ...getMainMenu()
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