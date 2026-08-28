const questions = {
  math: [
    { question: "5 + 7 = ?", options: ["10", "12", "14"], answer: "12" },
    { question: "9 * 3 = ?", options: ["27", "21", "18"], answer: "27" },
    { question: "100 / 4 = ?", options: ["20", "25", "30"], answer: "25" }
  ],
  english: [
    { question: "'Apple' so'zining tarjimasi?", options: ["Olma", "Nok", "Uzum"], answer: "Olma" },
    { question: "'Cat' nima degani?", options: ["Kuchuk", "Mushuk", "Sichqon"], answer: "Mushuk" }
  ],
  russian: [
    { question: "'Привет' so'zining tarjimasi?", options: ["Xayr", "Salom", "Rahmat"], answer: "Salom" },
    { question: "'Спасибо' nima degani?", options: ["Rahmat", "Iltimos", "Ha"], answer: "Rahmat" }
  ]
};

module.exports = questions;