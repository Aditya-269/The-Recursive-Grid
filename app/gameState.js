/**
 * Game State Architecture for 3x3 Grid Logic Game
 * 
 * Design Principles:
 * - Immutability: All state updates return new objects
 * - Minimal redundancy: Locked state is derived (value >= 15)
 * - Type safety: Uses 2D numeric array (number[][])
 * - Performance: O(1) cell access, efficient updates
 */

// ============================================================================
// STATE STRUCTURE
// ============================================================================

/**
 * Core game state - minimal and immutable
 * @typedef {Object} GameState
 * @property {number[][]} grid - 3x3 2D array of cell values
 * @property {number} moveCount - Total moves made (for game history/undo)
 * @property {boolean} isGameOver - Whether the game has ended
 */

/**
 * Cell metadata (derived from grid values)
 * @typedef {Object} CellInfo
 * @property {number} value - The numeric value
 * @property {boolean} isLocked - Derived: value >= 15
 * @property {boolean} isEven - Derived: value % 2 === 0
 * @property {boolean} isOdd - Derived: value % 2 !== 0
 */

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Creates initial game state with values 1-9
 * @returns {GameState}
 */
export function createInitialState() {
    return {
        grid: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ],
        moveCount: 0,
        isGameOver: false
    };
}

/**
 * Creates a custom initial state with specified values
 * @param {number[][]} grid - 3x3 array of initial values
 * @returns {GameState}
 */
export function createCustomState(grid) {
    if (!isValidGrid(grid)) {
        throw new Error('Invalid grid: must be 3x3 array of numbers');
    }

    return {
        grid: grid.map(row => [...row]), // Deep copy for immutability
        moveCount: 0,
        isGameOver: false
    };
}

// ============================================================================
// DERIVED STATE HELPERS
// ============================================================================

/**
 * Check if a cell is locked (value >= 15)
 * @param {number} value - Cell value
 * @returns {boolean}
 */
export function isLocked(value) {
    return value >= 15;
}

/**
 * Get complete cell information including derived properties
 * @param {number} value - Cell value
 * @returns {CellInfo}
 */
export function getCellInfo(value) {
    return {
        value,
        isLocked: isLocked(value),
        isEven: value % 2 === 0,
        isOdd: value % 2 !== 0
    };
}

/**
 * Get cell value at specific position
 * @param {GameState} state - Current game state
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @returns {number}
 */
export function getCellValue(state, row, col) {
    if (!isValidPosition(row, col)) {
        throw new Error(`Invalid position: (${row}, ${col})`);
    }
    return state.grid[row][col];
}

/**
 * Get cell info at specific position
 * @param {GameState} state - Current game state
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @returns {CellInfo}
 */
export function getCellInfoAt(state, row, col) {
    const value = getCellValue(state, row, col);
    return getCellInfo(value);
}

/**
 * Check if cell at position is locked
 * @param {GameState} state - Current game state
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @returns {boolean}
 */
export function isCellLocked(state, row, col) {
    return isLocked(getCellValue(state, row, col));
}

/**
 * Get all locked cells in the grid
 * @param {GameState} state - Current game state
 * @returns {Array<{row: number, col: number, value: number}>}
 */
export function getLockedCells(state) {
    const locked = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const value = state.grid[row][col];
            if (isLocked(value)) {
                locked.push({ row, col, value });
            }
        }
    }
    return locked;
}

// ============================================================================
// IMMUTABLE STATE UPDATES
// ============================================================================

/**
 * Update a single cell value (immutable)
 * @param {GameState} state - Current game state
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @param {number} newValue - New cell value
 * @returns {GameState} - New state object
 */
export function updateCell(state, row, col, newValue) {
    if (!isValidPosition(row, col)) {
        throw new Error(`Invalid position: (${row}, ${col})`);
    }

    if (isCellLocked(state, row, col)) {
        console.warn(`Cell at (${row}, ${col}) is locked and cannot be updated`);
        return state; // Return unchanged state
    }

    // Create new grid with updated value
    const newGrid = state.grid.map((r, rowIndex) =>
        rowIndex === row
            ? r.map((cell, colIndex) => (colIndex === col ? newValue : cell))
            : [...r] // Deep copy other rows
    );

    return {
        ...state,
        grid: newGrid,
        moveCount: state.moveCount + 1
    };
}

/**
 * Increment a cell value by a delta (immutable)
 * @param {GameState} state - Current game state
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @param {number} delta - Amount to increment (can be negative)
 * @returns {GameState} - New state object
 */
export function incrementCell(state, row, col, delta = 1) {
    const currentValue = getCellValue(state, row, col);
    return updateCell(state, row, col, currentValue + delta);
}

/**
 * Reset the game to initial state
 * @returns {GameState}
 */
export function resetGame() {
    return createInitialState();
}

/**
 * Mark game as over (immutable)
 * @param {GameState} state - Current game state
 * @returns {GameState}
 */
export function setGameOver(state) {
    return {
        ...state,
        isGameOver: true
    };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate if position is within grid bounds
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean}
 */
export function isValidPosition(row, col) {
    return (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 &&
        row < 3 &&
        col >= 0 &&
        col < 3
    );
}

/**
 * Validate if grid structure is correct
 * @param {any} grid - Grid to validate
 * @returns {boolean}
 */
export function isValidGrid(grid) {
    if (!Array.isArray(grid) || grid.length !== 3) {
        return false;
    }

    return grid.every(
        row =>
            Array.isArray(row) &&
            row.length === 3 &&
            row.every(cell => typeof cell === 'number' && !isNaN(cell))
    );
}

/**
 * Deep clone game state for safety
 * @param {GameState} state - State to clone
 * @returns {GameState}
 */
export function cloneState(state) {
    return {
        ...state,
        grid: state.grid.map(row => [...row])
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert grid to flat array (for easier iteration)
 * @param {GameState} state - Current game state
 * @returns {number[]}
 */
export function flattenGrid(state) {
    return state.grid.flat();
}

/**
 * Get grid statistics
 * @param {GameState} state - Current game state
 * @returns {Object}
 */
export function getGridStats(state) {
    const values = flattenGrid(state);
    const lockedCells = getLockedCells(state);

    return {
        totalCells: 9,
        lockedCount: lockedCells.length,
        unlockedCount: 9 - lockedCells.length,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        sum: values.reduce((acc, val) => acc + val, 0),
        average: values.reduce((acc, val) => acc + val, 0) / 9
    };
}

/**
 * Print grid to console (for debugging)
 * @param {GameState} state - Current game state
 */
export function printGrid(state) {
    console.log('Grid State:');
    state.grid.forEach((row, i) => {
        console.log(
            row.map(val => (isLocked(val) ? `[${val}]` : ` ${val} `)).join(' ')
        );
    });
    console.log(`Moves: ${state.moveCount}, Game Over: ${state.isGameOver}`);
}
