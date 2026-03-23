// ============================================================
// BalanceAnalyzer — Transforma los raw logs en diagnósticos
// ============================================================

export class BalanceAnalyzer {
    
    /**
     * Parse raw telemetry and generate an economic health report
     * @param {Array} logs - Raw logs from TelemetryTracker
     */
    static generateReport(logs) {
        if (!logs || logs.length === 0) return { error: 'No data to analyze.' };

        const dealLogs = logs.filter(l => l.type !== 'upgrade');
        const upgradeLogs = logs.filter(l => l.type === 'upgrade');
        
        const daysPlayed = new Set(logs.map(l => l.day)).size;
        const totalSales = dealLogs.filter(l => l.success).length;
        const totalLost = dealLogs.filter(l => !l.success).length;
        const totalProfit = dealLogs.reduce((sum, l) => sum + (l.profit || 0), 0);
        const totalSpentOnUpgrades = upgradeLogs.reduce((sum, l) => sum + l.cost, 0);

        // 1. NPC Metrics (Close Rate and Frustration)
        const npcMetrics = {};
        for (const log of dealLogs) {
            if (!npcMetrics[log.npcType]) {
                npcMetrics[log.npcType] = { encounters: 0, closed: 0, lost: 0, patienceUsed: 0 };
            }
            npcMetrics[log.npcType].encounters++;
            if (log.success) npcMetrics[log.npcType].closed++;
            else npcMetrics[log.npcType].lost++;
            npcMetrics[log.npcType].patienceUsed += log.patienceConsumed || 0;
        }

        // Aggregate NPC calculations
        const closeRateByNPC = {};
        const avgPatienceCostByNPC = {};
        for (const [type, metrics] of Object.entries(npcMetrics)) {
            closeRateByNPC[type] = metrics.encounters > 0 
                ? (metrics.closed / metrics.encounters).toFixed(2) : 0;
            avgPatienceCostByNPC[type] = metrics.encounters > 0 
                ? (metrics.patienceUsed / metrics.encounters).toFixed(1) : 0;
        }

        // 2. Rarity Profitability
        const rarityMetrics = {};
        for (const log of dealLogs) {
            if (!log.success) continue;
            if (!rarityMetrics[log.itemRarity]) {
                rarityMetrics[log.itemRarity] = { sales: 0, totalProfit: 0, totalBaseValue: 0 };
            }
            rarityMetrics[log.itemRarity].sales++;
            rarityMetrics[log.itemRarity].totalProfit += log.profit;
            rarityMetrics[log.itemRarity].totalBaseValue += log.itemBaseValue;
        }

        const avgProfitByRarity = {};
        const roiByRarity = {};
        for (const [rarity, metrics] of Object.entries(rarityMetrics)) {
            avgProfitByRarity[rarity] = metrics.sales > 0 
                ? (metrics.totalProfit / metrics.sales).toFixed(1) : 0;
            
            // ROI = (Profit / BaseValue) %
            roiByRarity[rarity] = metrics.totalBaseValue > 0 
                ? ((metrics.totalProfit / metrics.totalBaseValue) * 100).toFixed(1) + '%' : '0%';
        }

        // 3. Event Friendliness
        const eventMetrics = {};
        for (const log of dealLogs) {
            if (!eventMetrics[log.event]) {
                eventMetrics[log.event] = { encounters: 0, lost: 0, totalProfit: 0 };
            }
            eventMetrics[log.event].encounters++;
            if (!log.success) eventMetrics[log.event].lost++;
            if (log.success) eventMetrics[log.event].totalProfit += log.profit;
        }

        const eventDanger = {}; // Lost customer rate
        const eventProfitability = {}; // Avg profit per encounter (including lost ones)
        for (const [event, metrics] of Object.entries(eventMetrics)) {
            eventDanger[event] = metrics.encounters > 0 
                ? (metrics.lost / metrics.encounters).toFixed(2) : 0;
            eventProfitability[event] = metrics.encounters > 0 
                ? (metrics.totalProfit / metrics.encounters).toFixed(1) : 0;
        }

        // Final payload
        return {
            summary: {
                daysPlayed,
                totalEncounters: dealLogs.length,
                totalSales,
                totalLost,
                globalCloseRate: dealLogs.length > 0 ? (totalSales / dealLogs.length).toFixed(2) : 0,
                dailyAvgProfit: daysPlayed > 0 ? (totalProfit / daysPlayed).toFixed(1) : 0,
                totalSpentOnUpgrades
            },
            npcBalance: {
                closeRates: closeRateByNPC,
                avgPatienceCost: avgPatienceCostByNPC
            },
            economyBalance: {
                avgProfitByRarity,
                roiByRarity
            },
            eventBalance: {
                dangerRate: eventDanger,
                avgExpectedProfit: eventProfitability
            }
        };
    }
}
