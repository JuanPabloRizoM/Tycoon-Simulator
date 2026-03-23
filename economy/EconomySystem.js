// ============================================================
// EconomySystem — Sistema Económico con oferta/demanda dinámica
// Fórmula: price = base_value × demand × rarity
// ============================================================

import { CATEGORIES } from '../data/economy.js';

export class EconomySystem {
    constructor() {
        // Clone categories so we can mutate them
        this.categories = {};
        for (const [key, val] of Object.entries(CATEGORIES)) {
            this.categories[key] = { ...val };
        }
        this.dayHistory = [];
    }

    /**
     * Calculate the current market price of an item
     * Formula: price = base_value × demand × rarity × condition
     */
    calculatePrice(item) {
        const cat = this.categories[item.category];
        if (!cat) return item.baseValue;

        const demandFactor = cat.demand / Math.max(cat.supply, 0.1);
        const price = item.baseValue * demandFactor * item.rarityMultiplier * item.condition;
        return Math.round(Math.max(price, 1));
    }

    /**
     * Get the demand factor for a category
     */
    getDemandFactor(category) {
        const cat = this.categories[category];
        if (!cat) return 1.0;
        return Math.round((cat.demand / Math.max(cat.supply, 0.1)) * 100) / 100;
    }

    /**
     * Advance the economy by one day — fluctuate supply/demand
     */
    advanceDay() {
        const snapshot = {};

        for (const [key, cat] of Object.entries(this.categories)) {
            // Natural fluctuation
            const demandShift = (Math.random() - 0.5) * cat.volatility * 2;
            const supplyShift = (Math.random() - 0.5) * cat.volatility;

            cat.demand = Math.max(0.3, Math.min(2.0, cat.demand + demandShift));
            cat.supply = Math.max(0.3, Math.min(2.0, cat.supply + supplyShift));

            snapshot[key] = {
                demand: Math.round(cat.demand * 100) / 100,
                supply: Math.round(cat.supply * 100) / 100,
                factor: this.getDemandFactor(key)
            };
        }

        this.dayHistory.push(snapshot);
        return snapshot;
    }

    /**
     * Apply a market event modifier to a category
     */
    applyEventModifier(category, demandModifier, supplyModifier = 0) {
        const cat = this.categories[category];
        if (!cat) return;
        cat.demand = Math.max(0.3, Math.min(3.0, cat.demand + demandModifier));
        if (supplyModifier) {
            cat.supply = Math.max(0.1, Math.min(2.0, cat.supply + supplyModifier));
        }
    }

    /**
     * Record a transaction — affects supply/demand
     */
    recordTransaction(item, type) {
        const cat = this.categories[item.category];
        if (!cat) return;

        if (type === 'buy') {
            cat.supply -= 0.02;
        } else if (type === 'sell') {
            cat.supply += 0.01;
            cat.demand -= 0.01;
        }

        // Clamp values
        cat.supply = Math.max(0.1, Math.min(2.0, cat.supply));
        cat.demand = Math.max(0.3, Math.min(2.0, cat.demand));
    }

    /**
     * Get market overview for all categories
     */
    getMarketOverview() {
        const overview = {};
        for (const [key, cat] of Object.entries(this.categories)) {
            overview[key] = {
                label: cat.label,
                demand: Math.round(cat.demand * 100) / 100,
                supply: Math.round(cat.supply * 100) / 100,
                factor: this.getDemandFactor(key),
                trend: this.getTrend(key)
            };
        }
        return overview;
    }

    /**
     * Get price trend for a category (up/down/stable)
     */
    getTrend(category) {
        if (this.dayHistory.length < 2) return 'stable';
        const prev = this.dayHistory[this.dayHistory.length - 2];
        const curr = this.dayHistory[this.dayHistory.length - 1];
        if (!prev || !curr || !prev[category] || !curr[category]) return 'stable';

        const diff = curr[category].factor - prev[category].factor;
        if (diff > 0.05) return 'up';
        if (diff < -0.05) return 'down';
        return 'stable';
    }
}
