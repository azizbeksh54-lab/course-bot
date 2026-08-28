const questions = {
  math: [
    // 🔰 OSON (1-2-daraja)
    { question: "5 + 7 = ?", options: ["10", "12", "14"], answer: "12", level: "easy" },
    { question: "9 * 3 = ?", options: ["27", "21", "18"], answer: "27", level: "easy" },
    { question: "100 / 4 = ?", options: ["20", "25", "30"], answer: "25", level: "easy" },
    { question: "15 - 8 = ?", options: ["7", "6", "8"], answer: "7", level: "easy" },
    { question: "6 * 6 = ?", options: ["32", "36", "40"], answer: "36", level: "easy" },
    
    // ⚡ O'RTA (3-4-daraja)
    { question: "12 * 15 = ?", options: ["160", "170", "180"], answer: "180", level: "medium" },
    { question: "√256 = ?", options: ["14", "16", "18"], answer: "16", level: "medium" },
    { question: "3^4 = ?", options: ["64", "81", "96"], answer: "81", level: "medium" },
    { question: "7! (faktorial) = ?", options: ["5040", "720", "40320"], answer: "5040", level: "medium" },
    { question: "144 / 12 = ?", options: ["10", "11", "12"], answer: "12", level: "medium" },
    
    // 🔥 QIYIN (5-daraja)
    { question: "log₂(32) = ?", options: ["4", "5", "6"], answer: "5", level: "hard" },
    { question: "sin(30°) * cos(60°) = ?", options: ["0.25", "0.5", "0.75"], answer: "0.25", level: "hard" },
    { question: "9x + 7 = 52, x = ?", options: ["5", "6", "7"], answer: "5", level: "hard" },
    { question: "2x² - 8x + 6 = 0, x = ?", options: ["1 yoki 3", "2 yoki 4", "3 yoki 5"], answer: "1 yoki 3", level: "hard" }
  ],
  
  english: [
    // 🔰 OSON
    { question: "'Apple' so'zining tarjimasi?", options: ["Olma", "Nok", "Uzum"], answer: "Olma", level: "easy" },
    { question: "'Cat' nima degani?", options: ["Kuchuk", "Mushuk", "Sichqon"], answer: "Mushuk", level: "easy" },
    { question: "'Book' so'zining tarjimasi?", options: ["Daftar", "Qalam", "Kitob"], answer: "Kitob", level: "easy" },
    
    // ⚡ O'RTA
    { question: "'Meticulous' so'zining ma'nosi?", options: ["Ehtiyotsiz", "Juda aniq", "Tez"], answer: "Juda aniq", level: "medium" },
    { question: "'Eloquent' so'zining tarjimasi?", options: ["Notiq", "Dangasa", "Qo'pol"], answer: "Notiq", level: "medium" },
    { question: "'Ephemeral' so'zining ma'nosi?", options: ["Doimiy", "Qisqa muddatli", "Kuchli"], answer: "Qisqa muddatli", level: "medium" },
    { question: "'Water' nima degani?", options: ["Suv", "Sut", "Choy"], answer: "Suv", level: "medium" },
    
    // 🔥 QIYIN
    { question: "'Ubiquitous' so'zining ma'nosi?", options: ["Kamdan-kam", "Hamma joyda", "Hech qayerda"], answer: "Hamma joyda", level: "hard" },
    { question: "'Sycophant' so'zining ma'nosi?", options: ["Xushomadgo'y", "Rostgo'y", "Dushman"], answer: "Xushomadgo'y", level: "hard" },
    { question: "'Quintessential' so'zining tarjimasi?", options: ["Mukammal namuna", "Yomon", "Oddiy"], answer: "Mukammal namuna", level: "hard" }
  ],
  
  russian: [
    // 🔰 OSON
    { question: "'Привет' so'zining tarjimasi?", options: ["Xayr", "Salom", "Rahmat"], answer: "Salom", level: "easy" },
    { question: "'Спасибо' nima degani?", options: ["Rahmat", "Iltimos", "Ha"], answer: "Rahmat", level: "easy" },
    { question: "'Книга' so'zining tarjimasi?", options: ["Daftar", "Kitob", "Qalam"], answer: "Kitob", level: "easy" },
    
    // ⚡ O'RTA
    { question: "'Неожиданный' so'zining ma'nosi?", options: ["Kutilgan", "Kutilmagan", "Oddiy"], answer: "Kutilmagan", level: "medium" },
    { question: "'Достопримечательность' nima degani?", options: ["Diqqatga sazovor joy", "Yomon joy", "Katta shahar"], answer: "Diqqatga sazovor joy", level: "medium" },
    { question: "'Приблизительно' so'zining tarjimasi?", options: ["Taxminan", "Aniq", "Ro'para"], answer: "Taxminan", level: "medium" },
    
    // 🔥 QIYIN
    { question: "'Беспрецедентный' so'zining ma'nosi?", options: ["Avval bo'lmagan", "Takrorlangan", "Oddiy"], answer: "Avval bo'lmagan", level: "hard" },
    { question: "'Самобытность' nima degani?", options: ["O'ziga xoslik", "Oddiylik", "Kuchlilik"], answer: "O'ziga xoslik", level: "hard" }
  ],
  
  logic: [
    // ⚡ O'RTA
    { question: "Agar 2 = 6, 3 = 12, 4 = 20, 5 = 30 bo'lsa, 6 = ?", options: ["36", "42", "48"], answer: "42", level: "medium" },
    { question: "Qaysi biri boshqalardan farq qiladi: {2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096} ?", options: ["2", "4096", "hech biri"], answer: "hech biri", level: "medium" },
    { question: "Agar 1 = 5, 2 = 25, 3 = 125, 4 = 625 bo'lsa, 5 = ?", options: ["3125", "5", "625"], answer: "5", level: "hard" },
    
    // 🔥 QIYIN
    { question: "A, B, C, D, E, F, G... 7-harf qaysi?", options: ["G", "H", "I"], answer: "G", level: "hard" },
    { question: "Bugun chorshanba bo'lsa, 100 kundan keyin haftaning qaysi kuni?", options: ["Shanba", "Yakshanba", "Dushanba"], answer: "Yakshanba", level: "hard" },
    { question: "3 ta mushuk 3 daqiqada 3 ta sichqon tutsa, 100 ta mushuk 100 daqiqada nechta sichqon tutadi?", options: ["100", "1000", "10000"], answer: "100", level: "hard" }
  ],
  
  geography: [
    { question: "Dunyodagi eng uzun daryo?", options: ["Nil", "Amazon", "Missisipi"], answer: "Nil", level: "medium" },
    { question: "Eng baland tog'?", options: ["Everest", "K2", "Kilimanjaro"], answer: "Everest", level: "easy" },
    { question: "O'zbekiston qaysi yilda mustaqil bo'ldi?", options: ["1991", "1992", "1990"], answer: "1991", level: "easy" },
    { question: "Qaysi davlat ikkita qit'ada joylashgan?", options: ["Misr", "Turkiya", "Rossiya"], answer: "Turkiya", level: "hard" },
    { question: "Dunyodagi eng kichik davlat?", options: ["Vatikan", "Monako", "San-Marino"], answer: "Vatikan", level: "medium" },
    { question: "Yerdagi eng chuqur joy?", options: ["Mariana botmog'i", "Tonga", "Filipin"], answer: "Mariana botmog'i", level: "hard" }
  ],
  
  history: [
    { question: "Ikkinchi jahon urushi qaysi yilda boshlangan?", options: ["1939", "1940", "1941"], answer: "1939", level: "easy" },
    { question: "Amir Temur qachon vafot etgan?", options: ["1405", "1500", "1360"], answer: "1405", level: "medium" },
    { question: "Birinchi yozma qonunlar to'plami?", options: ["Hammurapi", "Qur'on", "Tavrot"], answer: "Hammurapi", level: "hard" },
    { question: "Buyuk Ipak yo'li qaysi davrlarda gullagan?", options: ["Mil.avv. 2-asr", "Mil. 8-asr", "Mil.avv. 5-asr"], answer: "Mil.avv. 2-asr", level: "hard" },
    { question: "Qaysi shahar 1929-1991 yillarda Leningrad deb atalgan?", options: ["Moskva", "Sankt-Peterburg", "Kiyev"], answer: "Sankt-Peterburg", level: "medium" }
  ]
};

module.exports = questions;