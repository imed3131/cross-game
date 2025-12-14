const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDates() {
  try {
    const puzzles = await prisma.crosswordPuzzle.findMany({
      select: { id: true, title: true, date: true, isPublished: true },
      orderBy: { date: 'asc' }
    });
    
    console.log('=== PUZZLE DATES IN DATABASE ===');
    puzzles.forEach(p => {
      console.log('ID: ' + p.id + ', Title: ' + p.title + ', Published: ' + p.isPublished);
      console.log('  - Date ISO: ' + p.date.toISOString());
      console.log('  - Date Local: ' + p.date.toLocaleDateString());
      console.log('  - Date String: ' + p.date.toString());
      console.log('---');
    });
    
    console.log('\n=== SERVER TIME INFO ===');
    console.log('Current server time:', new Date());
    console.log('Current server date:', new Date().toLocaleDateString());
    console.log('Timezone offset (minutes):', new Date().getTimezoneOffset());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates();
