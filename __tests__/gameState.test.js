import {
    updateGrid,
    isLocked,
    isValidPosition,
    createInitialState,
    createCustomState,
    getCellInfo,
    getGridStats,
    resetGame,
    setGameOver,
    isValidGrid,
    flattenGrid,
    getLockedCells
} from '../app/gameState';

describe('Game State Logic', () => {

    // ==========================================
    // 1. Initialization & State Creation (3 Tests)
    // ==========================================
    describe('Initialization', () => {
        it('should initialize with a 3x3 grid of zeros', () => {
            const state = createInitialState();
            expect(state.grid).toEqual([
                [0, 0, 0], [0, 0, 0], [0, 0, 0]
            ]);
        });

        it('should create custom state with valid grid', () => {
            const customGrid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const state = createCustomState(customGrid);
            expect(state.grid).toEqual(customGrid);
            expect(state.grid).not.toBe(customGrid); // Verify deep copy
        });

        it('should throw error for invalid grid in createCustomState', () => {
            const invalidGrid = [[1, 2], [3, 4]]; // 2x2
            expect(() => createCustomState(invalidGrid)).toThrow();
        });
    });

    // ==========================================
    // 2. Core Game Logic (updateGrid) (17 Tests)
    // ==========================================
    describe('updateGrid', () => {
        describe('Immutability', () => {
            it('should not mutate the original grid', () => {
                const original = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                const snapshot = JSON.parse(JSON.stringify(original));
                updateGrid(original, 0, 0);
                expect(original).toEqual(snapshot);
            });

            it('should return a new grid reference', () => {
                const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result).not.toBe(grid);
            });

            it('should deep copy all rows', () => {
                const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0]).not.toBe(grid[0]);
                expect(result[1]).not.toBe(grid[1]);
                expect(result[2]).not.toBe(grid[2]);
            });
        });

        describe('Ripple Rules', () => {
            it('should decrement right neighbor when divisible by 3', () => {
                const grid = [[2, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(3);
                expect(result[0][1]).toBe(-1);
            });

            it('should increment below neighbor by 2 when divisible by 5', () => {
                const grid = [[4, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(5);
                expect(result[1][0]).toBe(2);
            });

            it('should apply both rules for 15 (lock + ripple)', () => {
                const grid = [[14, 2, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(15);
                expect(result[0][1]).toBe(1);
                expect(result[1][0]).toBe(2);
                expect(isLocked(result[0][0])).toBe(true);
            });

            it('should NOT ripple if value becomes 0 (Safety Guard)', () => {
                const grid = [[-1, 5, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(0);
                expect(result[0][1]).toBe(5);
            });

            it('should ignore ripple if Right neighbor is out of bounds', () => {
                // Click (0,2) -> 3. Right is out of bounds.
                const grid = [[0, 0, 2], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 2);
                expect(result[0][2]).toBe(3);
                // No crash means pass
            });

            it('should ignore ripple if Below neighbor is out of bounds', () => {
                // Click (2,0) -> 5. Below is out of bounds.
                const grid = [[0, 0, 0], [0, 0, 0], [4, 0, 0]];
                const result = updateGrid(grid, 2, 0);
                expect(result[2][0]).toBe(5);
                // No crash means pass
            });

            it('should NOT ripple into a Locked Right neighbor', () => {
                const grid = [[2, 15, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(3);
                expect(result[0][1]).toBe(15); // Unchanged
            });

            it('should NOT ripple into a Locked Below neighbor', () => {
                const grid = [[4, 0, 0], [15, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result[0][0]).toBe(5);
                expect(result[1][0]).toBe(15); // Unchanged
            });
        });

        describe('Scenario: 0 to 15 (Cumulative)', () => {
            it('should correctly calculate ripples from start to lock', () => {
                let grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                for (let i = 0; i < 15; i++) {
                    grid = updateGrid(grid, 0, 0);
                }
                expect(grid[0][0]).toBe(15);
                expect(grid[0][1]).toBe(-5);
                expect(grid[1][0]).toBe(6);
            });
        });

        describe('Locked Logic', () => {
            it('should not modify locked cells', () => {
                const grid = [[15, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 0);
                expect(result).toBe(grid);
            });
        });

        describe('Edge Cases & Validation', () => {
            it('should return original grid for invalid position', () => {
                const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, -1, 0);
                expect(result).toBe(grid);
            });

            it('should handle corners without crashing', () => {
                const grid = [[0, 0, 2], [0, 0, 0], [0, 0, 0]];
                const result = updateGrid(grid, 0, 2);
                expect(result[0][2]).toBe(3);
            });
        });
    });

    // ==========================================
    // 3. Helper Functions (9 Tests)
    // ==========================================
    describe('isLocked', () => {
        it('should return false for value < 15', () => {
            expect(isLocked(14)).toBe(false);
        });

        it('should return true for value === 15', () => {
            expect(isLocked(15)).toBe(true);
        });

        it('should return true for value > 15', () => {
            expect(isLocked(100)).toBe(true);
        });
    });

    describe('isValidPosition', () => {
        it('should return true for valid coordinates', () => {
            expect(isValidPosition(0, 0)).toBe(true);
            expect(isValidPosition(2, 2)).toBe(true);
        });

        it('should return false for out of bounds rows', () => {
            expect(isValidPosition(-1, 0)).toBe(false);
            expect(isValidPosition(3, 0)).toBe(false);
        });

        it('should return false for out of bounds columns', () => {
            expect(isValidPosition(0, -1)).toBe(false);
            expect(isValidPosition(0, 3)).toBe(false);
        });

        it('should return false for non-integer inputs', () => {
            expect(isValidPosition(1.5, 0)).toBe(false);
            expect(isValidPosition('0', 0)).toBe(false);
        });
    });

    describe('getCellInfo', () => {
        it('should return correct derived properties', () => {
            const info = getCellInfo(15);
            expect(info.value).toBe(15);
            expect(info.isLocked).toBe(true);
            expect(info.isOdd).toBe(true);
            expect(info.isEven).toBe(false);
        });
    });

    describe('getLockedCells', () => {
        it('should return all locked cells', () => {
            const grid = [[15, 0, 0], [0, 16, 0], [0, 0, 5]];
            const state = { grid };
            const locked = getLockedCells(state);
            expect(locked).toHaveLength(2);
            expect(locked).toContainEqual({ row: 0, col: 0, value: 15 });
            expect(locked).toContainEqual({ row: 1, col: 1, value: 16 });
        });
    });

    // ==========================================
    // 4. Grid Utilities (6 Tests)
    // ==========================================
    describe('Grid Utilities', () => {
        it('resetGame should return initial state', () => {
            const state = resetGame();
            expect(state.grid).toEqual([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
        });

        it('setGameOver should set isGameOver to true', () => {
            const state = createInitialState();
            const newState = setGameOver(state);
            expect(newState.isGameOver).toBe(true);
            expect(newState).not.toBe(state); // Immutability
        });

        it('isValidGrid should return true for valid 3x3 grid', () => {
            const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            expect(isValidGrid(grid)).toBe(true);
        });

        it('isValidGrid should reject non-array', () => {
            expect(isValidGrid(null)).toBe(false);
        });

        it('isValidGrid should reject wrong dimensions or types', () => {
            expect(isValidGrid([[0, 0], [0, 0]])).toBe(false); // 2x2
            expect(isValidGrid([[0, 0, 0], [0, 'x', 0], [0, 0, 0]])).toBe(false); // Non-number
        });

        it('flattenGrid should correctly flatten 3x3 array', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            expect(flattenGrid({ grid })).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it('getGridStats should calculate correct statistics', () => {
            const grid = [[15, 0, 0], [0, 0, 0], [0, 0, 3]];
            const state = { grid };
            const stats = getGridStats(state);

            expect(stats.totalCells).toBe(9);
            expect(stats.lockedCount).toBe(1); // 15 is locked
            expect(stats.unlockedCount).toBe(8);
            expect(stats.maxValue).toBe(15);
            expect(stats.minValue).toBe(0);
            expect(stats.sum).toBe(18);
        });
    });

    // ==========================================
    // 6. Cascading Ripple Tests (7 Tests)
    // ==========================================
    describe('Cascading Ripples', () => {
        it('should trigger cascading ripples when a neighbor changes to a divisible value', () => {
            // Setup: (0,0) is 2, (0,1) is 4.
            // Click (0,0) -> becomes 3.
            // 3 triggers ripple -> (0,1) decrements to 3.
            // (0,1) is now 3. It SHOULD trigger its own ripple -> (0,2) decrements to -1.

            const grid = [
                [2, 4, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];

            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3); // Original click
            expect(result[0][1]).toBe(3); // First ripple (4 -> 3)
            expect(result[0][2]).toBe(-1); // Second ripple (0 -> -1) - Cascading works!
        });

        it('should verify 6 triggers ripple to right neighbor', () => {
            const testGrid = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 5, 2]
            ];

            const result = updateGrid(testGrid, 2, 1);

            expect(result[2][1]).toBe(6); // Clicked cell becomes 6
            expect(result[2][2]).toBe(1); // Right neighbor: 2 - 1 = 1
        });

        it('should trace clicking (1,1) from 0 to 15 with full cascading', () => {
            let grid = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];

            // Click 15 times to reach 15
            for (let i = 0; i < 15; i++) {
                grid = updateGrid(grid, 1, 1);
            }

            // Verify final state matches expected cascading behavior
            expect(grid[1][1]).toBe(15);
            expect(grid[1][2]).toBe(-5); // Accumulated ripples from divisible by 3
            expect(grid[2][1]).toBe(6);  // Accumulated ripples from divisible by 5
            expect(grid[2][2]).toBe(1);  // Cascading ripple from 6 (divisible by 3)
        });

        it('should handle single click from 14 to 15', () => {
            const grid = [
                [0, 0, 0],
                [0, 14, 0],
                [0, 0, 0]
            ];

            const result = updateGrid(grid, 1, 1);

            expect(result[1][1]).toBe(15);
            expect(result[1][2]).toBe(-1); // 15 % 3 == 0, decrement right
            expect(result[2][1]).toBe(2);  // 15 % 5 == 0, increment below by 2
            expect(result[2][2]).toBe(0);  // No cascading from single click 14->15
        });

        it('should not modify locked cells (15) when clicked', () => {
            const grid = [
                [0, 0, 0],
                [0, 15, 0],
                [0, 0, 0]
            ];

            const result = updateGrid(grid, 1, 1);

            // Should return same reference (no-op)
            expect(grid).toBe(result);
        });

        it('should trace multiple clicks on (2,1) with ripple effects', () => {
            let grid = [
                [0, 0, 0],
                [0, 15, -5],
                [0, 0, 0]
            ];

            // Click 6 times to reach 6
            for (let i = 0; i < 6; i++) {
                grid = updateGrid(grid, 2, 1);
            }

            expect(grid[2][1]).toBe(6);
            expect(grid[2][2]).toBe(-2); // Accumulated ripples from 3 and 6
        });

        it('should verify 15 triggers ripples to both right and below neighbors', () => {
            const grid = [
                [0, 0, 0],
                [0, 14, 0],
                [0, 0, 0]
            ];

            const result = updateGrid(grid, 1, 1);

            expect(result[1][1]).toBe(15);
            expect(result[1][2]).toBe(-1); // Right neighbor decremented
            expect(result[2][1]).toBe(2);  // Below neighbor incremented by 2
        });
    });
});
