// ============================================================
// ObjectFactory — Generación de objetos con rareza
// Distribución: 60% común, 25% raro, 10% épico, 5% legendario
// Fórmula: valor = base × rareza × condición × demanda
// ============================================================

import { ITEM_CATALOG, RARITY_TABLE, CONDITION_LABELS } from '../data/items.js';

let itemIdCounter = 0;

export class ObjectFactory {
    /**
     * Get value bracket based on player level
     * Returns an object { min: number, max: number }
     */
    static getValueBracket(playerLevel) {
        const b1 = { min: 0, max: 60 };
        const b2 = { min: 61, max: 150 };
        const b3 = { min: 151, max: 300 };
        
        const caps = { 1: 400, 2: 500, 3: 600, 4: 800, 5: 1200 };
        const b4 = { min: 301, max: caps[playerLevel] || 1200 };

        const roll = Math.random();
        
        if (playerLevel === 1) {
            if (roll < 0.80) return b1;
            if (roll < 0.97) return b2;
            if (roll < 0.995) return b3;
            return b4;
        } else if (playerLevel === 2) {
            if (roll < 0.30) return b1;
            if (roll < 0.85) return b2;
            if (roll < 0.98) return b3;
            return b4;
        } else if (playerLevel === 3) {
            if (roll < 0.20) return b1;
            if (roll < 0.55) return b2;
            if (roll < 0.90) return b3;
            return b4;
        } else if (playerLevel === 4) {
            if (roll < 0.10) return b1;
            if (roll < 0.35) return b2;
            if (roll < 0.75) return b3;
            return b4;
        } else {
            if (roll < 0.05) return b1;
            if (roll < 0.20) return b2;
            if (roll < 0.60) return b3;
            return b4;
        }
    }

    /**
     * Generate a random item
     */
    static generateItem(category = null, playerLevel = 1, rarityShift = 0) {
        if (!category) {
            const cats = Object.keys(ITEM_CATALOG);
            category = cats[Math.floor(Math.random() * cats.length)];
        }

        const items = ITEM_CATALOG[category];
        const bracket = this.getValueBracket(playerLevel);
        const validItems = items.filter(item => item.baseValue >= bracket.min && item.baseValue <= bracket.max);
        
        let base;
        if (validItems.length > 0) {
            base = validItems[Math.floor(Math.random() * validItems.length)];
        } else {
            // Fallback: search across all categories for something fitting the bracket
            let allValid = [];
            for (const catItems of Object.values(ITEM_CATALOG)) {
                allValid = allValid.concat(catItems.filter(item => item.baseValue >= bracket.min && item.baseValue <= bracket.max));
            }
            if (allValid.length > 0) {
                base = allValid[Math.floor(Math.random() * allValid.length)];
                category = Object.keys(ITEM_CATALOG).find(c => ITEM_CATALOG[c].includes(base));
            } else {
                base = items[Math.floor(Math.random() * items.length)];
            }
        }

        const rarity = this.rollRarity(playerLevel, rarityShift);
        const condition = Math.round((0.3 + Math.random() * 0.7) * 100) / 100;

        const isTestHQItem = base.name === 'Walkman Sony' || Math.random() < 0.3;

        return {
            id: ++itemIdCounter,
            name: base.name,
            category,
            baseValue: base.baseValue,
            rarity: rarity.name,
            rarityMultiplier: rarity.multiplier,
            rarityColor: rarity.color,
            textureKey: rarity.textureKey,
            textureHQ: isTestHQItem ? 'item_novedad_hq' : null,
            condition,
            conditionLabel: this.getConditionLabel(condition),
            demand: 1.0
        };
    }

    /**
     * Generate multiple items
     */
    static generateItems(count, category = null, playerLevel = 1) {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push(this.generateItem(category, playerLevel, 0));
        }
        return items;
    }

    /**
     * Roll for rarity dynamically based on level
     */
    static rollRarity(playerLevel = 1, rarityShift = 0) {
        // Subtract rarityShift to increase chances of higher rarity thresholds
        const roll = Math.random() - rarityShift;
        let thresholds = [];
        
        if (playerLevel === 1) thresholds = [0.85, 0.98, 0.997, 1.0];
        else if (playerLevel === 2) thresholds = [0.65, 0.90, 0.98, 1.0];
        else if (playerLevel === 3) thresholds = [0.45, 0.80, 0.95, 1.0];
        else if (playerLevel === 4) thresholds = [0.30, 0.65, 0.90, 1.0];
        else thresholds = [0.20, 0.50, 0.85, 1.0];

        if (roll < thresholds[0]) return RARITY_TABLE[0];
        if (roll < thresholds[1]) return RARITY_TABLE[1];
        if (roll < thresholds[2]) return RARITY_TABLE[2];
        return RARITY_TABLE[3];
    }

    /**
     * Get human-readable condition label
     */
    static getConditionLabel(condition) {
        for (const cl of CONDITION_LABELS) {
            if (condition >= cl.min && condition <= cl.max) return cl.label;
        }
        return 'Desconocido';
    }

    /**
     * Calculate the true value of an item
     */
    static calculateTrueValue(item) {
        return Math.round(item.baseValue * item.rarityMultiplier * item.condition * item.demand);
    }

    /**
     * Get all available categories
     */
    static getCategories() {
        return Object.keys(ITEM_CATALOG);
    }

    /**
     * Get catalog size
     */
    static getCatalogSize() {
        let total = 0;
        for (const items of Object.values(ITEM_CATALOG)) {
            total += items.length;
        }
        return total;
    }
}
