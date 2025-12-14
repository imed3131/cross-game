import React, { useState, useRef, useEffect } from 'react';

const CrosswordCell = ({ 
  value = '', 
  onChange, 
  onNavigate,
  isSelected,
  isHighlighted,
  isHovered,
  isBlackCell,
  cellNumber,
  row,
  col,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = ''
}) => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(value);

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Handle multiple characters - take only the last one
    let finalChar = '';
    if (newValue.length > 0) {
      // Get the last character typed
      finalChar = newValue.slice(-1).toUpperCase();
      
      // Only accept alphabetic characters
      if (finalChar.match(/[A-ZÀ-ÿ]/i)) {
        setInputValue(finalChar);
        onChange(finalChar, row, col);
        
        // Auto-advance to next cell
        if (onNavigate) {
          setTimeout(() => {
            onNavigate('next', row, col);
          }, 50);
        }
      }
    } else {
      // Empty input - clear the cell
      setInputValue('');
      onChange('', row, col);
    }
  };

  const handleKeyDown = (e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (inputValue) {
        // Clear current cell
        setInputValue('');
        onChange('', row, col);
      } else {
        // Move to previous cell
        if (onNavigate) {
          onNavigate('previous', row, col);
        }
      }
      return;
    }

    // Handle arrow key navigation
    if (e.key === 'ArrowLeft' && onNavigate) {
      e.preventDefault();
      onNavigate('left', row, col);
    } else if (e.key === 'ArrowRight' && onNavigate) {
      e.preventDefault();
      onNavigate('right', row, col);
    } else if (e.key === 'ArrowUp' && onNavigate) {
      e.preventDefault();
      onNavigate('up', row, col);
    } else if (e.key === 'ArrowDown' && onNavigate) {
      e.preventDefault();
      onNavigate('down', row, col);
    }

    // For letter keys, let the input handle it
    if (e.key.length === 1 && e.key.match(/[A-ZÀ-ÿ]/i)) {
      // Clear current content to allow new character
      setInputValue('');
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(row, col);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      // Take only the last alphabetic character from pasted text
      const letters = pastedText.match(/[A-ZÀ-ÿ]/gi);
      if (letters && letters.length > 0) {
        const lastLetter = letters[letters.length - 1].toUpperCase();
        setInputValue(lastLetter);
        onChange(lastLetter, row, col);
        
        if (onNavigate) {
          setTimeout(() => {
            onNavigate('next', row, col);
          }, 50);
        }
      }
    }
  };

  if (isBlackCell) {
    return (
      <div 
        className={`
          w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
          bg-black border border-gray-300
          ${className}
        `}
      />
    );
  }

  return (
    <div 
      className={`
        relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
        border-2 transition-all duration-200
        ${isSelected ? 'border-blue-500 bg-blue-50' : ''}
        ${isHighlighted ? 'bg-yellow-100' : 'bg-white'}
        ${isHovered ? 'bg-gray-50' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => onMouseEnter && onMouseEnter(row, col)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      {/* Cell number */}
      {cellNumber && (
        <span className="absolute top-0 left-0 text-xs leading-none p-0.5 text-gray-600 font-medium">
          {cellNumber}
        </span>
      )}
      
      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        maxLength={1}
        className={`
          w-full h-full 
          text-center font-bold text-lg sm:text-xl
          bg-transparent border-0 outline-0
          ${cellNumber ? 'pt-2' : 'pt-0'}
          focus:ring-0 focus:outline-none
          ${isSelected ? 'text-blue-700' : 'text-black'}
        `}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
      />
    </div>
  );
};

export default CrosswordCell;
