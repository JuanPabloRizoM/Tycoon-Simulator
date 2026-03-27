// ============================================================
// Test: Balance Analyzer Bot Simulation
// Run: node tests/test_balance_analyzer.js
// ============================================================

import { NPCFactory } from '../game/npc/NPCFactory.js';
import { ObjectFactory } from '../game/inventory/ObjectFactory.js';
import { BargainEngine } from '../game/negotiation/BargainEngine.js';
import { processOffer } from '../game/systems/NegotiationFlow.js';
import { TelemetryTracker } from '../game/core/TelemetryTracker.js';
import { MarketEvents } from '../game/economy/MarketEvents.js';
import { EconomySystem } from '../game/economy/EconomySystem.js';
import { BalanceAnalyzer } from '../game/core/BalanceAnalyzer.js';

const TOTAL_DAYS = 50;
const DEALS_PER_DAY = 15;
const VISUAL_UPG_LEVEL = 3; 

console.log(`🤖 Iniciando Simulador de Bot Tianguero (${TOTAL_DAYS} días)...`);

const economySystem = new EconomySystem();
const eventSystem = new MarketEvents(economySystem);

for (let day = 1; day <= TOTAL_DAYS; day++) {
    // 1. Roll daily event
    const evtResult = eventSystem.advanceDay(day);
    const eventMods = eventSystem.getActiveModifiers();
    
    TelemetryTracker.startNewDay(day, evtResult.newEvent);

    // 2. Perform N deals
    for (let d = 0; d < DEALS_PER_DAY; d++) {
        const npc = NPCFactory.generateNPC(null, VISUAL_UPG_LEVEL, eventMods?.spawnWeightOverrides);
        const item = ObjectFactory.generateItem(null, 3, eventMods?.rarityShift);
        
        // 90% of the time bot is SELLING
        const isPlayerSelling = Math.random() < 0.9;
        
        const engine = new BargainEngine();
        engine.startNegotiation(npc, item, isPlayerSelling, eventMods);

        let active = true;
        let success = false;
        let finalPrice = 0;
        let safetyCounter = 0;
        
        let botOfferMultiplier = isPlayerSelling ? 1.4 : 0.6;
        
        while (active && safetyCounter++ < 50) {
            const botPrice = Math.round(item.baseValue * botOfferMultiplier);
            const res = processOffer({ 
                engine, 
                amount: botPrice, 
                isPlayerBuying: !isPlayerSelling, 
                playerMoney: 9999999, 
                npcName: npc.name 
            });
            
            if (res.type === 'accept') {
                active = false;
                success = true;
                finalPrice = botPrice;
            } else if (res.type === 'walk_away') {
                active = false;
                success = false;
            } else {
                // Counter or reject -> adjust
                if (isPlayerSelling) botOfferMultiplier -= 0.05;
                else botOfferMultiplier += 0.05;
                
                // Panic: If margin is gone, accept last offer or give up
                if (isPlayerSelling && botOfferMultiplier < 1.05) {
                    botOfferMultiplier = 1.05; 
                }
                if (!isPlayerSelling && botOfferMultiplier > 0.95) {
                    botOfferMultiplier = 0.95;
                }
            }
        }
        
        if (safetyCounter >= 50) {
            console.error(`Infinite loop detected! Day: ${day}, isSelling: ${isPlayerSelling}, botMulti: ${botOfferMultiplier}, npc: ${npc.type}`);
            active = false;
        }

        // 3. Record Telemetry
        let profit = 0;
        if (success) {
            profit = isPlayerSelling ? (finalPrice - item.baseValue) : (item.baseValue - finalPrice);
        }
        
        TelemetryTracker.recordDeal(npc, item, profit, success, engine.patience, engine.maxPatience);
    }
}

console.log('✅ Simulación completada. Generando reporte de balance...\n');

const logs = TelemetryTracker.exportLogs();
const report = BalanceAnalyzer.generateReport(logs);

console.log('============== 📊 REPORTE DE BALANCE ==============\n');
console.log('📈 RESUMEN GLOBAL');
console.table(report.summary);

console.log('\n🧑‍🤝‍🧑 BALANCE DE NPCs (Tasas de cierre & Tensión)');
console.table(report.npcBalance.closeRates);
console.log('Paciencia quemada por encuentro:');
console.table(report.npcBalance.avgPatienceCost);

console.log('\n💎 RENTABILIDAD POR RAREZA');
console.table(report.economyBalance.avgProfitByRarity);
console.log('ROI (%) por Rareza:');
console.table(report.economyBalance.roiByRarity);

console.log('\n🎭 IMPACTO DE EVENTOS DIARIOS');
console.table(report.eventBalance.dangerRate);
console.log('Ganancia promedio esperada por evento:');
console.table(report.eventBalance.avgExpectedProfit);

console.log('\n===================================================');
