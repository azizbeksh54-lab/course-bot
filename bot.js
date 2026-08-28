const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const questions = require('./questions');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Render xatolik bermasligi uchun server
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot ishlamoqda!\n');
}).listen(port);

const userState = {};

// /start buyrug'i
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  delete userState[chatId];

  const options = {
    reply_markup: {
      keyboard: [
        [{ text: "📐 Matematika" }, { text: "🇬🇧 Ingliz tili" }],
        [{ text: "🇷🇺 Rus tili" }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, "Assalomu alaykum! Test topshirmoqchi bo'lgan yo'nalishingizni tanlang:", options);
});

// Xabarlarni tekshirish
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

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
    bot.sendMessage(chatId, `${state.index + 1}-savol: ${q.question}`, opts);
  } else {
    bot.sendMessage(chatId, "Test yakunlandi!\n\nSizning natijangiz: " + state.score + " / " + currentQuestions.length, {
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
    bot.sendMessage(chatId, "To'g'ri javob!");
  } else if (q.options.includes(text)) {
    bot.sendMessage(chatId, "Noto'g'ri javob. To'g'ri javob: " + q.answer);
  } else {
    return;
  }

  state.index++;
  sendQuestion(chatId);
}