// ============================================================
// Test: NPC Structure Validation
// Verifies NPCFactory produces valid, complete NPCs
// Run: node tests/test_npc_structure.js
// ============================================================

import { NPCFactory } from '../game/npc/NPCFactory.js';
import { NPC_REQUIRED_FIELDS, NPC_PROFILES } from '../game/data/npcs.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

console.log('🧪 NPC Structure Tests\n');

const npcTypes = Object.keys(NPC_PROFILES);

for (const type of npcTypes) {
    console.log(`👤 Testing type: ${type}`);

    // Generate multiple to catch randomness issues
    for (let i = 0; i < 5; i++) {
        const npc = NPCFactory.generateNPC(type, 1);

        // Check all required fields
        for (const field of NPC_REQUIRED_FIELDS) {
            assert(npc[field] !== undefined && npc[field] !== null, `${type}[${i}].${field} exists`);
        }

        // Validate ranges
        assert(npc.patience >= 0 && npc.patience <= 1, `${type}[${i}].patience in [0,1]: ${npc.patience}`);
        assert(npc.greed >= 0 && npc.greed <= 1, `${type}[${i}].greed in [0,1]: ${npc.greed}`);
        assert(npc.knowledge >= 0 && npc.knowledge <= 1, `${type}[${i}].knowledge in [0,1]: ${npc.knowledge}`);
        assert(npc.budget > 0, `${type}[${i}].budget > 0: ${npc.budget}`);

        // Validate offerRange
        assert(Array.isArray(npc.offerRange), `${type}[${i}].offerRange is array`);
        assert(npc.offerRange.length === 2, `${type}[${i}].offerRange has 2 elements`);
        assert(npc.offerRange[0] >= 0 && npc.offerRange[0] <= 1, `${type}[${i}].offerRange[0] in [0,1]: ${npc.offerRange[0]}`);
        assert(npc.offerRange[1] >= npc.offerRange[0], `${type}[${i}].offerRange[1] >= [0]: ${npc.offerRange}`);

        // Validate type and name
        assert(npc.type === type, `${type}[${i}].type matches`);
        assert(typeof npc.name === 'string' && npc.name.length > 0, `${type}[${i}].name is non-empty string`);
        assert(typeof npc.texture === 'string', `${type}[${i}].texture is string`);

        // Validate emotional state
        assert(npc.emotionalState === 'neutral', `${type}[${i}] starts as neutral`);
    }
}

// Test level scaling
console.log('\n📈 Level Scaling:');
for (let level = 1; level <= 5; level++) {
    const npc = NPCFactory.generateNPC(null, level);
    assert(npc !== null && npc !== undefined, `Level ${level} generates an NPC`);
    assert(NPC_REQUIRED_FIELDS.every(f => npc[f] !== undefined), `Level ${level} NPC has all fields`);
}

// Test with spawn overrides
console.log('\n🎲 Spawn Overrides:');
const overrides = { turista: 0.5, estafador: -0.05 };
for (let i = 0; i < 10; i++) {
    const npc = NPCFactory.generateNPC(null, 1, overrides);
    assert(npc !== null, `Spawn override generates NPC [${i}]`);
}

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All NPC structure tests passed!');

process.exit(failed > 0 ? 1 : 0);
