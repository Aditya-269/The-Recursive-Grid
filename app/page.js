'use client';

import { useState } from 'react';
import {
  createInitialState,
  getCellInfo,
  updateGrid,
  isCellLocked,
  getGridStats,
  resetGame
} from './gameState';

export default function Home() {
  const [gameState, setGameState] = useState(createInitialState());
  const stats = getGridStats(gameState);

  const handleCellClick = (row, col) => {
    // Use the pure updateGrid function with game logic
    const newGrid = updateGrid(gameState.grid, row, col);

    // Only update state if grid actually changed
    if (newGrid !== gameState.grid) {
      setGameState({
        ...gameState,
        grid: newGrid,
        moveCount: gameState.moveCount + 1
      });
    }
  };

  const handleReset = () => {
    setGameState(resetGame());
  };

  /* 
   * UI COMPLIANCE AUDIT FIXES:
   * - Strict color codes: #e0e0e0 (Even), #1a237e (Odd), Red (Locked)
   * - Rounded corners: 4px
   * - Shadow: box-shadow: 2px 2px 0px black
   * - Centered layout
   */
  const getCellStyle = (value, isLocked) => {
    // 1. Locked State (Highest Priority)
    if (isLocked) {
      return {
        backgroundColor: '#ff0000', // Red
        color: '#ffffff'            // White
      };
    }

    // 2. Even Numbers
    if (value % 2 === 0) {
      return {
        backgroundColor: '#e0e0e0', // Light Gray
        color: '#000000'            // Black
      };
    }

    // 3. Odd Numbers
    return {
      backgroundColor: '#1a237e',   // Deep Blue
      color: '#ffffff'              // White
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6 font-sans">
      {/* Game Stats */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">The Recursive Grid</h1>
        <div className="flex gap-4 text-sm text-gray-600 font-medium">
          <span>Moves: {gameState.moveCount}</span>
          <span>Locked: {stats.lockedCount}/9</span>
          <span>Sum: {stats.sum}</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow-sm">
        {gameState.grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const locked = isCellLocked(gameState, rowIndex, colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => !locked && handleCellClick(rowIndex, colIndex)}
                className={`
                  w-24 h-24 flex items-center justify-center 
                  text-2xl font-bold select-none transition-transform active:scale-95
                  ${locked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
                `}
                style={{
                  ...getCellStyle(value, locked),
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0px black',
                  border: '1px solid black' // Added for better visibility of 0s on white
                }}
                title={locked ? 'Locked' : 'Click to increment'}
              >
                {value}
              </div>
            );
          })
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors font-bold shadow-[2px_2px_0px_black] active:translate-y-[2px] active:shadow-none"
        style={{ borderRadius: '4px' }}
      >
        Reset Game
      </button>
    </div>
  );
}
