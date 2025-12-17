const express = require('express');
const { validateLanguageInput } = require('../middleware/validation');
const {
  getTodaysPuzzles,
  getPuzzlesByDate,
  getAllPuzzles,
  submitSolution,
  getAllPuzzleDates,
} = require('../controllers/playerController');

const router = express.Router();

// Player routes (no authentication required)
router.get('/today', getTodaysPuzzles);
router.get('/date/:date', getPuzzlesByDate);
router.get('/all', getAllPuzzles);
router.get('/dates', getAllPuzzleDates);
router.post('/submit/:id', validateLanguageInput, submitSolution);

module.exports = router;
