const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const questions = require('./questions');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Render o'chirib qo'ymasligi uchun port yaratamiz
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
}).listen(port);

const userState = {};

// /start buyrug'i kelganda
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  delete userState[chatId]; // Holatni tozalash

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
        [{ text: "🇷🇺 Rus tili" }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, `Assalomu alaykum, ${msg.from.first_name}! 🖐\n\nTest topshirmoqchi bo'lgan yo'nalishingizni tanlang:`, options);
});

// Xabarlar kelganda
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Agar start buyrug'i bo'lsa, bu yerda ishlamaydi
  if (text === '/start') return;

  if (text === "📐 Matematika") {
    startTest(chatId, 'math');
  } else if (text === "🇬🇧 Ingliz tili") {
    startTest(chatId, 'english');
  } else if (text === "🇷🇺 Rus tili") {
    startTest(chatId, 'russian');
  } else if (userState[chatId]) {
    checkAnswer(chatId, text);
  }
});

function startTest(chatId, subject) {
  userState[chatId] = {
    subject: subject,
    index: 0,
    score: 0
  };
  sendQuestion(chatId);
}

function sendQuestion(chatId) {
  const state = userState[chatId];
  const currentQuestions = questions[state.subject];

  if (state.index < currentQuestions.length) {
    const q = currentQuestions[state.index];
    const opts = {
      reply_markup: {
        keyboard: q.options.map(opt => [{ text: opt }]),
        resize_keyboard: true
      }
    };
    bot.sendMessage(chatId, `❓ ${state.index + 1}-savol: ${q.question}`, opts);
  } else {
    bot.sendMessage(chatId, `🎉 Test yakunlandi!\n\nSizning natijangiz: ${state.score} / ${currentQuestions.length}\n\nYana test ishlash uchun yo'nalishni tanlang:`, {
      reply_markup: {
        keyboard: [
          [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
          [{ text: "🇷🇺 Rus tili" }]
        ],
        resize_keyboard: true
      }
    });
    delete userState[chatId];
  }
}

function checkAnswer(chatId, text) {
  const state = userState[chatId];
  const currentQuestions = questions[state.subject];
  const q = currentQuestions[state.index];

  if (text === q.answer) {
    state.score++;
    bot.sendMessage(chatId, "✅ To'g'ri!");
  } else if (q.options.includes(text)) {
    bot.sendMessage(chatId, `❌ Noto'g'ri. To'g'ri javob: ${q.answer}`);
  } else {
    return;
  }

  state.index++;
  sendQuestion(chatId);
}
