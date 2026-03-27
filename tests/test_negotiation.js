// ============================================================
// Test: Basic Negotiation Flow
// Verifies BargainEngine produces valid negotiation sessions
// Run: node tests/test_negotiation.js
// ============================================================

import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { NPCFactory } from '../game/npc/NPCFactory.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

console.log('🧪 Negotiation Flow Tests\n');

// --- Test 1: Start a negotiation ---
console.log('📋 Test 1: Start Negotiation');
const engine = new BargainEngine();
const npc = NPCFactory.generateNPC('cliente_normal', 1);
const item = ObjectFactory.generateItem(null, 1);

const startResult = engine.startNegotiation(npc, item, true);

assert(typeof startResult.npcOffer === 'number' && startResult.npcOffer > 0, `NPC makes initial offer: $${startResult.npcOffer}`);
assert(typeof startResult.perceivedValue === 'number', `Has perceived value: ${startResult.perceivedValue}`);
assert(typeof startResult.patience === 'number' && startResult.patience > 0, `Has patience: ${startResult.patience}`);
assert(typeof startResult.npcTrait === 'string', `Has NPC trait: "${startResult.npcTrait}"`);
assert(startResult.emotion === 'neutral', `Starts with neutral emotion`);

// --- Test 2: Make a reasonable offer ---
console.log('\n📋 Test 2: Reasonable Offer');
const reasonableOffer = Math.round(startResult.npcOffer * 1.2);
const result2 = engine.evaluateOffer(reasonableOffer);

assert(result2.round === 1, `Is round 1`);
assert(['accept', 'counter', 'reject'].includes(result2.result), `Result is valid: ${result2.result}`);
assert(typeof result2.patience === 'number', `Patience returned: ${result2.patience}`);
assert(typeof result2.emotion === 'string', `Emotion returned: ${result2.emotion}`);

// --- Test 3: Make an extreme offer (should deplete patience) ---
console.log('\n📋 Test 3: Extreme Offer');
const engine2 = new BargainEngine();
const npc2 = NPCFactory.generateNPC('revendedor', 1);
const item2 = ObjectFactory.generateItem(null, 1);
const start2 = engine2.startNegotiation(npc2, item2, true);

// Offer way too high — should anger NPC
let lastResult;
for (let i = 0; i < 15; i++) {
    lastResult = engine2.evaluateOffer(start2.npcOffer * 10);
    if (lastResult.result === 'walk_away') break;
}
assert(lastResult.result === 'walk_away' || lastResult.patience <= 0, 'Extreme offers cause walk_away');

// --- Test 4: Accept last offer ---
console.log('\n📋 Test 4: Accept Last Offer');
const engine3 = new BargainEngine();
const npc3 = NPCFactory.generateNPC('turista', 1);
const item3 = ObjectFactory.generateItem(null, 1);
engine3.startNegotiation(npc3, item3, true);
const acceptResult = engine3.acceptLastOffer();
assert(acceptResult.result === 'accept', `Accept last offer works`);
assert(typeof acceptResult.finalPrice === 'number' && acceptResult.finalPrice > 0, `Final price: $${acceptResult.finalPrice}`);

// --- Test 5: Walk away ---
console.log('\n📋 Test 5: Walk Away');
const walkResult = engine3.walkAway();
assert(walkResult.result === 'walk_away', 'walkAway returns correct result');

// --- Test 6: All NPC types negotiate ---
console.log('\n📋 Test 6: All NPC Types');
const types = ['turista', 'revendedor', 'coleccionista', 'cliente_normal', 'estafador'];
for (const type of types) {
    const eng = new BargainEngine();
    const n = NPCFactory.generateNPC(type, 1);
    const it = ObjectFactory.generateItem(null, 1);
    const sr = eng.startNegotiation(n, it, true);
    assert(sr.npcOffer > 0, `${type} makes valid initial offer: $${sr.npcOffer}`);
    
    const ev = eng.evaluateOffer(Math.round(sr.npcOffer * 1.1));
    assert(['accept', 'counter', 'reject', 'walk_away'].includes(ev.result), `${type} responds validly: ${ev.result}`);
}

// --- Test 7: Event modifiers ---
console.log('\n📋 Test 7: Event Modifiers');
const engine4 = new BargainEngine();
const npc4 = NPCFactory.generateNPC('turista', 1);
const item4 = ObjectFactory.generateItem(null, 1);
const eventMods = { patienceMod: 15, flexMod: 0.1 };
const start4 = engine4.startNegotiation(npc4, item4, true, eventMods);
assert(start4.patience > 0, `Event mods applied, patience: ${start4.patience}`);

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All negotiation tests passed!');

process.exit(failed > 0 ? 1 : 0);
