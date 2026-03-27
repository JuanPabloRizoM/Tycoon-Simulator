// ============================================================
// Test: Edge Cases
// Covers: inventory full, sell non-existent, economy extremes,
//         out-of-range offers, and pending-deal consume-once behavior
// Run: node tests/test_edge_cases.js
// ============================================================

import { InventoryManager } from '../game/inventory/InventoryManager.js';
import { EconomySystem } from '../game/economy/EconomySystem.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';
import { NPCFactory } from '../game/npc/NPCFactory.js';
import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { processOffer, resolveDeal } from '../game/systems/NegotiationFlow.js';
import { processPendingDeal } from '../game/systems/DayCycle.js';
import { STATE_KEYS, STATE_DEFAULTS } from '../game/core/GameState.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

// Shared mock registry
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

function makeMockInventory() {
    return { addItem: () => {}, items: [] };
}
function makeMockEconomy() {
    return { recordTransaction: () => {} };
}
function makeMockObjectiveManager() {
    const recorded = [];
    return {
        recordEvent(type, data) { recorded.push({ type, data }); },
        getRecorded() { return recorded; }
    };
}

// ===========================================================
// INVENTORYMANAGER EDGE CASES
// ===========================================================
console.log('🧪 Edge Case Tests\n');
console.log('📋 InventoryManager Edge Cases');

// Level 1 capacity = 10 (from data/economy.js)
const inv = new InventoryManager(1);
const capacity = inv.getCapacity();
assert(typeof capacity === 'number' && capacity > 0, `Level 1 capacity is a positive number: ${capacity}`);

// Fill to capacity
let addResult;
for (let i = 0; i < capacity; i++) {
    const item = ObjectFactory.generateItem(null, 1);
    addResult = inv.addItem(item, 100);
}
assert(addResult.success === true, `Last item added successfully`);
assert(inv.isFull(), 'Inventory is full after capacity items');
assert(inv.getItemCount() === capacity, `Item count equals capacity: ${inv.getItemCount()}`);

// Adding one more beyond capacity
const overflowItem = ObjectFactory.generateItem(null, 1);
const overflowResult = inv.addItem(overflowItem, 100);
assert(overflowResult.success === false, `Overflow item rejected: success=${overflowResult.success}`);
assert(overflowResult.reason === 'inventory_full', `Correct reason: "${overflowResult.reason}"`);
assert(inv.getItemCount() === capacity, `Count did not increase: ${inv.getItemCount()}`);

// Sell non-existent item
const noSell = inv.sellItem('non_existent_id_xyz', 500);
assert(noSell.success === false, 'Selling non-existent item fails');
assert(noSell.reason === 'not_found', `Correct reason: "${noSell.reason}"`);

// Remove non-existent
const noRemove = inv.removeItem('bogus');
assert(noRemove.success === false, 'Removing non-existent item fails');

// Sell existing item (profitable)
const firstItemId = inv.items[0].inventoryId;
const sellResult = inv.sellItem(firstItemId, 999);
assert(sellResult.success === true, 'Selling existing item succeeds');
assert(sellResult.profit === 999 - 100, `Profit calculated correctly: ${sellResult.profit}`);
assert(inv.getItemCount() === capacity - 1, 'Count decreased after sell');

// Sell at loss
const secondItemId = inv.items[0].inventoryId;
const lossResult = inv.sellItem(secondItemId, 1);
assert(lossResult.success === true, 'Selling at loss succeeds');
assert(lossResult.profit < 0, `Profit is negative on loss: ${lossResult.profit}`);
assert(lossResult.message.includes('Perdiste'), `Loss message: "${lossResult.message}"`);

// Stats after sell
const stats = inv.getStats();
assert(stats.totalBuys === capacity, `Total buys tracked: ${stats.totalBuys}`);
assert(stats.totalSells === 2, `Total sells tracked: ${stats.totalSells}`);

// Level up increases capacity
const inv2 = new InventoryManager(1);
const cap1 = inv2.getCapacity();
inv2.setPlayerLevel(2);
const cap2 = inv2.getCapacity();
assert(cap2 >= cap1, `Level 2 capacity >= Level 1 (${cap1} → ${cap2})`);

// getItem by inventoryId and id
const inv3 = new InventoryManager(1);
const item3 = ObjectFactory.generateItem(null, 1);
inv3.addItem(item3, 50);
const found = inv3.getItem(inv3.items[0].inventoryId);
assert(found !== null, 'getItem finds by inventoryId');
const notFound = inv3.getItem('totally_bogus');
assert(notFound === null, 'getItem returns null for missing');

// ===========================================================
// ECONOMYSYSTEM EDGE CASES
// ===========================================================
console.log('\n📋 EconomySystem Edge Cases');

const econ = new EconomySystem();

