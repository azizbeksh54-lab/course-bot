const questions = {
  math: [
    { question: "5 + 7 = ?", options: ["10", "12", "14"], answer: "12" },
    { question: "9 * 3 = ?", options: ["27", "21", "18"], answer: "27" },
    { question: "100 / 4 = ?", options: ["20", "25", "30"], answer: "25" },
    { question: "15 - 8 = ?", options: ["7", "6", "8"], answer: "7" },
    { question: "6 * 6 = ?", options: ["32", "36", "40"], answer: "36" }
  ],
  english: [
    { question: "'Apple' so'zining tarjimasi?", options: ["Olma", "Nok", "Uzum"], answer: "Olma" },
    { question: "'Cat' nima degani?", options: ["Kuchuk", "Mushuk", "Sichqon"], answer: "Mushuk" },
    { question: "'Book' so'zining tarjimasi?", options: ["Daftar", "Qalam", "Kitob"], answer: "Kitob" },
    { question: "'Water' nima degani?", options: ["Suv", "Sut", "Choy"], answer: "Suv" },
    { question: "'Sun' so'zining tarjimasi?", options: ["Oy", "Quyosh", "Yulduz"], answer: "Quyosh" }
  ],
  russian: [
    { question: "'Привет' so'zining tarjimasi?", options: ["Xayr", "Salom", "Rahmat"], answer: "Salom" },
    { question: "'Спасибо' nima degani?", options: ["Rahmat", "Iltimos", "Ha"], answer: "Rahmat" },
    { question: "'Книга' so'zining tarjimasi?", options: ["Daftar", "Kitob", "Qalam"], answer: "Kitob" },
    { question: "'Солнце' nima degani?", options: ["Quyosh", "Oy", "Yulduz"], answer: "Quyosh" },
    { question: "'Друг' so'zining tarjimasi?", options: ["Dushman", "Do'st", "Qarindosh"], answer: "Do'st" }
  ]
};

module.exports = questions;