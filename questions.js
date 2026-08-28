// Har bir daraja 10 tadan savoldan iborat.
// "correct" - to'g'ri javob variantining raqami (0 dan boshlanadi).
// Pastdagi 1-daraja NAMUNA sifatida to'ldirilgan. Qolgan darajalarni
// o'zingizning kursingiz mavzusiga mos savollar bilan to'ldiring.
// Har bir daraja kamida 1 ta savolga ega bo'lishi kerak, 10 tagacha qo'shishingiz mumkin.

module.exports = {
  1: [
    {
      question: "2 + 2 nechchiga teng?",
      options: ["3", "4", "5", "6"],
      correct: 1
    },
    {
      question: "Quyoshdan eng yaqin sayyora qaysi?",
      options: ["Yer", "Merkuriy", "Mars", "Venera"],
      correct: 1
    },
    {
      question: "\"Kitob\" so'zida nechta harf bor?",
      options: ["4", "5", "6", "7"],
      correct: 1
    },
    {
      question: "Bir haftada nechta kun bor?",
      options: ["5", "6", "7", "8"],
      correct: 2
    },
    {
      question: "O'zbekiston poytaxti qaysi shahar?",
      options: ["Samarqand", "Buxoro", "Toshkent", "Andijon"],
      correct: 2
    },
    {
      question: "10 - 3 nechchiga teng?",
      options: ["6", "7", "8", "9"],
      correct: 1
    },
    {
      question: "Bir yilda nechta oy bor?",
      options: ["10", "11", "12", "13"],
      correct: 2
    },
    {
      question: "Suv necha gradusda muzlaydi (Selsiy bo'yicha)?",
      options: ["0", "10", "-5", "5"],
      correct: 0
    },
    {
      question: "5 x 5 nechchiga teng?",
      options: ["20", "25", "30", "15"],
      correct: 1
    },
    {
      question: "Eng katta okean qaysi?",
      options: ["Atlantika", "Hind", "Tinch okeani", "Shimoliy Muz okeani"],
      correct: 2
    }
  ],

  2: [
    // Namuna: shu yerga 2-daraja uchun 10 ta savol qo'shing
    {
      question: "Bu yerga savolingizni yozing?",
      options: ["Variant A", "Variant B", "Variant C", "Variant D"],
      correct: 0
    }
  ],

  3: [
    {
      question: "Bu yerga savolingizni yozing?",
      options: ["Variant A", "Variant B", "Variant C", "Variant D"],
      correct: 0
    }
  ]

  // Kerak bo'lsa 4, 5, 6 ... 10 gacha shu tarzda davom ettiring
};
