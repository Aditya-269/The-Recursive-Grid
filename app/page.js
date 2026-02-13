'use client';

import { useState } from 'react';
import {
  createInitialState,
  getCellInfo,
  incrementCell,
  isCellLocked,
  getGridStats,
  resetGame
} from './gameState';

export default function Home() {
  const [gameState, setGameState] = useState(createInitialState());
  const stats = getGridStats(gameState);

  const handleCellClick = (row, col) => {
    // Increment cell value by 1 (for demonstration)
    const newState = incrementCell(gameState, row, col, 1);
    setGameState(newState);
  };

  const handleReset = () => {
    setGameState(resetGame());
  };

  const getCellStyle = (cellInfo) => {
    // Locked: value >= 15
    if (cellInfo.isLocked) {
      return {
        backgroundColor: '#ff0000',
        color: '#ffffff'
      };
    }
    // Even numbers
    if (cellInfo.isEven) {
      return {
        backgroundColor: '#e0e0e0',
        color: '#000000'
      };
    }
    // Odd numbers
    return {
      backgroundColor: '#1a237e',
      color: '#ffffff'
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      {/* Game Stats */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">The Recursive Grid</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Moves: {gameState.moveCount}</span>
          <span>Locked: {stats.lockedCount}/9</span>
          <span>Sum: {stats.sum}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {gameState.grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cellInfo = getCellInfo(value);
            const cellStyle = getCellStyle(cellInfo);
            const locked = isCellLocked(gameState, rowIndex, colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-24 h-24 flex items-center justify-center font-semibold text-xl ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                  } transition-opacity`}
                style={{
                  ...cellStyle,
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0px black'
                }}
                onClick={() => !locked && handleCellClick(rowIndex, colIndex)}
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
        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
      >
        Reset Game
      </button>
    </div>
  );
}
