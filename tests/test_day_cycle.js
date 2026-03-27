// ============================================================
// Test: DayCycle Module
// Verifies day flow logic works correctly
// Run: node tests/test_day_cycle.js
// ============================================================

import { advanceDay, checkInitialEvents, processPendingDeal, processObjectiveRewards } from '../game/systems/DayCycle.js';
import { STATE_KEYS, STATE_DEFAULTS } from '../game/core/GameState.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

// Mock registry
function createMockRegistry(overrides = {}) {
    const store = {};
    for (const [key, val] of Object.entries(STATE_DEFAULTS)) {
        store[key] = typeof val === 'object' ? JSON.parse(JSON.stringify(val)) : val;
    }
    Object.assign(store, overrides);
    return {
        get(key) { return store[key]; },
        set(key, val) { store[key] = val; },
        _store: store
    };
}

// Mock economy system
function createMockEconomySystem() {
    let dayCount = 0;
    return {
        advanceDay() { dayCount++; return { day: dayCount }; },
        getDayCount() { return dayCount; }
    };
}

// Mock market events
function createMockMarketEvents() {
    return {
        advanceDay(day) { return { newEvent: day === 2 ? { name: 'Test Event', icon: '⚡', description: 'A test event' } : null }; },
        getActiveModifiers() { return { patienceMod: 0, flexMod: 0 }; }
    };
}

// Mock objective manager
function createMockObjectiveManager() {
    const recorded = [];
    const pendingCompletions = [];
    return {
        recordEvent(type, data) { recorded.push({ type, data }); },
        checkObjectives() { return pendingCompletions.splice(0); },
        getRecorded() { return recorded; },
        addPendingCompletion(obj) { pendingCompletions.push(obj); }
    };
}

console.log('🧪 DayCycle Tests\n');

// --- Test 1: advanceDay ---
console.log('📋 Test 1: Advance Day');
const reg1 = createMockRegistry();
const econ1 = createMockEconomySystem();
const mkt1 = createMockMarketEvents();

assert(reg1.get(STATE_KEYS.CURRENT_DAY) === 1, `Starts at day 1`);

const result1 = advanceDay(reg1, econ1, mkt1);
assert(result1.day === 2, `Day advanced to 2: ${result1.day}`);
assert(reg1.get(STATE_KEYS.CURRENT_DAY) === 2, `Registry updated to day 2`);
assert(result1.eventResult.newEvent !== null, `Event triggered on day 2`);
assert(result1.eventResult.newEvent.name === 'Test Event', `Correct event name`);
assert(reg1.get(STATE_KEYS.EVENT_MODIFIERS) !== null, 'Event modifiers stored');

const result2 = advanceDay(reg1, econ1, mkt1);
assert(result2.day === 3, `Day advanced to 3: ${result2.day}`);
assert(result2.eventResult.newEvent === null, `No event on day 3`);

// --- Test 2: checkInitialEvents ---
console.log('\n📋 Test 2: Check Initial Events');
const reg2 = createMockRegistry();
const mkt2 = createMockMarketEvents();

// Day 1 → no event (mock returns null for day !== 2)
const initResult = checkInitialEvents(reg2, mkt2);
assert(initResult.newEvent === null, `No event on day 1`);

// --- Test 3: processPendingDeal ---
console.log('\n📋 Test 3: Process Pending Deal');
const reg3 = createMockRegistry();
const obj3 = createMockObjectiveManager();

// No pending deal
const noDeal = processPendingDeal(reg3, obj3);
assert(noDeal.hasDeal === false, 'No pending deal');

// With pending deal
reg3.set(STATE_KEYS.LAST_DEAL_RESULT, {
    npcType: 'turista',
    profit: 150,
    finalEmotion: 'interesado',
    isPlayerBuying: false
});

const hasDeal = processPendingDeal(reg3, obj3);
assert(hasDeal.hasDeal === true, 'Has pending deal');
assert(hasDeal.dealResult.profit === 150, `Deal profit: ${hasDeal.dealResult.profit}`);
assert(reg3.get(STATE_KEYS.LAST_DEAL_RESULT) === null, 'Deal result consumed');
assert(obj3.getRecorded().length === 1, 'Event recorded');
assert(obj3.getRecorded()[0].type === 'deal', 'Recorded as deal type');

// --- Test 4: processObjectiveRewards ---
console.log('\n📋 Test 4: Objective Rewards');
const reg4 = createMockRegistry();
const obj4 = createMockObjectiveManager();

// No completions
const noComplete = processObjectiveRewards(reg4, obj4);
assert(noComplete.length === 0, 'No completions');

// Add pending completions
obj4.addPendingCompletion({
    name: 'Test Objective',
    reward: { money: 500, reputation: 10 }
});

const initialMoney = reg4.get(STATE_KEYS.PLAYER_MONEY);
const initialRep = reg4.get(STATE_KEYS.PLAYER_REPUTATION);

const completed = processObjectiveRewards(reg4, obj4);
assert(completed.length === 1, 'One completion');
assert(reg4.get(STATE_KEYS.PLAYER_MONEY) === initialMoney + 500, `Money rewarded: ${reg4.get(STATE_KEYS.PLAYER_MONEY)}`);
assert(reg4.get(STATE_KEYS.PLAYER_REPUTATION) === initialRep + 10, `Reputation rewarded: ${reg4.get(STATE_KEYS.PLAYER_REPUTATION)}`);

// --- Test 5: Multiple day advances ---
console.log('\n📋 Test 5: Multiple Days');
const reg5 = createMockRegistry();
const econ5 = createMockEconomySystem();
const mkt5 = createMockMarketEvents();

for (let i = 0; i < 10; i++) {
    advanceDay(reg5, econ5, mkt5);
}
assert(reg5.get(STATE_KEYS.CURRENT_DAY) === 11, `10 advances from day 1 → day 11: ${reg5.get(STATE_KEYS.CURRENT_DAY)}`);

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All DayCycle tests passed!');

process.exit(failed > 0 ? 1 : 0);
