import { updateGrid, isLocked, isValidPosition } from '../app/gameState';

describe('updateGrid', () => {
    describe('Immutability', () => {
        it('should not mutate the original grid', () => {
            const original = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const snapshot = JSON.parse(JSON.stringify(original));

            updateGrid(original, 0, 0);

            expect(original).toEqual(snapshot);
        });

        it('should return a new grid reference', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result).not.toBe(grid);
        });

        it('should deep copy all rows', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0]).not.toBe(grid[0]);
            expect(result[1]).not.toBe(grid[1]);
            expect(result[2]).not.toBe(grid[2]);
        });

        it('should return new reference even when grid unchanged (locked cell)', () => {
            const grid = [[15, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result).toEqual(grid);
            expect(result).not.toBe(grid);
        });
    });

    describe('Basic Increment', () => {
        it('should increment clicked cell by 1', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(2);
        });

        it('should only modify clicked cell when no rules trigger', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result).toEqual([[2, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });
    });

    describe('Divisible by 3 Rule', () => {
        it('should decrement right neighbor when divisible by 3', () => {
            const grid = [[2, 5, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(4);
        });

        it('should handle last column boundary (no right neighbor)', () => {
            const grid = [[1, 2, 2], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 2);

            expect(result[0][2]).toBe(3);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });

        it('should not decrement locked right neighbor', () => {
            const grid = [[2, 15, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(15);
        });

        it('should trigger at value 6 (divisible by 3)', () => {
            const grid = [[5, 10, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(6);
            expect(result[0][1]).toBe(9);
        });
    });

    describe('Divisible by 5 Rule', () => {
        it('should increment bottom neighbor by 2 when divisible by 5', () => {
            const grid = [[1, 4, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 1);

            expect(result[0][1]).toBe(5);
            expect(result[1][1]).toBe(7);
        });

        it('should handle last row boundary (no bottom neighbor)', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 4, 9]];
            const result = updateGrid(grid, 2, 1);

            expect(result[2][1]).toBe(5);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 5, 9]]);
        });

        it('should not increment locked bottom neighbor', () => {
            const grid = [[1, 4, 3], [4, 15, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 1);

            expect(result[0][1]).toBe(5);
            expect(result[1][1]).toBe(15);
        });

        it('should trigger at value 10 (divisible by 5)', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 9, 9]];
            const result = updateGrid(grid, 2, 1);

            expect(result[2][1]).toBe(10);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 10, 9]]);
        });
    });

    describe('Combined Rule (Divisible by 15)', () => {
        it('should apply both rules when divisible by 15', () => {
            const grid = [[14, 5, 3], [8, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(result[0][1]).toBe(4);  // Decremented by 1
            expect(result[1][0]).toBe(10); // Incremented by 2
        });

        it('should lock cell at 15 and apply ripples', () => {
            const grid = [[14, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(result[0][1]).toBe(1);
            expect(result[1][0]).toBe(6);
        });

        it('should handle 15 with both neighbors locked', () => {
            const grid = [[14, 15, 3], [15, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(result[0][1]).toBe(15); // Locked, unchanged
            expect(result[1][0]).toBe(15); // Locked, unchanged
        });
    });

    describe('Locked State Enforcement', () => {
        it('should prevent clicking locked cell (value 15)', () => {
            const grid = [[15, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result).toEqual(grid);
            expect(result[0][0]).toBe(15);
        });

        it('should prevent clicking locked cell (value > 15)', () => {
            const grid = [[20, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result).toEqual(grid);
            expect(result[0][0]).toBe(20);
        });

        it('should lock cell when reaching 15', () => {
            const grid = [[14, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(isLocked(result[0][0])).toBe(true);
        });
    });

    describe('Boundary Safety', () => {
        it('should handle top-right corner', () => {
            const grid = [[1, 2, 2], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 2);

            expect(result[0][2]).toBe(3);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });

        it('should handle bottom-left corner', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [4, 8, 9]];
            const result = updateGrid(grid, 2, 0);

            expect(result[2][0]).toBe(5);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [5, 8, 9]]);
        });

        it('should handle bottom-right corner (both boundaries)', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 14]];
            const result = updateGrid(grid, 2, 2);

            expect(result[2][2]).toBe(15);
            expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 15]]);
        });

        it('should handle invalid position (out of bounds)', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 3, 0);

            expect(result).toEqual(grid);
        });

        it('should handle negative position', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, -1, 0);

            expect(result).toEqual(grid);
        });
    });

    describe('No Cascading Ripples', () => {
        it('should not cascade when neighbor becomes divisible by 3', () => {
            const grid = [[2, 3, 6], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(2); // Decremented from 3 to 2
            expect(result[0][2]).toBe(6); // Should NOT be affected
        });

        it('should not cascade when neighbor becomes divisible by 5', () => {
            const grid = [[1, 4, 3], [4, 3, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 1);

            expect(result[0][1]).toBe(5);
            expect(result[1][1]).toBe(5); // Incremented from 3 to 5
            expect(result[2][1]).toBe(8); // Should NOT be affected
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative values from decrement', () => {
            const grid = [[2, 0, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(-1);
        });

        it('should handle large values', () => {
            const grid = [[10, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(11);
        });

        it('should handle value exactly at 14 (one before lock)', () => {
            const grid = [[14, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(isLocked(result[0][0])).toBe(true);
        });

        it('should handle multiple rules triggering in sequence', () => {
            const grid = [[2, 5, 3], [8, 5, 6], [7, 8, 9]];
            let result = updateGrid(grid, 0, 0); // 2 -> 3 (div by 3)

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(4);

            result = updateGrid(result, 0, 0); // 3 -> 4
            expect(result[0][0]).toBe(4);

            result = updateGrid(result, 0, 0); // 4 -> 5 (div by 5)
            expect(result[0][0]).toBe(5);
            expect(result[1][0]).toBe(10);
        });
    });

    describe('Reference Inequality', () => {
        it('should create new row arrays even for unchanged rows', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const result = updateGrid(grid, 0, 0);

            // Row 0 changed, should be new reference
            expect(result[0]).not.toBe(grid[0]);

            // Rows 1 and 2 unchanged in value, but still new references
            expect(result[1]).not.toBe(grid[1]);
            expect(result[2]).not.toBe(grid[2]);
        });

        it('should maintain deep immutability across multiple updates', () => {
            const grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const snapshot = JSON.parse(JSON.stringify(grid));

            const result1 = updateGrid(grid, 0, 0);
            const result2 = updateGrid(result1, 1, 1);
            const result3 = updateGrid(result2, 2, 2);

            // Original should never change
            expect(grid).toEqual(snapshot);

            // Each result should be independent
            expect(result1).not.toBe(result2);
            expect(result2).not.toBe(result3);
        });
    });
});
