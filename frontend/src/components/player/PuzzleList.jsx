import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Calendar from './Calendar';
import { playerAPI } from '../../services/api';

const PuzzleList = ({
  puzzleDates = [],
  puzzles = [],
  loading = false,
  fetchPuzzlesByDate,
  fetchAllPuzzles,
  onSelectPuzzle,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const mountId = useRef(Math.random().toString(36));
  
  // Force re-render counter
  const [, forceUpdate] = useState(0);
  const triggerRerender = useCallback(() => {
    forceUpdate(n => n + 1);
  }, []);

  const [localLoading, setLocalLoading] = useState(false);
  const [localPuzzles, setLocalPuzzles] = useState([]);
  const [inlineMessage, setInlineMessage] = useState('');

  // Persistent state object (doesn't trigger re-renders automatically)
  const persistentState = useRef({
    isFiltered: false,
    dateString: '',
    showCalendar: false,
  });

  // State to trigger effects when filter changes
  const [filterTrigger, setFilterTrigger] = useState(0);

  // visible puzzles: if filtered show localPuzzles, otherwise show parent puzzles
  const visiblePuzzles = useMemo(() => {
    const result = persistentState.current.isFiltered ? localPuzzles : (puzzles || []);
    return result;
  }, [filterTrigger, localPuzzles, puzzles]);

  useEffect(() => {
    return () => {
    };
  }, []);

  useEffect(() => {
    // clear inline message when parent puzzles change and no filter
    if (!persistentState.current.isFiltered) setInlineMessage('');
  }, [puzzles, filterTrigger]);

  // Normalize calendar selection payloads (Date object, ISO string, or custom)
  const mkDateVal = (dateInput) => {
    if (!dateInput) return null;
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const handleCalendarSelect = useCallback(async (dateObj) => {
    const dateVal = mkDateVal(dateObj);
    
    if (!dateVal) {
      return;
    }

    // Update state
    persistentState.current.isFiltered = true;
    persistentState.current.dateString = dateVal;
    persistentState.current.showCalendar = false;
    setFilterTrigger(n => n + 1);
    triggerRerender();
    
    // Set loading FIRST before any async operations
    setLocalLoading(true);
    setInlineMessage('Chargement des puzzles...');
    
    // Force component to re-render to show loading state
    triggerRerender();
    
    // Wait a tiny bit to ensure loading state is rendered
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      let resp = null;
      
      if (fetchPuzzlesByDate) {
        resp = await fetchPuzzlesByDate(dateVal);
      } else {
        resp = await playerAPI.getPuzzlesByDate(dateVal);
      }
      
      // Try different ways to extract the data
      let data = null;
      
      if (resp?.data?.data) {
        // Nested data (axios response with data.data)
        data = resp.data.data;
      } else if (resp?.data) {
        // Direct data
        data = resp.data;
      } else if (Array.isArray(resp)) {
        // Response is directly the array
        data = resp;
      } else {
        data = [];
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Set puzzles first
      setLocalPuzzles(data);
      
      // Update message
      if (!data || data.length === 0) {
        setInlineMessage('Aucun puzzle trouvé pour cette date');
      } else {
        setInlineMessage('');
      }
      
    } catch (e) {
      setInlineMessage('Erreur réseau lors de la récupération des puzzles.');
      setLocalPuzzles([]);
    } finally {
      setLocalLoading(false);
      // Force re-render after everything is done
      triggerRerender();
    }
  }, [fetchPuzzlesByDate, triggerRerender]);

  const disableFilter = useCallback(async () => {
    // Update state
    persistentState.current.isFiltered = false;
    persistentState.current.dateString = '';
    persistentState.current.showCalendar = false;
    setFilterTrigger(n => n + 1);
    
    // Force re-render
    triggerRerender();
    
    setLocalPuzzles([]);
    setInlineMessage('');
    
    if (fetchAllPuzzles) {
      setLocalLoading(true);
      try { 
        await fetchAllPuzzles(); 
      } finally { 
        setLocalLoading(false); 
      }
    }
  }, [fetchAllPuzzles, triggerRerender]);

  const toggleCalendar = useCallback(() => {
    persistentState.current.showCalendar = !persistentState.current.showCalendar;
    setFilterTrigger(n => n + 1);
    triggerRerender();
  }, [triggerRerender]);

  return (
    <div className="mx-auto max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">Liste des puzzles</h3>
      </div>

      <div className="flex items-center gap-3 mb-3 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleCalendar}
            className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {persistentState.current.isFiltered ? `${persistentState.current.dateString}` : `Choisir une date`}
          </button>

          {persistentState.current.isFiltered && (
            <button
              onClick={disableFilter}
              className="px-3 py-2 bg-red-500/90 text-white rounded-lg text-sm hover:bg-red-600 transition-colors whitespace-nowrap font-medium"
            >
              ✕ Retirer le filtre
            </button>
          )}
        </div>

        {persistentState.current.showCalendar && (
          <div className="absolute left-0 top-12 z-40">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Calendar
                puzzleDates={puzzleDates}
                selectedDate={persistentState.current.isFiltered ? new Date(persistentState.current.dateString) : null}
                onDateSelect={handleCalendarSelect}
                className="bg-transparent p-0 shadow-2xl rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {(loading || localLoading) ? (
          <div className="p-6 text-center text-sm text-white/70">
            Chargement des puzzles...
          </div>
        ) : (
          (visiblePuzzles && visiblePuzzles.length > 0) ? (
            visiblePuzzles.map(p => (
              <div key={p.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between mb-2 hover:bg-white/10 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-white">{p.title || 'Puzzle'}</div>
                  <div className="text-xs text-white/70">{new Date(p.date).toLocaleDateString('fr-FR')} · {p.rows}×{p.cols} · {p.difficulty}</div>
                  <div className="text-xs font-bold text-yellow-400 uppercase">{p.language}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPuzzle?.(p)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded-md text-sm hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Ouvrir
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-white/70">
              {persistentState.current.isFiltered ? 'Aucun puzzle trouvé pour cette date' : (inlineMessage || 'Aucun puzzle disponible.')}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PuzzleList;