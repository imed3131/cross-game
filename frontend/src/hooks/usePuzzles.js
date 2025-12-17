import { useState, useEffect, useRef, useCallback } from 'react';
import { playerAPI } from '../services/api';
// notifications disabled - using console logs

export const usePuzzles = () => {
  const [todaysPuzzles, setTodaysPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [puzzleDates, setPuzzleDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initRef = useRef(false);

  // Fetch today's puzzles
  const fetchTodaysPuzzles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await playerAPI.getTodaysPuzzles();
      setTodaysPuzzles(response.data);
      if (response.data.length > 0 && !selectedPuzzle) {
        setSelectedPuzzle(response.data[0]);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch today\'s puzzles:', error);
  setError('Failed to load today\'s puzzles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all published puzzles
  const fetchAllPuzzles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await playerAPI.getAllPuzzles();
      setTodaysPuzzles(response.data);
      if (response.data.length > 0 && !selectedPuzzle) {
        setSelectedPuzzle(response.data[0]);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch all puzzles:', error);
  setError('Failed to load puzzles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch puzzles by date
  const fetchPuzzlesByDate = async (date) => {
    try {
      // Don't set loading to avoid re-rendering PuzzleList
      const response = await playerAPI.getPuzzlesByDate(date);
      // Don't update todaysPuzzles to avoid re-rendering PuzzleList
      if (response.data.length > 0) {
        setSelectedPuzzle(response.data[0]);
      } else {
        setSelectedPuzzle(null);
      }
      return response;
    } catch (error) {
      console.error('Failed to fetch puzzles by date:', error);
  setError('Failed to load puzzles for selected date');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all puzzle dates for calendar
  const fetchPuzzleDates = async () => {
    try {
      const response = await playerAPI.getAllPuzzleDates();
      setPuzzleDates(response.data);
  return response;
    } catch (error) {
      console.error('Failed to fetch puzzle dates:', error);
  // silent failure for calendar - fall back to empty
    }
  };

  // Submit solution
  const submitSolution = async (puzzleId, solution, language, timeSpent) => {
    try {
      const response = await playerAPI.submitSolution(puzzleId, {
        solution,
        language,
        timeSpent,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit solution:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to submit solution');
    }
  };

  // Initialize data
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
  fetchAllPuzzles();
      fetchPuzzleDates();
    }
  }, []);

  return {
    todaysPuzzles,
    selectedPuzzle,
    setSelectedPuzzle,
    puzzleDates,
    loading,
    error,
    fetchTodaysPuzzles,
  fetchAllPuzzles,
    fetchPuzzlesByDate,
    fetchPuzzleDates,
    submitSolution,
  };
};