// calculatePrice with unknown category
const unknownItem = { category: 'THIS_DOES_NOT_EXIST', baseValue: 100, rarityMultiplier: 1, condition: 1 };
const priceUnknown = econ.calculatePrice(unknownItem);
assert(priceUnknown === 100, `Unknown category falls back to baseValue: ${priceUnknown}`);

// calculatePrice >= 1 (guaranteed minimum)
const minItem = { category: 'ropa', baseValue: 1, rarityMultiplier: 0.001, condition: 0.001 };
const minPrice = econ.calculatePrice(minItem);
assert(minPrice >= 1, `Price always >= 1: ${minPrice}`);

// getDemandFactor unknown category
const df = econ.getDemandFactor('THIS_DOES_NOT_EXIST');
assert(df === 1.0, `Unknown category demand factor = 1.0: ${df}`);

// Use a real category key available in economy.js
const REAL_CAT = 'electronica';

// applyEventModifier on valid category — use large delta to ensure beyond rounding (0.01)
const econMod = new EconomySystem();
const prevDemand = econMod.categories[REAL_CAT].demand;
econMod.applyEventModifier(REAL_CAT, 1.0); // Big enough to change demand reliably
const newDemand = econMod.categories[REAL_CAT].demand;
assert(newDemand > prevDemand, `Demand increased after modifier: ${prevDemand.toFixed(2)} → ${newDemand.toFixed(2)}`);

// applyEventModifier clamps at 3.0
econMod.applyEventModifier(REAL_CAT, 100);
const clampedDemand = econMod.categories[REAL_CAT].demand;
assert(clampedDemand <= 3.0, `Demand clamped at max 3.0: ${clampedDemand.toFixed(2)}`);

// getDemandFactor after clamped demand
const factorAfterClamp = econMod.getDemandFactor(REAL_CAT);
assert(typeof factorAfterClamp === 'number' && !isNaN(factorAfterClamp), `getDemandFactor is valid number: ${factorAfterClamp}`);

// applyEventModifier on unknown has no effect (no crash)
try {
    econ.applyEventModifier('FAKE_CATEGORY', 1);
    assert(true, 'applyEventModifier on unknown category does not crash');
} catch (e) {
    assert(false, `applyEventModifier crashed on unknown: ${e.message}`);
}

// recordTransaction buy decreases supply
const econTx = new EconomySystem();
const supplyBefore = econTx.categories[REAL_CAT].supply;
const buyItem = { category: REAL_CAT, baseValue: 100, rarityMultiplier: 1, condition: 1 };
econTx.recordTransaction(buyItem, 'buy');
const supplyAfter = econTx.categories[REAL_CAT].supply;
assert(Math.abs(supplyAfter - (supplyBefore - 0.02)) < 0.001, `Supply decreased on buy: ${supplyBefore.toFixed(3)} → ${supplyAfter.toFixed(3)}`);

// recordTransaction sell increases supply
econTx.recordTransaction(buyItem, 'sell');
const supplyAfterSell = econTx.categories[REAL_CAT].supply;
assert(supplyAfterSell > supplyAfter, `Supply increased on sell`);

// recordTransaction unknown category does not crash
try {
    econTx.recordTransaction({ category: 'FAKE' }, 'buy');
    assert(true, 'recordTransaction unknown category no crash');
} catch (e) {
    assert(false, `recordTransaction crashed: ${e.message}`);
}

// advanceDay does not NaN
const econDay = new EconomySystem();
const snapshot = econDay.advanceDay();
for (const [key, val] of Object.entries(snapshot)) {
    assert(!isNaN(val.demand), `${key} demand is not NaN`);
    assert(!isNaN(val.supply), `${key} supply is not NaN`);
    assert(!isNaN(val.factor), `${key} factor is not NaN`);
}

// getTrend returns stable before 2 days (use a real category)
const trend = new EconomySystem();
assert(trend.getTrend(REAL_CAT) === 'stable', 'Trend is stable before 2 days');
trend.advanceDay();
assert(trend.getTrend(REAL_CAT) === 'stable', 'Trend is stable after 1 day');
trend.advanceDay();
const trendVal = trend.getTrend(REAL_CAT);
assert(['up', 'down', 'stable'].includes(trendVal), `Trend after 2 days is valid: "${trendVal}"`);

// getTrend on unknown category is stable
assert(trend.getTrend('UNKNOWN_CAT') === 'stable', 'Unknown category trend is stable');

// ===========================================================
// NEGOTIATIONFLOW EDGE CASES
// ===========================================================
console.log('\n📋 NegotiationFlow Edge Cases');

// Edge case: 0 money while player buying
const engine0 = new BargainEngine();
const npc0 = NPCFactory.generateNPC('turista', 1);
const item0 = ObjectFactory.generateItem(null, 1);
engine0.startNegotiation(npc0, item0, true);

const zeroMoneyResult = processOffer({
    engine: engine0,
    amount: 50,
    isPlayerBuying: true,
    playerMoney: 0,
    npcName: npc0.name
});
assert(zeroMoneyResult.type === 'validation_error', `$0 money triggers validation error: ${zeroMoneyResult.type}`);

