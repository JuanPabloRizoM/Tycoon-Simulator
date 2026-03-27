#!/usr/bin/env node
// ============================================================
// Test Runner — Runs all test suites in sequence
// Run: node tests/run-tests.js
// ============================================================

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testsDir = __dirname;

const suites = [
    'test_data_integrity.js',
    'test_npc_structure.js',
    'test_negotiation.js',
    'test_negotiation_flow.js',
    'test_day_cycle.js',
    'test_edge_cases.js',
    'test_npc_personalities.js',
    'test_upgrades.js',
    'test_telemetry.js'
];

let allPassed = true;

console.log('═══════════════════════════════════════');
console.log('  🧪 Tianguis Tycoon — Test Runner');
console.log('═══════════════════════════════════════\n');

for (const suite of suites) {
    const suitePath = join(testsDir, suite);
    console.log(`\n▶ Running: ${suite}`);
    console.log('─'.repeat(40));

    try {
        execSync(`node --experimental-vm-modules "${suitePath}"`, {
            stdio: 'inherit',
            cwd: join(testsDir, '..')
        });
        console.log(`✅ ${suite} — PASSED`);
    } catch (err) {
        console.error(`❌ ${suite} — FAILED`);
        allPassed = false;
    }
}

console.log('\n═══════════════════════════════════════');
if (allPassed) {
    console.log('  🎉 ALL TEST SUITES PASSED');
} else {
    console.log('  ❌ SOME TESTS FAILED');
}
console.log('═══════════════════════════════════════');

process.exit(allPassed ? 0 : 1);
