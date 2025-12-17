const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crossword.com' },
    update: {},
    create: {
      email: 'admin@crossword.com',
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', admin.email);

  // Create sample French puzzle
  const frenchGrid = [
    ['C', 'H', 'A', 'T'],
    ['H', 'O', 'M', 'M'],
    ['A', 'U', 'X', ''],
    ['T', '', '', '']
  ];

  const frenchPuzzle = await prisma.crosswordPuzzle.create({
    data: {
      title: "Puzzle Français Test",
      date: new Date("2025-12-17"),
      language: 'FR',
      difficulty: 'easy',
      rows: 4,
      cols: 4,
      grid: JSON.stringify(frenchGrid),
      cluesHorizontal: JSON.stringify([
        { number: 1, clue: "Animal domestique", answer: "CHAT", startRow: 0, startCol: 0, length: 4 },
        { number: 2, clue: "Personne de la famille", answer: "HOMME", startRow: 1, startCol: 0, length: 5 },
        { number: 3, clue: "Aide", answer: "AUX", startRow: 2, startCol: 0, length: 3 }
      ]),
      cluesVertical: JSON.stringify([
        { number: 1, clue: "Animal domestique", answer: "CHAT", startRow: 0, startCol: 0, length: 4 },
        { number: 2, clue: "Lettre H", answer: "H", startRow: 0, startCol: 1, length: 1 },
        { number: 3, clue: "Voyelle O", answer: "O", startRow: 1, startCol: 1, length: 1 }
      ]),
      solution: JSON.stringify(frenchGrid),
      numbering: JSON.stringify({}),
      isPublished: true,
    },
  });

  console.log('French puzzle created:', frenchPuzzle.title);

  // Create sample Arabic puzzle
  const arabicGrid = [
    ['ك', 'ت', 'ا', 'ب'],
    ['ب', 'ي', 'ت', ''],
    ['', '', '', '']
  ];

  const arabicPuzzle = await prisma.crosswordPuzzle.create({
    data: {
      title: "لغز عربي تجريبي",
      date: new Date("2025-12-18"),
      language: 'AR',
      difficulty: 'easy',
      rows: 3,
      cols: 4,
      grid: JSON.stringify(arabicGrid),
      cluesHorizontal: JSON.stringify([
        { number: 1, clue: "كتاب للقراءة", answer: "كتاب", startRow: 0, startCol: 0, length: 4 },
        { number: 2, clue: "مكان للسكن", answer: "بيت", startRow: 1, startCol: 0, length: 3 }
      ]),
      cluesVertical: JSON.stringify([
        { number: 1, clue: "حرف الكاف", answer: "ك", startRow: 0, startCol: 0, length: 1 },
        { number: 2, clue: "حرف الباء", answer: "ب", startRow: 0, startCol: 1, length: 1 }
      ]),
      solution: JSON.stringify(arabicGrid),
      numbering: JSON.stringify({}),
      isPublished: true,
    },
  });

  console.log('Arabic puzzle created:', arabicPuzzle.title);

  console.log('Test puzzles created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
