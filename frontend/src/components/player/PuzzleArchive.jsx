import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';

const PuzzleArchive = ({ onClose, onSelectPuzzle, puzzleDates = [], todaysPuzzles = [], fetchPuzzlesByDate, loading: parentLoading }) => {
  const [dates, setDates] = useState(puzzleDates || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setDates(puzzleDates || []), [puzzleDates]);

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    if (fetchPuzzlesByDate) {
      setLoading(true);
      try {
        await fetchPuzzlesByDate(date);
      } catch (e) {
        // handled by hook
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Archive des puzzles</h3>
        <div className="text-sm text-white/80">Cliquez sur une date puis choisissez un puzzle</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {(parentLoading || loading) ? (
          <div className="col-span-3 p-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          (dates || []).length === 0 ? (
            <div className="col-span-3 text-sm text-white/70">Aucune date disponible</div>
          ) : (
            (dates || []).map((item) => {
              const dateRaw = typeof item === 'string' ? item : item?.date;
              const dateVal = dateRaw ? (new Date(dateRaw).toISOString().split('T')[0]) : String(item);
              return (
                <button
                  key={dateVal}
                  onClick={() => handleDateClick(dateVal)}
                  className={`px-3 py-2 rounded-lg text-sm text-left bg-white/5 hover:bg-white/10 transition-colors ${selectedDate === dateVal ? 'ring-2 ring-white/30' : ''}`}
                >
                  {dateVal}
                </button>
              );
            })
          )
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {selectedDate ? (
          (todaysPuzzles && todaysPuzzles.length > 0) ? (
            todaysPuzzles.map(p => (
              <div key={p.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{p.title}</div>
                  <div className="text-xs text-white/70">{p.date} · Grille {p.rows}×{p.cols} · {p.difficulty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPuzzle?.(p)}
                    className="px-3 py-1 bg-yellow-400 text-black rounded-md text-sm"
                  >Ouvrir</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/70">Aucun puzzle pour cette date.</div>
          )
        ) : (
          <p className="text-sm text-white/70">Sélectionnez une date pour voir les puzzles disponibles. Cliquez pour ouvrir le puzzle.</p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
        >Fermer</button>
      </div>
    </motion.div>
  );
};

export default PuzzleArchive;
