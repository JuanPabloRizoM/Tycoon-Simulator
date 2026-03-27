// ============================================================
// Core: Shared Utility Functions
// Pure functions — no Phaser dependency
// ============================================================

/**
 * Random number in range [min, max)
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Weighted random selection from parallel arrays
 * @param {Array} items - Items to choose from
 * @param {Array<number>} weights - Corresponding weights
 * @returns {*} Selected item
 */
export function weightedRandom(items, weights) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
