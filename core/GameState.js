// ============================================================
// Core: Centralized Game State Keys & Defaults
// Single source of truth for all registry keys
// No Phaser dependency — just constants and helpers
// ============================================================

/**
 * Registry key constants.
 * Use these instead of raw strings to avoid typos and enable refactoring.
 */
export const STATE_KEYS = {
    PLAYER_MONEY: 'playerMoney',
    PLAYER_LEVEL: 'playerLevel',
    PLAYER_REPUTATION: 'playerReputation',
    CURRENT_DAY: 'currentDay',
    INVENTORY: 'inventory',
    TOTAL_EARNINGS: 'totalEarnings',
    LAST_DEAL_RESULT: 'lastDealResult',
    EVENT_MODIFIERS: 'eventModifiers',

    // Upgrades
    UPG_CAPACITY: 'upgCapacity',
    UPG_VISUAL: 'upgVisual',
    UPG_TRUST: 'upgTrust',
    UPG_NETWORK: 'upgNetwork',
    HAS_SEEN_TUTORIAL: 'hasSeenTutorial',
};

/**
 * Default values for game initialization.
 */
export const STATE_DEFAULTS = {
    [STATE_KEYS.PLAYER_MONEY]: 500,
    [STATE_KEYS.PLAYER_LEVEL]: 1,
    [STATE_KEYS.PLAYER_REPUTATION]: 50,
    [STATE_KEYS.CURRENT_DAY]: 1,
    [STATE_KEYS.INVENTORY]: [],
    [STATE_KEYS.TOTAL_EARNINGS]: 0,
    [STATE_KEYS.LAST_DEAL_RESULT]: null,
    [STATE_KEYS.EVENT_MODIFIERS]: null,
    [STATE_KEYS.UPG_CAPACITY]: 1,
    [STATE_KEYS.UPG_VISUAL]: 1,
    [STATE_KEYS.UPG_TRUST]: 1,
    [STATE_KEYS.UPG_NETWORK]: 1,
    [STATE_KEYS.HAS_SEEN_TUTORIAL]: false,
};

/**
 * Initialize a Phaser registry with all default values.
 * @param {Phaser.Data.DataManager} registry - Phaser scene registry
 */
export function initializeGameState(registry) {
    for (const [key, value] of Object.entries(STATE_DEFAULTS)) {
        registry.set(key, value);
    }
    
    // Check localStorage for tutorial flag
    try {
        if (localStorage.getItem('tianguis_has_seen_tutorial') === 'true') {
            registry.set(STATE_KEYS.HAS_SEEN_TUTORIAL, true);
        }
    } catch (e) {
        // Ignore localstorage errors in restricted environments
    }
}

/**
 * Read a state value with a safe default fallback.
 * @param {Phaser.Data.DataManager} registry
 * @param {string} key - One of STATE_KEYS
 * @returns {*}
 */
export function getState(registry, key) {
    const val = registry.get(key);
    return val !== undefined ? val : STATE_DEFAULTS[key];
}
