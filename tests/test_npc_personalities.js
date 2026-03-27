import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { NPCFactory } from '../game/npc/NPCFactory.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';
import { BARGAIN_TYPE_CONFIG } from '../game/data/dialogues.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; console.log(`  ✅ PASS: ${msg}`); }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

console.log('🧪 NPC Personalities (Data-Driven) Tests\n');

const engineTurista = new BargainEngine();
const engineRevendedor = new BargainEngine();
const item = ObjectFactory.generateItem(null, 1);

// Force deterministic knowledge for testing
const turista = NPCFactory.generateNPC('turista', 1);
turista.knowledge = 1.0;
turista.greed = 0.5;

const revendedor = NPCFactory.generateNPC('revendedor', 1);
revendedor.knowledge = 1.0;
revendedor.greed = 0.5;

console.log('\n📋 Test 1: Offer Ranges Differ Contextually');
const tResult = engineTurista.startNegotiation(turista, item, true); // player selling
const rResult = engineRevendedor.startNegotiation(revendedor, item, true); // player selling

const tOfferRatio = tResult.npcOffer / item.baseValue;
const rOfferRatio = rResult.npcOffer / item.baseValue;

// Turista should offer more (e.g. 0.6-0.8 range vs 0.2-0.4 for revendedor)
assert(tOfferRatio > rOfferRatio + 0.1, `Turista offers more (${tOfferRatio.toFixed(2)}x) than Revendedor (${rOfferRatio.toFixed(2)}x)`);

console.log('\n📋 Test 2: Patience Damage Multipliers');
// Player makes an identical bad offer to both
const badOffer = item.baseValue * 5; 

// Test Turista reaction
engineTurista.evaluateOffer(badOffer);
const tDamage = tResult.maxPatience - engineTurista.patience;

// Test Revendedor reaction
engineRevendedor.evaluateOffer(badOffer);
const rDamage = rResult.maxPatience - engineRevendedor.patience;

// Revendedor has 1.5x damage mult, Turista has 0.5x damage mult.
// Meaning revendedor should take roughly 3x more damage
assert(rDamage > tDamage * 1.5, `Revendedor takes more patience damage (${rDamage}) than Turista (${tDamage}) from same bad offer`);

console.log('\n📋 Test 3: Rarity Valuation (Coleccionista vs Normal)');
const engineCol = new BargainEngine();
const engineNorm = new BargainEngine();

const rareItem = { baseValue: 500, rarityMultiplier: 2.5, condition: 1.0, qualityName: 'Nuevo' };
const colNPC = NPCFactory.generateNPC('coleccionista', 1);
colNPC.knowledge = 1.0;
const normNPC = NPCFactory.generateNPC('regateador', 1);
normNPC.knowledge = 1.0;

const colRes = engineCol.startNegotiation(colNPC, rareItem, true);
const normRes = engineNorm.startNegotiation(normNPC, rareItem, true);

// Coleccionista should perceive much higher value than a Regateador because of raritySensitivity 
assert(colRes.perceivedValue > normRes.perceivedValue * 1.2, `Coleccionista values rare items higher (${colRes.perceivedValue}) than Regateador (${normRes.perceivedValue})`);

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All NPC personality tests passed!');

process.exit(failed > 0 ? 1 : 0);
