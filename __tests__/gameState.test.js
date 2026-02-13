import { updateGrid, isLocked, isValidPosition, createInitialState } from '../app/gameState';

describe('updateGrid', () => {
    describe('Initialization', () => {
        it('should initialize with a 3x3 grid of zeros', () => {
            const state = createInitialState();
            expect(state.grid).toEqual([
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]);
        });
    });

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
            // Setup: [2, 0, 0] -> Click(0,0) -> [3, -1, 0]
            const grid = [[2, 0, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(-1);
        });

        it('should increment below neighbor by 2 when divisible by 5', () => {
            // Setup: [4, 0, 0] -> Click(0,0) -> [5, 0, 0] -> Ripple Below +2 -> [5, 2, 0]
            // Wait, ripple is 5 -> below + 2.
            const grid = [[4, 0, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(5);
            expect(result[1][0]).toBe(2);
        });

        it('should apply both rules for 15 (lock + ripple)', () => {
            // Setup: [14, 2, 0], [0, 0, 0]...
            // Click(0,0) -> 15.
            // Div 3: Right (2) -> 1
            // Div 5: Below (0) -> 2
            const grid = [[14, 2, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(15);
            expect(result[0][1]).toBe(1);
            expect(result[1][0]).toBe(2);
            expect(isLocked(result[0][0])).toBe(true);
        });

        it('should NOT ripple if value becomes 0 (Safety Guard)', () => {
            // Setup: Cell at (0,0) is -1. Click -> 0.
            // 0 % 3 === 0, but should NOT degrade neighbor.
            const grid = [[-1, 5, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(0);
            expect(result[0][1]).toBe(5); // Neighbor unchanged
        });
    });

    describe('Scenario: 0 to 15 (Cumulative)', () => {
        it('should correctly calculate ripples from start to lock', () => {
            let grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

            // Click (0,0) 15 times
            for (let i = 0; i < 15; i++) {
                grid = updateGrid(grid, 0, 0);
            }

            // Analysis:
            // (0,0) goes 0 -> 15.
            // Ripples at:
            // 3: Right -1 (Total -1)
            // 5: Below +2 (Total +2)
            // 6: Right -1 (Total -2)
            // 9: Right -1 (Total -3)
            // 10: Below +2 (Total +4)
            // 12: Right -1 (Total -4)
            // 15: Right -1 (Total -5), Below +2 (Total +6)

            expect(grid[0][0]).toBe(15);
            expect(grid[0][1]).toBe(-5);
            expect(grid[1][0]).toBe(6);
        });
    });

    describe('Locked Logic', () => {
        it('should not modify locked cells', () => {
            const grid = [[15, 0, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);
            expect(result).toBe(grid); // Optimization: Same Ref
        });

        it('should not ripple INTO locked cells', () => {
            // [2, 15, 0] -> Click(0,0) -> 3. Ripple right? 
            // Right is 15 (locked). Should NOT decrement.
            const grid = [[2, 15, 0], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 0);

            expect(result[0][0]).toBe(3);
            expect(result[0][1]).toBe(15); // Unchanged
        });
    });

    describe('Boundaries', () => {
        it('should handle corners without crashing', () => {
            // Top-Right: Click(0,2) -> 3. Right ripple? No (out of bounds).
            const grid = [[0, 0, 2], [0, 0, 0], [0, 0, 0]];
            const result = updateGrid(grid, 0, 2);
            expect(result[0][2]).toBe(3);
        });
    });
});
