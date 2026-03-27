// ============================================================
// Test: Data Integrity & Cross-Module Coherence
// Run: node tests/test_data_integrity.js
// ============================================================

import { ITEM_CATALOG, RARITY_TABLE, CONDITION_LABELS } from '../game/data/items.js';
import { NPC_PROFILES, NPC_NAMES, TYPE_WEIGHTS, NPC_REQUIRED_FIELDS } from '../game/data/npcs.js';
import { CATEGORIES, CAPACITY_BY_LEVEL } from '../game/data/economy.js';
import { EVENT_DEFINITIONS, EVENT_WEIGHTS, EVENT_PROBABILITY } from '../game/data/events.js';
import { BARGAIN_TYPE_CONFIG, TYPE_DIALOGUES, EMOTIONAL_STATES } from '../game/data/dialogues.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ❌ FAIL: ${msg}`); }
}

console.log('🧪 Data Integrity Tests\n');

// --- Items ---
console.log('📦 Items:');
const itemCategories = Object.keys(ITEM_CATALOG);
assert(itemCategories.length >= 5, 'At least 5 item categories');
for (const cat of itemCategories) {
    assert(ITEM_CATALOG[cat].length >= 5, `Category "${cat}" has ≥5 items`);
    for (const item of ITEM_CATALOG[cat]) {
        assert(item.name && item.baseValue > 0, `Item "${item.name}" has name and positive baseValue`);
    }
}
assert(RARITY_TABLE.length === 4, '4 rarity levels');
assert(CONDITION_LABELS.length >= 4, 'At least 4 condition labels');

// --- NPCs ---
console.log('👤 NPCs:');
const npcTypes = Object.keys(NPC_PROFILES);
assert(npcTypes.length >= 5, '>= 5 NPC types');
for (const type of npcTypes) {
    const profile = NPC_PROFILES[type];
    assert(Array.isArray(profile.patience) && profile.patience.length === 2, `${type}.patience is [min, max]`);
    assert(Array.isArray(profile.offerRange) && profile.offerRange.length === 2, `${type}.offerRange is [min, max]`);
    assert(profile.offerRange[0] >= 0 && profile.offerRange[1] <= 1, `${type}.offerRange within [0, 1]`);
    assert(Array.isArray(profile.budget) && profile.budget[0] > 0, `${type}.budget has positive minimum`);
    assert(typeof profile.description === 'string', `${type} has description`);
    assert(NPC_NAMES[type] && NPC_NAMES[type].length >= 2, `${type} has ≥2 names`);
}
assert(Math.abs(Object.values(TYPE_WEIGHTS).reduce((s, w) => s + w, 0) - 1.0) < 0.01, 'TYPE_WEIGHTS sum to 1.0');

// --- Economy ---
console.log('💰 Economy:');
const econCategories = Object.keys(CATEGORIES);
assert(econCategories.length >= 5, 'At least 5 economy categories');
for (const cat of econCategories) {
    assert(CATEGORIES[cat].demand > 0, `${cat} has positive demand`);
    assert(CATEGORIES[cat].supply > 0, `${cat} has positive supply`);
    assert(typeof CATEGORIES[cat].label === 'string', `${cat} has label`);
}
assert(Object.keys(CAPACITY_BY_LEVEL).length >= 5, 'Capacity defined for ≥5 levels');

// --- Category coherence: item catalog categories ⊆ economy categories ---
console.log('🔗 Category Coherence:');
for (const cat of itemCategories) {
    assert(econCategories.includes(cat), `Item category "${cat}" exists in economy CATEGORIES`);
}
for (const ecat of econCategories) {
    assert(itemCategories.includes(ecat), `Economy category "${ecat}" exists in ITEM_CATALOG`);
}

// --- Events ---
console.log('🎲 Events:');
const eventTypes = Object.keys(EVENT_DEFINITIONS);
assert(eventTypes.length >= 10, 'At least 10 event types');
for (const type of eventTypes) {
    const ev = EVENT_DEFINITIONS[type];
    assert(ev.name && ev.description, `Event "${type}" has name and description`);
    assert(Array.isArray(ev.duration) && ev.duration.length === 2, `Event "${type}" has duration [min, max]`);
    assert(typeof ev.demandModifier === 'number', `Event "${type}" has demandModifier`);
}
assert(Object.keys(EVENT_WEIGHTS).length === eventTypes.length, 'EVENT_WEIGHTS covers all events');
assert(typeof EVENT_PROBABILITY === 'number' && EVENT_PROBABILITY > 0 && EVENT_PROBABILITY < 1, 'EVENT_PROBABILITY is valid');

// --- Dialogues ---
console.log('💬 Dialogues:');
assert(EMOTIONAL_STATES.length >= 4, 'At least 4 emotional states');
const dialogueTypes = Object.keys(TYPE_DIALOGUES);
for (const type of dialogueTypes) {
    const d = TYPE_DIALOGUES[type];
    assert(d.counter && d.counter.length >= 2, `${type} has ≥2 counter dialogues`);
    assert(d.accept && d.accept.length >= 2, `${type} has ≥2 accept dialogues`);
    assert(d.reject && d.reject.length >= 2, `${type} has ≥2 reject dialogues`);
    assert(d.walkAway && d.walkAway.length >= 1, `${type} has ≥1 walkAway dialogue`);
    assert(typeof d.trait === 'string', `${type} has trait text`);
}
// All NPC types have dialogues
for (const type of npcTypes) {
    assert(dialogueTypes.includes(type), `NPC type "${type}" has dialogue pool`);
}
// All NPC types have bargain config
for (const type of npcTypes) {
    assert(BARGAIN_TYPE_CONFIG[type], `NPC type "${type}" has bargain config`);
}

console.log(`\n✅ Passed: ${passed}`);
if (failed > 0) console.log(`❌ Failed: ${failed}`);
else console.log('🎉 All data integrity tests passed!');

process.exit(failed > 0 ? 1 : 0);
