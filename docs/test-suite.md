# Manual Test Cases - The Recursive Grid

## Test Suite Overview
Validates: Ripple behavior, locked state, boundary safety, immutability, and 0-based initialization.

**Notation**:
- **Setup State**: `[[0,0,0], [0,0,0], [0,0,0]]` (Standard Game Start)
- Can use custom setup for specific scenarios (e.g., `[15, 0, 0]`)
- Click notation: `Click(row, col)`
- ✅ = Expected pass | ❌ = Should fail/prevent

---

## 1. Initial State Validation

### Test 1.0: Game Start
**Initial State**: Standard Game Start (All 0s)
**Validation**:
- All 9 cells display `0`.
- All cells have `#e0e0e0` background (Even).
- Move count is `0`.
**Expected**: ✅ Correct 0-based initialization.

---

## 2. Ripple Behavior - Divisible by 3 Rule

### Test 2.1: Basic Divisible by 3 (Decrement Right)

**Scenario Setup**:
```
[2, 0, 0]  (Custom Setup or after 2 clicks)
[0, 0, 0]
[0, 0, 0]
```

**Action**: `Click(0, 0)` - Click cell [0,0] to reach 3

**Outcome**:
```
Input:  [2, 0, 0]  →  Output: [3, -1, 0]
        [0, 0, 0]            [0, 0, 0]
        [0, 0, 0]            [0, 0, 0]
```
- Cell [0,0]: 2 → 3 (divisible by 3)
- Cell [0,1]: 0 → -1 (right neighbor decremented)

**Expected**: ✅ Right cell decrements to negative value

---

## 3. Ripple Behavior - Divisible by 5 Rule

### Test 3.1: Basic Divisible by 5 (Increment Below by 2)

**Scenario Setup**:
```
[4, 0, 0]
[0, 0, 0]
[0, 0, 0]
```

**Action**: `Click(0, 0)` - Click cell [0,0] to reach 5

**Outcome**:
```
Input:  [4, 0, 0]  →  Output: [5, 0, 0]
        [0, 0, 0]            [2, 0, 0]
        [0, 0, 0]            [0, 0, 0]
```
- Cell [0,0]: 4 → 5 (divisible by 5)
- Cell [1,0]: 0 → 2 (bottom neighbor incremented by 2)

**Expected**: ✅ Bottom cell increments to 2

---

## 4. Combined Rules (Divisible by 15)

### Test 4.1: Divisible by 15 (Both Rules Trigger)

**Scenario Setup**:
```
[14, 2, 0]
[ 0, 0, 0]
[ 0, 0, 0]
```

**Action**: `Click(0, 0)` - Click to reach 15

**Outcome**:
```
Input:  [14, 2, 0]  →  Output: [15, 1, 0]
        [ 0, 0, 0]            [ 2, 0, 0]
        [ 0, 0, 0]            [ 0, 0, 0]
```
- Cell [0,0]: 14 → 15 (divisible by 3 AND 5)
- Cell [0,1]: 2 → 1 (Right decremented)
- Cell [1,0]: 0 → 2 (Below incremented)
- Cell [0,0]: Now locked (value >= 15)

**Expected**: ✅ Both ripple rules apply, cell becomes locked

---

## 5. Locked State Enforcement

### Test 5.1: Locked Cell Immunity

**Scenario Setup**:
```
[15, 0, 0]
[ 0, 0, 0]
[ 0, 0, 0]
```

**Action**: `Click(0, 0)`

**Outcome**: Grid Unchanged.
**Expected**: ✅ Logic returns original grid reference.

---

## Architecture Decision Record

### Why `number[][]`?
We use a simple 2D array of primitives for the grid state. This minimizes memory overhead and allows for efficient O(1) access. JavaScript arrays are reference types, so deep cloning (via `map(r => [...r])`) ensures immutability without expensive libraries.

### Why Derived Locked State?
Instead of storing `{ value: 15, isLocked: true }` objects, we derive `isLocked` from `value >= 15`. This prevents state desynchronization (e.g., value 16 but `isLocked: false`) and keeps the state structure minimal.

### Why Map-Spread Cloning?
`JSON.parse(JSON.stringify())` is slow. `structuredClone` is newer but overkill for simple numbers. `grid.map(row => [...row])` is the most performant way to deep-copy a 2D array in modern JS while preserving immutability principles.
