// ============================================================
// TelemetryTracker — Registro simple de balance y economía
// ============================================================

export class TelemetryTracker {
    static globalLog = [];
    static currentDayStats = {
        day: 1,
        activeEvent: null,
        sales: 0,
        lost: 0,
        profit: 0,
        patienceUsed: 0,
        upgradesBought: []
    };

    /**
     * Start tracking a new day
     */
    static startNewDay(day, eventDef) {
        this.currentDayStats = {
            day: day,
            activeEvent: eventDef,
            sales: 0,
            lost: 0,
            profit: 0,
            patienceUsed: 0,
            upgradesBought: []
        };
    }

    /**
     * Record a completed or abandoned deal
     */
    static recordDeal(npc, item, profit, success, patienceLeft, maxPatience) {
        // Track for End of Day Summary
        if (success) {
            this.currentDayStats.sales++;
            this.currentDayStats.profit += profit;
        } else {
            this.currentDayStats.lost++;
            // Note: Profit might be negative or zero on lost deals
            this.currentDayStats.profit += profit; 
        }

        const patienceConsumed = maxPatience - patienceLeft;
        this.currentDayStats.patienceUsed += Math.max(0, patienceConsumed);

        // Track globally for analytics/balance review
        this.globalLog.push({
            timestamp: Date.now(),
            day: this.currentDayStats.day,
            event: this.currentDayStats.activeEvent?.type || 'none',
            npcType: npc.type,
            itemId: item.id,
            itemRarity: item.rarity,
            itemBaseValue: item.baseValue,
            profit,
            success,
            patienceConsumed
        });
    }

    /**
     * Record purchased upgrade
     */
    static recordUpgrade(upgradeKey, cost) {
        this.currentDayStats.upgradesBought.push({ key: upgradeKey, cost });
        
        this.globalLog.push({
            timestamp: Date.now(),
            day: this.currentDayStats.day,
            type: 'upgrade',
            upgradeKey,
            cost
        });
    }

    /**
     * Retrieve today's summary
     */
    static getDayStats() {
        return { ...this.currentDayStats };
    }

    /**
     * Dump all telemetry data (useful for console inspection / balance tests)
     */
    static exportLogs() {
        return [...this.globalLog];
    }
}
