// ============================================================
// Test: TelemetryTracker and Day Summary Logic
// Run: node tests/test_telemetry.js
// ============================================================

import { TelemetryTracker } from '../game/core/TelemetryTracker.js';

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

console.log('🧪 Telemetry & Day Summary Tests\n');

// Mock data
const mockEvent = { type: 'tourist_day', name: 'Día de Turistas' };
const mockNpc = { type: 'turista' };
const mockItem1 = { id: 1, baseValue: 100, rarity: 'común' };
const mockItem2 = { id: 2, baseValue: 500, rarity: 'épico' };

// 1. Starting a new day
console.log('\n📋 Test 1: Start New Day');
TelemetryTracker.startNewDay(4, mockEvent);
let stats = TelemetryTracker.getDayStats();

assert(stats.day === 4, 'Day is correctly tracked');
assert(stats.activeEvent.type === 'tourist_day', 'Active event is tracked');
assert(stats.sales === 0 && stats.profit === 0, 'Stats start at 0');

// 2. Recording Deals
console.log('\n📋 Test 2: Recording Deals');
// Player buys a $100 item for $80 (Profit = +$20) -> success
TelemetryTracker.recordDeal(mockNpc, mockItem1, 20, true, 50, 100);

// Player sells a $500 item for $600 (Profit = +$100) -> success
TelemetryTracker.recordDeal(mockNpc, mockItem2, 100, true, 80, 100);

// Player walks away trying to sell for too much (Profit = $0, but could be tracked as 0 or net loss) -> fail
TelemetryTracker.recordDeal(mockNpc, mockItem1, 0, false, 0, 100);

stats = TelemetryTracker.getDayStats();
assert(stats.sales === 2, `Sales counted correctly (Expected: 2, Got: ${stats.sales})`);
assert(stats.profit === 120, `Profit summed correctly (Expected: 120, Got: ${stats.profit})`);
assert(stats.lost === 1, `Lost deals counted correctly (Expected: 1, Got: ${stats.lost})`);
assert(stats.patienceUsed === 170, `Patience used summed correctly (Expected: 50 + 20 + 100 = 170, Got: ${stats.patienceUsed})`);

// 3. Upgrades
console.log('\n📋 Test 3: Tracking Upgrades');
TelemetryTracker.recordUpgrade('UPG_VISUAL', 500);
TelemetryTracker.recordUpgrade('UPG_TRUST', 300);

stats = TelemetryTracker.getDayStats();
assert(stats.upgradesBought.length === 2, `Upgrades tracked (Expected: 2, Got: ${stats.upgradesBought.length})`);
assert(stats.upgradesBought[1].key === 'UPG_TRUST', 'Upgrade key was captured');

// 4. Global Log
console.log('\n📋 Test 4: Global Log Retention');
const logs = TelemetryTracker.exportLogs();
assert(logs.length === 5, `Log size matches 3 deals + 2 upgrades (Expected: 5, Got: ${logs.length})`);
assert(logs[0].profit === 20 && logs[0].event === 'tourist_day', 'Detailed telemetry captured in log');

console.log('\n═══════════════════════════════════════');
if (failed === 0) {
    console.log(`🎉 All ${passed} telemetry tests passed!`);
    process.exit(0);
} else {
    console.error(`❌ ${failed} tests failed.`);
    process.exit(1);
}
