// ============================================================
// Test: NegotiationFlow Module
// Verifies extracted business logic works correctly
// Run: node tests/test_negotiation_flow.js
// ============================================================

import { processOffer, acceptCurrentOffer, resolveDeal } from '../game/systems/NegotiationFlow.js';
import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { NPCFactory } from '../game/npc/NPCFactory.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';
import { STATE_KEYS, STATE_DEFAULTS } from '../game/core/GameState.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

// Mock registry for testing (simulates Phaser.Data.DataManager)
function createMockRegistry() {
    const store = {};
    // Initialize with defaults
    for (const [key, val] of Object.entries(STATE_DEFAULTS)) {
        store[key] = typeof val === 'object' ? JSON.parse(JSON.stringify(val)) : val;
    }
    return {
        get(key) { return store[key]; },
        set(key, val) { store[key] = val; },
        _store: store
    };
}

// Mock inventory manager
function createMockInventoryManager() {
    const items = [];
    return {
        addItem(item, price) { items.push({ ...item, purchasePrice: price }); },
        getItems() { return items; },
        items
    };
}

// Mock economy system
function createMockEconomySystem() {
    const transactions = [];
    return {
        recordTransaction(item, type) { transactions.push({ item, type }); },
        getTransactions() { return transactions; }
    };
}

console.log('🧪 NegotiationFlow Tests\n');

// --- Test 1: processOffer validation ---
console.log('📋 Test 1: Offer Validation');
const engine1 = new BargainEngine();
const npc1 = NPCFactory.generateNPC('turista', 1);
const item1 = ObjectFactory.generateItem(null, 1);
engine1.startNegotiation(npc1, item1, true);

const valResult = processOffer({
    engine: engine1,
    amount: 99999,
    isPlayerBuying: true,
    playerMoney: 100,
    npcName: npc1.name
});
assert(valResult.type === 'validation_error', `Rejects when amount > playerMoney: ${valResult.type}`);
assert(valResult.error.includes('dinero'), `Error mentions money: "${valResult.error}"`);

const valResult2 = processOffer({
    engine: engine1,
    amount: -5,
    isPlayerBuying: false,
    playerMoney: 500,
    npcName: npc1.name
});
assert(valResult2.type === 'validation_error', `Rejects negative amount: ${valResult2.type}`);

// --- Test 2: processOffer with valid amount ---
console.log('\n📋 Test 2: Valid Offer Processing');
const engine2 = new BargainEngine();
const npc2 = NPCFactory.generateNPC('cliente_normal', 1);
const item2 = ObjectFactory.generateItem(null, 1);
const start2 = engine2.startNegotiation(npc2, item2, true);

const offerResult = processOffer({
    engine: engine2,
    amount: Math.round(start2.npcOffer * 1.1),
    isPlayerBuying: true,
    playerMoney: 5000,
    npcName: npc2.name
});

assert(['accept', 'counter', 'reject', 'walk_away'].includes(offerResult.type), `Valid result type: ${offerResult.type}`);
assert(typeof offerResult.emotion === 'string', `Has emotion: ${offerResult.emotion}`);
assert(typeof offerResult.message === 'string', `Has clean message`);
assert(!offerResult.message.includes(`${npc2.name}:`), 'Message is cleaned of NPC name prefix');

// --- Test 3: acceptCurrentOffer ---
console.log('\n📋 Test 3: Accept Current Offer');
const engine3 = new BargainEngine();
const npc3 = NPCFactory.generateNPC('turista', 1);
const item3 = ObjectFactory.generateItem(null, 1);
const start3 = engine3.startNegotiation(npc3, item3, true);

// First make an exchange so the engine has a current NPC offer in history
engine3.evaluateOffer(Math.round(start3.npcOffer * 1.05));
const acceptResult = acceptCurrentOffer(engine3);
assert(acceptResult.type === 'accept', `Accept works: ${acceptResult.type}`);
assert(typeof acceptResult.finalPrice === 'number' && acceptResult.finalPrice >= 0, `Has final price: $${acceptResult.finalPrice}`);

// --- Test 4: resolveDeal (player buying) ---
console.log('\n📋 Test 4: Resolve Deal (Buying)');
const registry4 = createMockRegistry();
const invMgr4 = createMockInventoryManager();
const econSys4 = createMockEconomySystem();
const npc4 = NPCFactory.generateNPC('coleccionista', 1);
const item4 = ObjectFactory.generateItem(null, 1);
const price4 = 200;

const dealResult4 = resolveDeal({
    registry: registry4,
    price: price4,
    isPlayerBuying: true,
    playerMoney: 500,
    itemData: item4,
    npcData: npc4,
    inventoryManager: invMgr4,
    economySystem: econSys4
});

assert(dealResult4.newMoney === 300, `Money deducted: $${dealResult4.newMoney}`);
assert(dealResult4.dealMessage.includes('Compraste'), `Buy message: "${dealResult4.dealMessage}"`);
assert(invMgr4.items.length === 1, 'Item added to inventory');
assert(registry4.get(STATE_KEYS.PLAYER_MONEY) === 300, 'Registry updated');
assert(registry4.get(STATE_KEYS.LAST_DEAL_RESULT).npcType === npc4.type, 'Deal result stored');

// --- Test 5: resolveDeal (player selling) ---
console.log('\n📋 Test 5: Resolve Deal (Selling)');
const registry5 = createMockRegistry();
const invMgr5 = createMockInventoryManager();
const econSys5 = createMockEconomySystem();
const npc5 = NPCFactory.generateNPC('revendedor', 1);
const item5 = ObjectFactory.generateItem(null, 1);
const price5 = 300;

const dealResult5 = resolveDeal({
    registry: registry5,
    price: price5,
    isPlayerBuying: false,
    playerMoney: 500,
    itemData: item5,
    npcData: npc5,
    inventoryManager: invMgr5,
    economySystem: econSys5
});

assert(dealResult5.newMoney === 800, `Money added: $${dealResult5.newMoney}`);
assert(dealResult5.dealMessage.includes('Vendiste'), `Sell message: "${dealResult5.dealMessage}"`);
assert(registry5.get(STATE_KEYS.TOTAL_EARNINGS) === 300, `Total earnings updated: ${registry5.get(STATE_KEYS.TOTAL_EARNINGS)}`);
assert(dealResult5.dealProfit === 300, `Deal profit: ${dealResult5.dealProfit}`);

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All NegotiationFlow tests passed!');

process.exit(failed > 0 ? 1 : 0);
