// Har bir daraja 10 tadan savoldan iborat.
// "correct" - to'g'ri javob variantining raqami (0 dan boshlanadi).
// Pastdagi 1-daraja NAMUNA sifatida to'ldirilgan. Qolgan darajalarni
// o'zingizning kursingiz mavzusiga mos savollar bilan to'ldiring.
// Har bir daraja kamida 1 ta savolga ega bo'lishi kerak, 10 tagacha qo'shishingiz mumkin.

const questions = {
  math: [
    { question: "5 + 7 = ?", options: ["10", "12", "14"], answer: "12" },
    { question: "9 * 3 = ?", options: ["27", "21", "18"], answer: "27" }
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


