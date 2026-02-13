'use client';

import { useState, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleCellClick = (row, col) => {
    const newGrid = updateGrid(gameState.grid, row, col);
    if (newGrid !== gameState.grid) {
      setGameState({
        ...gameState,
        grid: newGrid
      });
    }
  };

  const handleReset = () => {
    setGameState(resetGame());
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  /* 
   * STRICT COMPLIANCE
   * - Rounded: 4px
   * - Shadow: 2px 2px 0px black
   */
  const getCellStyle = (value, isLocked) => {
    const baseStyle = {
      borderRadius: '4px',
      boxShadow: '2px 2px 0px black',
      border: '1px solid black'
    };

    if (isLocked) {
      return { ...baseStyle, backgroundColor: '#ff0000', color: '#ffffff' };
    }
    if (value % 2 === 0) {
      return { ...baseStyle, backgroundColor: '#e0e0e0', color: '#000000' };
    }
    return { ...baseStyle, backgroundColor: '#1a237e', color: '#ffffff' };
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50/50'
      }`}>

      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-lg transition-all duration-300 ${isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-md`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="flex gap-8 max-w-6xl w-full items-start justify-center flex-wrap lg:flex-nowrap">

        {/* GAME CARD */}
        <div className={`p-10 rounded-2xl shadow-xl border flex-shrink-0 flex flex-col items-center gap-8 transition-all duration-300 ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
          }`}>

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className={`text-3xl font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              The Recursive Grid
            </h1>
            <p className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              Logic Control System
            </p>
          </div>

          {/* GRID */}
          <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl border transition-colors ${isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-200'
            }`}>
            {gameState.grid.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const locked = isCellLocked(gameState, rowIndex, colIndex);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !locked && handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-20 h-20 md:w-24 md:h-24 flex items-center justify-center 
                      text-3xl font-bold select-none font-mono
                      transition-transform active:scale-95
                      ${locked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:brightness-105'}
                    `}
                    style={getCellStyle(value, locked)}
                    title={locked ? 'Locked' : 'Click to increment'}
                  >
                    {value}
                  </div>
                );
              })
            )}
          </div>

          {/* ACTIONS */}
          <button
            onClick={handleReset}
            className={`
              px-8 py-2.5 
              text-sm font-semibold 
              rounded-md shadow-sm 
              transition-colors 
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isDarkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                : 'bg-gray-900 text-white hover:bg-black focus:ring-gray-900'
              }
            `}
          >
            Reset Game
          </button>

        </div>

        {/* RULES PANEL */}
        <div className={`p-8 rounded-2xl shadow-xl border max-w-sm transition-all duration-300 ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
          }`}>
          <h2 className={`text-xl font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Game Rules
          </h2>

          <div className={`space-y-4 text-sm transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>

            <div>
              <h3 className={`font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                🎯 Objective
              </h3>
              <p>Click cells to increment values and trigger cascading ripples across the grid.</p>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                📊 Cell States
              </h3>
              <ul className="space-y-1 ml-4">
                <li>• <span className="font-mono bg-gray-200 text-black px-1 rounded">Even</span> - Gray background</li>
                <li>• <span className="font-mono bg-indigo-900 text-white px-1 rounded">Odd</span> - Blue background</li>
                <li>• <span className="font-mono bg-red-600 text-white px-1 rounded">≥15</span> - Locked (red)</li>
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                ⚡ Ripple Rules
              </h3>
              <ul className="space-y-2 ml-4">
                <li>
                  <strong>Divisible by 3:</strong>
                  <br />
                  Right neighbor <span className="text-red-500">-1</span>
                </li>
                <li>
                  <strong>Divisible by 5:</strong>
                  <br />
                  Below neighbor <span className="text-green-500">+2</span>
                </li>
                <li>
                  <strong>Value 15:</strong>
                  <br />
                  Both rules apply + cell locks
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                🔄 Cascading
              </h3>
              <p>Ripples can trigger additional ripples, creating chain reactions across the grid!</p>
            </div>

            <div className={`pt-4 border-t transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <p className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                💡 Locked cells cannot be modified
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
