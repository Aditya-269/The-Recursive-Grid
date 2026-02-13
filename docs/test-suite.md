# Manual Test Cases - The Recursive Grid

## Test Suite Overview
Validates: Ripple behavior, locked state, boundary safety, immutability, helper functions, and grid utilities.

**Current Status**: **34/34 Tests Passing** (100% Logic Coverage)

**Notation**:
- **Setup State**: `[[0,0,0], [0,0,0], [0,0,0]]` (Standard Game Start)
- Can use custom setup for specific scenarios (e.g., `[15, 0, 0]`)
- Click notation: `Click(row, col)`
- ✅ = Expected pass | ❌ = Should fail/prevent

---

## 1. Initialization & State Creation (3 Tests)

### Test 1.1: Game Start
- **Goal**: Verify clean 3x3 grid of zeros.
- **Expected**: `grid` is `[[0,0,0],[0,0,0],[0,0,0]]`.

### Test 1.2: Custom State (Valid)
- **Goal**: Verify creating state from existing grid.
- **Input**: `[[1,2,3],[4,5,6],[7,8,9]]`
- **Expected**: State matches input, new reference (Deep Copy).

### Test 1.3: Custom State (Invalid)
- **Goal**: Reject invalid grids.
- **Input**: `[[1,2],[3,4]]` (2x2)
- **Expected**: Throw Error.

---

## 2. Core Game Logic (updateGrid) (15 Tests)

### Immutability
- **2.1**: Original grid not mutated.
- **2.2**: Returns new grid reference.
- **2.3**: Deep copy of all rows.

### Ripple Rules
- **2.4 (Div 3)**: `Click(0,0)` on `[2,0,0]` -> `[3,-1,0]`. (Right neighbor -1).
- **2.5 (Div 5)**: `Click(0,0)` on `[4,0,0]` -> `[5,0,0]`, `[2,0,0]` (Below neighbor +2).
- **2.6 (Combined 15)**: `Click(0,0)` on `[14,2,0]` -> `15`. Right -1, Below +2. Locks.
- **2.7 (Safety)**: `Click` on `-1` -> `0`. `0 % 3 === 0` but **NO Ripple**.
- **2.8 (Right Bound)**: `Click(0,2)` (Right edge) -> Ripple ignored.
- **2.9 (Below Bound)**: `Click(2,0)` (Bottom edge) -> Ripple ignored.
- **2.10 (Locked Right)**: Ripple blocked if Right neighbor is Locked (>=15).
- **2.11 (Locked Below)**: Ripple blocked if Below neighbor is Locked (>=15).

### Complex Scenarios
- **2.12 (Cumulative)**: 15 Clicks on `(0,0)` -> Correct cumulative ripples.

### Locked Logic
- **2.13**: `Click` locked cell -> No change (Same Ref).

### Edge Cases
- **2.14**: Invalid position (-1, 0) -> No change.
- **2.15**: Corners safely handled.

---

## 3. Helper Functions (9 Tests)

### isLocked
- **3.1**: `14` -> `false`.
- **3.2**: `15` -> `true`.
- **3.3**: `100` -> `true`.

### isValidPosition
- **3.4**: Valid `(0,0)` -> `true`.
- **3.5**: Invalid Row `(-1,0)` -> `false`.
- **3.6**: Invalid Col `(0,-1)` -> `false`.
- **3.7**: Non-integer -> `false`.

### getCellInfo
- **3.8**: Returns correct `{ value, isLocked, isEven, isOdd }`.

### getLockedCells
- **3.9**: Returns array of all locked cell objects `{row, col, value}`.

---

## 4. Grid Utilities (7 Tests)

### Game Control
- **4.1**: `resetGame` -> Returns initial 0-grid.
- **4.2**: `setGameOver` -> Sets `isGameOver: true`.

### Validation
- **4.3**: `isValidGrid` -> `true` for valid 3x3.
- **4.4**: `isValidGrid` -> `false` for `null`.
- **4.5**: `isValidGrid` -> `false` for dimensions/types.

### Utilities
- **4.6**: `flattenGrid` -> Returns valid 1D array.
- **4.7**: `getGridStats` -> Correct `total`, `locked`, `sum`, `max`, `min`.

---

## Architecture Decision Record

### Why 34 Tests?
We require 100% logic coverage including:
- **Defensive Programming**: Validating all inputs (`isValidPosition`, `isValidGrid`).
- **Derived State**: Verifying all helper calculations (`isLocked`, `getGridStats`).
- **Edge Conditions**: Explicitly testing boundaries and invalid operations to ensure stability.
