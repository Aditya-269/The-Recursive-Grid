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
 * Creates initial game state with values 0
 * @returns {GameState}
 */
export function createInitialState() {
    return {
        grid: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
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
        grid: grid.map(row => [...row]) // Deep copy for immutability
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

// Unused update helpers removed for strict minimalism
// (updateCell, incrementCell)

// ============================================================================
// GAME LOGIC - PURE UPDATE FUNCTION
// ============================================================================

/**
 * Pure function to update grid with game logic rules
 * 
 * Rules:
 * 1. Checks validation first
 * 2. Return original ref if invalid or locked
 * 3. Clone using map/spread
 * 4. Apply increment
 * 5. Apply ripple rules
 * 6. Return new immutable grid
 * 
 * @param {number[][]} grid - Current 3x3 grid
 * @param {number} row - Row index (0-2)
 * @param {number} col - Column index (0-2)
 * @returns {number[][]} - New immutable grid
 */
export function updateGrid(grid, row, col) {
    // 1. Validate position
    // Guard clause: Fail fast if input is invalid.
    if (!isValidPosition(row, col)) {
        return grid; // Return original reference (no-op)
    }

    // 2. Check locked state on ORIGINAL grid
    // Optimization: Avoid expensive cloning if the move is illegal.
    if (isLocked(grid[row][col])) {
        return grid; // Return original reference (no-op)
    }

    // 3. Clone grid (map + spread)
    // Immutability: Create a shallow copy of the 2D array.
    // This ensures React detects state changes and prevents side effects.
    const newGrid = grid.map(r => [...r]);

    // 4. Increment clicked cell
    newGrid[row][col] += 1;
    const newValue = newGrid[row][col];

    // 5. Apply Ripple Rules

    // Divisible by 3 -> Decrement RIGHT neighbor
    // Design Decision: Ripple applies only to the clicked cell's new value.
    // No cascading chain reactions (ripples do not trigger further ripples).
    if (newValue !== 0 && newValue % 3 === 0) {
        const rightCol = col + 1;
        if (isValidPosition(row, rightCol)) {
            // Check locked state on updated grid (ripple shouldn't affect locked)
            // Note: Locked state is derived from value >= 15.
            if (!isLocked(newGrid[row][rightCol])) {
                newGrid[row][rightCol] -= 1;
            }
        }
    }

    // Divisible by 5 -> Increment BELOW neighbor by 2
    // Independent check: A number can trigger both rules (e.g., 15).
    if (newValue !== 0 && newValue % 5 === 0) {
        const belowRow = row + 1;
        if (isValidPosition(belowRow, col)) {
            if (!isLocked(newGrid[belowRow][col])) {
                newGrid[belowRow][col] += 2;
            }
        }
    }

    return newGrid;
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
