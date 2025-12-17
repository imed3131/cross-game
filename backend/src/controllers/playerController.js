const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getTodaysPuzzles = async (req, res) => {
  try {
    console.log('=== GET TODAYS PUZZLES ===');
    
    // Get current local date and create UTC date range for that day
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDay = now.getDate();
    
    // Create UTC date range for the current local day
    const startOfDay = new Date(Date.UTC(localYear, localMonth, localDay, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(localYear, localMonth, localDay + 1, 0, 0, 0, 0));
    
    console.log('Current local date:', now.toLocaleDateString());
    console.log('Searching for puzzles between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());
    
    const puzzles = await prisma.crosswordPuzzle.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        isPublished: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    console.log('Found puzzles:', puzzles.length);
    
  // Parse JSON strings and hide solutions for players
  const parsedPuzzles = puzzles.map(puzzle => {
    console.log('Processing puzzle:', puzzle.id);
    console.log('CluesHorizontal raw:', puzzle.cluesHorizontal);
    console.log('CluesVertical raw:', puzzle.cluesVertical);
    
    // Parse the original grid
    const originalGrid = JSON.parse(puzzle.grid);
    console.log('Original grid:', originalGrid);
    
    // Create empty player grid (keep structure but empty cells)
    const playerGrid = originalGrid.map(row => 
      row.map(cell => cell === '#' ? '#' : '') // Keep black cells (#), empty others
    );
    
    // Solution grid (complete grid with all letters)
    const solutionGrid = originalGrid; // This is the complete solution
    
    console.log('Player grid:', playerGrid);
    console.log('Solution grid:', solutionGrid);
    
    return {
      id: puzzle.id,
      title: puzzle.title,
      date: puzzle.date,
      language: puzzle.language,
      difficulty: puzzle.difficulty,
      rows: puzzle.rows,
      cols: puzzle.cols,
      grid: playerGrid, // Empty grid for player to fill
      solution: solutionGrid, // Complete solution for validation
      cluesHorizontal: JSON.parse(puzzle.cluesHorizontal), // Keep as original format
      cluesVertical: JSON.parse(puzzle.cluesVertical), // Keep as original format
      numbering: puzzle.numbering ? JSON.parse(puzzle.numbering) : {},
      createdAt: puzzle.createdAt,
    };
  });    res.json(parsedPuzzles);
  } catch (error) {
    console.error('=== ERREUR GET TODAYS PUZZLES ===');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

const getPuzzlesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    console.log('=== GET PUZZLES BY DATE ===');
    console.log('Received date parameter:', date);
    
    // Parse date and create UTC range for that specific day
    let year, month, day;
    if (date.includes('-')) {
      // If date is in YYYY-MM-DD format
      [year, month, day] = date.split('-').map(num => parseInt(num));
    } else {
      const parsed = new Date(date);
      year = parsed.getFullYear();
      month = parsed.getMonth() + 1; // getMonth() returns 0-indexed
      day = parsed.getDate();
    }
    
    // Create UTC date range for the specified day
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    
    console.log('Requested date:', date);
    console.log('Parsed as:', year + '-' + month + '-' + day);
    console.log('Searching for puzzles between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());
    
    const puzzles = await prisma.crosswordPuzzle.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        isPublished: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Parse JSON strings and hide solutions for players
    const parsedPuzzles = puzzles.map(puzzle => {
      // Parse the original grid
      const originalGrid = JSON.parse(puzzle.grid);
      
      // Create empty player grid (keep structure but empty cells)
      const playerGrid = originalGrid.map(row => 
        row.map(cell => cell === '#' ? '#' : '') // Keep black cells (#), empty others
      );
      
      // Solution grid (complete grid with all letters)
      const solutionGrid = originalGrid; // This is the complete solution
      
      return {
        id: puzzle.id,
        title: puzzle.title,
        date: puzzle.date,
        language: puzzle.language,
        difficulty: puzzle.difficulty,
        rows: puzzle.rows,
        cols: puzzle.cols,
        grid: playerGrid, // Empty grid for player to fill
        solution: solutionGrid, // Complete solution for validation
        cluesHorizontal: JSON.parse(puzzle.cluesHorizontal), // Keep as original format
        cluesVertical: JSON.parse(puzzle.cluesVertical), // Keep as original format
        numbering: puzzle.numbering ? JSON.parse(puzzle.numbering) : {},
        createdAt: puzzle.createdAt,
      };
    });
    
    res.json(parsedPuzzles);
  } catch (error) {
    console.error('Get puzzles by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPuzzles = async (req, res) => {
  try {
    const { language, page = 1, limit = 10 } = req.query;
    
    const where = { isPublished: true };
    if (language) {
      where.language = language;
    }
    
    const skip = (page - 1) * limit;
    const take = parseInt(limit);
    
    const [puzzles, total] = await Promise.all([
      prisma.crosswordPuzzle.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.crosswordPuzzle.count({ where })
    ]);

    const parsedPuzzles = puzzles.map(puzzle => {
      const originalGrid = JSON.parse(puzzle.grid);
      const playerGrid = originalGrid.map(row => row.map(cell => cell === '#' ? '#' : ''));
      const solutionGrid = originalGrid;
      return {
        id: puzzle.id,
        title: puzzle.title,
        date: puzzle.date,
        language: puzzle.language,
        difficulty: puzzle.difficulty,
        rows: puzzle.rows,
        cols: puzzle.cols,
        grid: playerGrid,
        solution: solutionGrid,
        cluesHorizontal: JSON.parse(puzzle.cluesHorizontal),
        cluesVertical: JSON.parse(puzzle.cluesVertical),
        numbering: puzzle.numbering ? JSON.parse(puzzle.numbering) : {},
        createdAt: puzzle.createdAt,
      };
    });

    res.json({
      puzzles: parsedPuzzles,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get all puzzles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { solution, language, timeSpent } = req.body;
    
    // Get the puzzle with the correct solution
    const puzzle = await prisma.crosswordPuzzle.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }
    
    const correctSolution = JSON.parse(puzzle.solution);
    const isCorrect = JSON.stringify(solution) === JSON.stringify(correctSolution);
    
    if (isCorrect) {
      // Record player stats
      const today = new Date();
      const existingStats = await prisma.playerStats.findFirst({
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
          language: language,
        },
      });
      
      if (existingStats) {
        await prisma.playerStats.update({
          where: { id: existingStats.id },
          data: {
            puzzlesCompleted: existingStats.puzzlesCompleted + 1,
            totalTimeSpent: existingStats.totalTimeSpent + timeSpent,
          },
        });
      } else {
        await prisma.playerStats.create({
          data: {
            date: today,
            puzzlesCompleted: 1,
            language: language,
            totalTimeSpent: timeSpent,
          },
        });
      }
    }
    
    res.json({
      correct: isCorrect,
      message: isCorrect ? 'Congratulations! Puzzle solved correctly!' : 'Some answers are incorrect. Keep trying!',
      solution: isCorrect ? correctSolution : null,
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPuzzleDates = async (req, res) => {
  try {
    const puzzleDates = await prisma.crosswordPuzzle.findMany({
      select: {
        date: true,
        language: true,
        title: true,
        difficulty: true,
      },
      where: {
        isPublished: true,
      },
      distinct: ['date'],
      orderBy: { date: 'desc' },
    });
    
    res.json(puzzleDates);
  } catch (error) {
    console.error('Get puzzle dates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTodaysPuzzles,
  getPuzzlesByDate,
  getAllPuzzles,
  submitSolution,
  getAllPuzzleDates,
};
