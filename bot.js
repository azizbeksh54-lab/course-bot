require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');

const questions = require('./questions.js');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const PASS_PERCENT = 60; // Darajadan o'tish uchun kerak bo'lgan foiz
const MAX_LEVEL = Math.max(...Object.keys(questions).map(Number));

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------- Progress saqlash (oddiy JSON fayl orqali) ----------
function loadProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return {};
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
}

function saveProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function getUser(ctx) {
  const data = loadProgress();
  const id = String(ctx.from.id);
  if (!data[id]) {
    data[id] = {
      name: ctx.from.first_name || 'O\'quvchi',
      level: 1,
      qIndex: 0,
      correct: 0
    };
    saveProgress(data);
  }
  return { data, id, user: data[id] };
}

// ---------- Savol yuborish ----------
async function sendQuestion(ctx) {
  const { data, id, user } = getUser(ctx);
  const levelQuestions = questions[user.level];

  if (!levelQuestions) {
    await ctx.reply(`🎉 Tabriklaymiz, ${user.name}! Siz barcha darajalarni tugatdingiz!`);
    return;
  }

  const q = levelQuestions[user.qIndex];
  const buttons = q.options.map((opt, i) =>
    Markup.button.callback(opt, `ans_${user.level}_${user.qIndex}_${i}`)
  );

  await ctx.reply(
    `📘 Daraja ${user.level} — Savol ${user.qIndex + 1}/${levelQuestions.length}\n\n${q.question}`,
    Markup.inlineKeyboard(buttons, { columns: 1 })
  );
}

// ---------- /start ----------
bot.start(async (ctx) => {
  const { user } = getUser(ctx);
  await ctx.reply(
    `Assalomu alaykum, ${user.name}! 👋\nKurs botiga xush kelibsiz.\nHozir Daraja ${user.level} dan boshlaymiz.`
  );
  await sendQuestion(ctx);
});

// ---------- /progress ----------
bot.command('progress', async (ctx) => {
  const { user } = getUser(ctx);
  const total = questions[user.level] ? questions[user.level].length : 0;
  await ctx.reply(
    `📊 Sizning holatingiz:\nDaraja: ${user.level}\nSavol: ${user.qIndex + 1}/${total}\nTo'g'ri javoblar (shu darajada): ${user.correct}`
  );
});

// ---------- Javob tanlanganda ----------
bot.action(/^ans_(\d+)_(\d+)_(\d+)$/, async (ctx) => {
  const level = Number(ctx.match[1]);
  const qIndex = Number(ctx.match[2]);
  const chosen = Number(ctx.match[3]);

  const { data, id, user } = getUser(ctx);

  // Eskirgan tugma bosilsa (foydalanuvchi allaqachon boshqa savolda) e'tiborsiz qoldiramiz
  if (user.level !== level || user.qIndex !== qIndex) {
    await ctx.answerCbQuery('Bu savol eskirgan.');
    return;
  }

  const q = questions[level][qIndex];
  const isCorrect = chosen === q.correct;

  if (isCorrect) {
    user.correct += 1;
    await ctx.answerCbQuery('✅ To\'g\'ri!');
  } else {
    await ctx.answerCbQuery('❌ Noto\'g\'ri.');
    await ctx.reply(`To'g'ri javob: ${q.options[q.correct]}`);
  }

  user.qIndex += 1;
  const levelQuestions = questions[level];

  if (user.qIndex >= levelQuestions.length) {
    // Daraja tugadi — natijani hisoblaymiz
    const percent = Math.round((user.correct / levelQuestions.length) * 100);

    if (percent >= PASS_PERCENT && level < MAX_LEVEL && questions[level + 1]) {
      await ctx.reply(
        `🏁 Daraja ${level} tugadi! Natija: ${percent}%\n✅ O'tdingiz! Endi Daraja ${level + 1} boshlanadi.`
      );
      user.level += 1;
      user.qIndex = 0;
      user.correct = 0;
    } else if (percent >= PASS_PERCENT) {
      await ctx.reply(`🎉 Tabriklaymiz, ${user.name}! Siz barcha darajalarni muvaffaqiyatli tugatdingiz! Natija: ${percent}%`);
    } else {
      await ctx.reply(
        `🏁 Daraja ${level} tugadi! Natija: ${percent}%\n❌ O'tolmadingiz (kamida ${PASS_PERCENT}% kerak). Bu darajani qaytadan boshlaymiz.`
      );
      user.qIndex = 0;
      user.correct = 0;
    }

    data[id] = user;
    saveProgress(data);

    if (questions[user.level]) {
      await sendQuestion(ctx);
    }
  } else {
    data[id] = user;
    saveProgress(data);
    await sendQuestion(ctx);
  }
});

bot.launch();
console.log('Bot ishga tushdi...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const http = require('http');

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running online!\n');
}).listen(port);