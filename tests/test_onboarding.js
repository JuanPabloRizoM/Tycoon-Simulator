// ============================================================
// Test: Onboarding & Tutorial States
// Run: node tests/test_onboarding.js
// ============================================================

import assert from 'assert';
import { initializeGameState, STATE_KEYS, STATE_DEFAULTS } from '../game/core/GameState.js';

console.log('🧪 Iniciando tests de Onboarding y GameState...');

let passCount = 0;
let failCount = 0;

function runTest(name, testFn) {
    try {
        testFn();
        console.log(`✅ ${name}`);
        passCount++;
    } catch (err) {
        console.error(`❌ ${name}`);
        console.error(`   ${err.message}`);
        failCount++;
    }
}

// Mock Phaser Registry
class MockRegistry {
    constructor() { this.data = new Map(); }
    set(key, val) { this.data.set(key, val); }
    get(key) { return this.data.get(key); }
}

// Polyfill localStorage for Node
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, val) { this.store[key] = String(val); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

runTest('initializeGameState sets tutorial flag to false by default', () => {
    localStorage.clear();
    const registry = new MockRegistry();
    initializeGameState(registry);
    assert.strictEqual(registry.get(STATE_KEYS.HAS_SEEN_TUTORIAL), false);
});

runTest('initializeGameState respects localStorage if tutorial was seen', () => {
    localStorage.setItem('tianguis_has_seen_tutorial', 'true');
    const registry = new MockRegistry();
    initializeGameState(registry);
    assert.strictEqual(registry.get(STATE_KEYS.HAS_SEEN_TUTORIAL), true);
});

runTest('initializeGameState gracefully handles lack of localStorage', () => {
    const oldLs = global.localStorage;
    global.localStorage = null; // simulate restricted env or missing object
    
    // Some JS engines throw error when accessing global.localStorage if it's strictly read-only or proxy,
    // intercepting via a try-catch in initializeGameState should be safe.
    // For this mock, we just delete the impl.
    delete global.localStorage;

    const registry = new MockRegistry();
    initializeGameState(registry);
    assert.strictEqual(registry.get(STATE_KEYS.HAS_SEEN_TUTORIAL), false);
    
    // Restore
    global.localStorage = oldLs;
});

console.log(`\nResultados: ${passCount} pasaron, ${failCount} fallaron.`);
if (failCount > 0) process.exit(1);