// Edge case: exact match of player money (should pass)
const engineExact = new BargainEngine();
const npcExact = NPCFactory.generateNPC('revendedor', 1);
const itemExact = ObjectFactory.generateItem(null, 1);
engineExact.startNegotiation(npcExact, itemExact, true);

const exactResult = processOffer({
    engine: engineExact,
    amount: 100,
    isPlayerBuying: true,
    playerMoney: 100,
    npcName: npcExact.name
});
assert(exactResult.type !== 'validation_error', `Exact money (100) passes validation: ${exactResult.type}`);

// Edge case: out-of-range offer (extremely high)
const engineHigh = new BargainEngine();
const npcHigh = NPCFactory.generateNPC('coleccionista', 1);
const itemHigh = ObjectFactory.generateItem(null, 1);
const startHigh = engineHigh.startNegotiation(npcHigh, itemHigh, true);

const highResult = processOffer({
    engine: engineHigh,
    amount: startHigh.npcOffer * 50, // Way over what NPC wants
    isPlayerBuying: true,
    playerMoney: 999999,
    npcName: npcHigh.name
});
// NegotiationFlow validates and passes through — any valid BargainEngine result is OK
const VALID_RESULT_TYPES = ['accept', 'counter', 'reject', 'walk_away'];
assert(VALID_RESULT_TYPES.includes(highResult.type), `Very high offer returns valid result type (NPC-dependent): ${highResult.type}`);
// If the NPC accepted, the result has a finalPrice
if (highResult.type === 'accept') {
    assert(typeof highResult.finalPrice === 'number', `Accept result has finalPrice: ${highResult.finalPrice}`);
}

// Edge case: extremely low offer
const engineLow = new BargainEngine();
const npcLow = NPCFactory.generateNPC('cliente_normal', 1);
const itemLow = ObjectFactory.generateItem(null, 1);
engineLow.startNegotiation(npcLow, itemLow, false);

const lowResult = processOffer({
    engine: engineLow,
    amount: 1,
    isPlayerBuying: false,
    playerMoney: 999,
    npcName: npcLow.name
});
// Any valid result is OK — BargainEngine outcome for $1 depends on NPC personality
assert(VALID_RESULT_TYPES.includes(lowResult.type), `Extremely low offer returns valid result type (NPC-dependent): ${lowResult.type}`);
// Edge case: resolveDeal can run more than once with current registry state
const reg1 = createMockRegistry();
const npcDbl = NPCFactory.generateNPC('turista', 1);
const itemDbl = ObjectFactory.generateItem(null, 1);
const invMgr = makeMockInventory();
const econSys = makeMockEconomy();

resolveDeal({
    registry: reg1, price: 100, isPlayerBuying: true,
    playerMoney: 500, itemData: itemDbl, npcData: npcDbl,
    inventoryManager: invMgr, economySystem: econSys
});
const moneyAfterFirst = reg1.get(STATE_KEYS.PLAYER_MONEY);

// Second resolve with updated money
resolveDeal({
    registry: reg1, price: 50, isPlayerBuying: false,
    playerMoney: moneyAfterFirst, itemData: itemDbl, npcData: npcDbl,
    inventoryManager: invMgr, economySystem: econSys
});
const moneyAfterSecond = reg1.get(STATE_KEYS.PLAYER_MONEY);
assert(moneyAfterSecond === moneyAfterFirst + 50, `Double resolve: money correct: ${moneyAfterFirst} → ${moneyAfterSecond}`);

// Edge case: pending deal is consumed exactly once (prevents double resolution)
const regConsume = createMockRegistry({
    [STATE_KEYS.LAST_DEAL_RESULT]: {
        npcType: 'turista',
        profit: 120,
        finalEmotion: 'neutral',
        isPlayerBuying: false
    }
});
const objConsume = makeMockObjectiveManager();
const firstConsume = processPendingDeal(regConsume, objConsume);
const secondConsume = processPendingDeal(regConsume, objConsume);
assert(firstConsume.hasDeal === true, 'First pending-deal processing consumes the result');
assert(secondConsume.hasDeal === false, 'Second pending-deal processing does not re-consume');
assert(objConsume.getRecorded().length === 1, `Pending deal recorded once: ${objConsume.getRecorded().length}`);

// Edge case: NaN amount
const engineNaN = new BargainEngine();
const npcNaN = NPCFactory.generateNPC('turista', 1);
const itemNaN = ObjectFactory.generateItem(null, 1);
engineNaN.startNegotiation(npcNaN, itemNaN, true);

const nanResult = processOffer({
    engine: engineNaN,
    amount: NaN,
    isPlayerBuying: true,
    playerMoney: 500,
    npcName: npcNaN.name
});
assert(nanResult.type === 'validation_error', `NaN amount triggers validation error: ${nanResult.type}`);

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All edge case tests passed!');

process.exit(failed > 0 ? 1 : 0);
