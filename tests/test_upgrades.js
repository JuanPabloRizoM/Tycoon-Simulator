// ============================================================
// Test: Stall Upgrades System (Multi-track Progression)
// Run: node tests/test_upgrades.js
// ============================================================

import { InventoryManager } from '../game/inventory/InventoryManager.js';
import { NPCFactory } from '../game/npc/NPCFactory.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';
import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { UPGRADE_TREES } from '../game/data/upgrades.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        passed++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        failed++;
        console.error(`  ❌ FAIL: ${testName}`);
    }
}

console.log('🧪 Upgrades System (Progression) Tests\n');

// 1. Config Validation
console.log('\n📋 Test 1: Configuration Data');
assert(UPGRADE_TREES.capacidad && UPGRADE_TREES.atractivo && UPGRADE_TREES.confianza && UPGRADE_TREES.contactos, 'All 4 upgrade trees exist');
assert(UPGRADE_TREES.capacidad.maxLevel === 5, 'Max level is 5');

// 2. UPG_CAPACITY -> InventoryManager
console.log('\n📋 Test 2: UPG_CAPACITY (InventoryManager)');
const invBase = new InventoryManager(1);
const invMax = new InventoryManager(5);
assert(invBase.getCapacity() === 8, `Base capacity is 8 (got ${invBase.getCapacity()})`);
assert(invMax.getCapacity() === 30, `Max capacity is 30 (got ${invMax.getCapacity()})`);

// Fill inventory tests
for (let i = 0; i < 8; i++) invBase.addItem({ name: 'junk' }, 10);
assert(!invBase.canAddItem(), 'Level 1 inventory correctly maxes out at 8 items');

invBase.setCapacityLevel(2); // simulate upgrade
assert(invBase.canAddItem(), 'Upgrading capacity dynamically allows more items');
assert(invBase.getCapacity() === 12, `Level 2 capacity is 12 (got ${invBase.getCapacity()})`);

// 3. UPG_NETWORK -> ObjectFactory
console.log('\n📋 Test 3: UPG_NETWORK (ObjectFactory)');
let highValueBase = 0;
let highValueMax = 0;
for (let i = 0; i < 100; i++) {
    const item1 = ObjectFactory.generateItem(null, 1);
    const item5 = ObjectFactory.generateItem(null, 5);
    
    // Check rarity/value scale
    if (item1.baseValue > 300) highValueBase++;
    if (item5.baseValue > 300) highValueMax++;
}

assert(highValueMax > highValueBase, `Network Level 5 produces more high-bracket items than Level 1 (${highValueMax} vs ${highValueBase})`);

// 4. UPG_VISUAL -> NPCFactory Weights
console.log('\n📋 Test 4: UPG_VISUAL (NPCFactory)');
const weightsL1 = NPCFactory.getWeightsForLevel(1);
const weightsL5 = NPCFactory.getWeightsForLevel(5);

assert(weightsL1.cliente_normal > weightsL5.cliente_normal, 'Level 1 gets more normal clients than Level 5');
assert(weightsL5.revendedor > weightsL1.revendedor, 'Level 5 gets more high-budget resellers');
assert(weightsL5.coleccionista > weightsL1.coleccionista, 'Level 5 gets more collectors than Level 1');

// 5. UPG_TRUST -> Patience Modification manually testing mechanics
console.log('\n📋 Test 5: UPG_TRUST (Mechanics concept)');

const originalRandom = Math.random;
Math.random = () => 0.5;

const engine = new BargainEngine();
const npc = NPCFactory.generateNPC('turista', 1);
const item = ObjectFactory.generateItem(null, 1);
engine.startNegotiation(npc, item, true);
const p1 = engine.patience;

const engine2 = new BargainEngine();
engine2.startNegotiation(npc, item, true, { patienceMod: 20 }); // Level 5 trust = (5-1)*5 = +20
const p5 = engine2.patience;

Math.random = originalRandom;

assert(p5 - p1 === 20, `Patience is 20 points higher at max trust (${p5} vs ${p1})`);

console.log('\n═══════════════════════════════════════');
if (failed === 0) {
    console.log(`🎉 All ${passed} upgrades tests passed!`);
    process.exit(0);
} else {
    console.error(`❌ ${failed} tests failed.`);
    process.exit(1);
}
