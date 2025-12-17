import React, { useEffect, useState } from 'react';

const PuzzleList = ({
  puzzles = [],
  loading = false,
  fetchAllPuzzles,
  onSelectPuzzle,
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localPuzzles, setLocalPuzzles] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPuzzles = async (language = selectedLanguage, page = currentPage) => {
    if (!fetchAllPuzzles) return;
    
    setLocalLoading(true);
    try {
      const response = await fetchAllPuzzles({
        language: language || undefined,
        page,
        limit: 10
      });
      
      setLocalPuzzles(response.data.puzzles || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      setLocalPuzzles([]);
      setTotalPages(1);
    } finally {
      setLocalLoading(false);
    }
  };  // Load initial puzzles
  useEffect(() => {
    if (!hasLoaded) {
      fetchPuzzles('', 1);
    }
  }, []); // Only run once on mount

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setCurrentPage(1);
    setShowLanguageDropdown(false);
    fetchPuzzles(language, 1);
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchPuzzles(selectedLanguage, page);
    }
  };

  return (
    <div className="mx-auto max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">Liste des puzzles</h3>
      </div>

      <div className="flex items-center gap-3 mb-3 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={toggleLanguageDropdown}
              className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {selectedLanguage || 'Tous les langages'}
            </button>

            {showLanguageDropdown && (
              <div className="absolute left-0 top-12 z-40 bg-gray-800 p-2 rounded-lg shadow-lg">
                <button
                  onClick={() => selectLanguage('')}
                  className="block w-full text-left px-3 py-1 text-white hover:bg-white/10 rounded"
                >
                  Tous les langages
                </button>
                <button
                  onClick={() => selectLanguage('FR')}
                  className="block w-full text-left px-3 py-1 text-white hover:bg-white/10 rounded"
                >
                  Français
                </button>
                <button
                  onClick={() => selectLanguage('AR')}
                  className="block w-full text-left px-3 py-1 text-white hover:bg-white/10 rounded"
                >
                  Arabe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {(loading || localLoading) ? (
          <div className="p-6 text-center text-sm text-white/70">
            Chargement des puzzles...
          </div>
        ) : (
          (localPuzzles && localPuzzles.length > 0) ? (
            localPuzzles.map(p => (
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
              {hasLoaded ? 'Aucun puzzle disponible.' : 'Chargement...'}
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-white/5 text-white rounded disabled:opacity-50 hover:bg-white/10 transition-colors"
          >
            ‹ Précédent
          </button>
          
          <span className="text-white/70 text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-white/5 text-white rounded disabled:opacity-50 hover:bg-white/10 transition-colors"
          >
            Suivant ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PuzzleList;