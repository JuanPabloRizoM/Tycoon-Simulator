// ============================================================
// ObjectiveManager — Milestone tracking and rewards
// Tracks player progress across deals, profit, upgrades,
// and negotiation quality. Rewards include money, temporary
// bonuses, and reputation.
// ============================================================

import { STATE_KEYS } from '../core/GameState.js';

const OBJECTIVE_DEFINITIONS = {
    first_sale: {
        name: 'Primera Venta',
        description: 'Completa tu primera negociación exitosa.',
        icon: '🤝',
        condition: (stats) => stats.dealsCompleted >= 1,
        reward: { money: 50, type: 'money' },
        rewardText: '+$50'
    },
    haggle_master_10: {
        name: 'Regateador',
        description: 'Gana 10 negociaciones.',
        icon: '💪',
        condition: (stats) => stats.dealsCompleted >= 10,
        reward: { money: 200, reputation: 1, type: 'money_and_rep' },
        rewardText: '+$200, +1 Reputación'
    },
    profit_500: {
        name: 'Comerciante',
        description: 'Acumula $500 en ganancias totales.',
        icon: '💰',
        condition: (stats) => stats.totalProfit >= 500,
        reward: { money: 100, type: 'money' },
        rewardText: '+$100'
    },
    profit_2000: {
        name: 'Negociante Serio',
        description: 'Acumula $2000 en ganancias totales.',
        icon: '🏦',
        condition: (stats) => stats.totalProfit >= 2000,
        reward: { money: 300, reputation: 2, type: 'money_and_rep' },
        rewardText: '+$300, +2 Reputación'
    },
    items_sold_20: {
        name: 'Vendedor Activo',
        description: 'Vende 20 objetos.',
        icon: '📦',
        condition: (stats) => stats.itemsSold >= 20,
        reward: { money: 150, tempBonus: { patienceMod: 5, duration: 3 }, type: 'money_and_bonus' },
        rewardText: '+$150, Paciencia +5 por 3 días'
    },
    upgrade_stall_3: {
        name: 'Puesto Mejorado',
        description: 'Mejora tu puesto al Nivel 3.',
        icon: '🔧',
        condition: (stats) => stats.stallLevel >= 3,
        reward: { money: 250, type: 'money' },
        rewardText: '+$250'
    },
    upgrade_stall_5: {
        name: 'Negocio Establecido',
        description: 'Mejora tu puesto al Nivel 5.',
        icon: '🏪',
        condition: (stats) => stats.stallLevel >= 5,
        reward: { money: 500, reputation: 3, type: 'money_and_rep' },
        rewardText: '+$500, +3 Reputación'
    },
    survive_scammer: {
        name: 'Sobreviviste al Estafador',
        description: 'Cierra un trato con un estafador sin perder dinero.',
        icon: '🛡️',
        condition: (stats) => stats.scammerDeals >= 1,
        reward: { money: 100, tempBonus: { flexMod: 0.03, duration: 2 }, type: 'money_and_bonus' },
        rewardText: '+$100, Flexibilidad +3% por 2 días'
    },
    tough_negotiator: {
        name: 'Negociador Duro',
        description: 'Gana 5 negociaciones donde el cliente estaba molesto o enojado.',
        icon: '🔥',
        condition: (stats) => stats.toughWins >= 5,
        reward: { money: 200, reputation: 1, tempBonus: { patienceMod: 3, duration: 3 }, type: 'full' },
        rewardText: '+$200, +1 Rep, Paciencia +3 por 3 días'
    },
    fair_dealer: {
        name: 'Trato Justo',
        description: 'Cierra 10 tratos donde el cliente se fue "interesado" (con paciencia alta).',
        icon: '⭐',
        condition: (stats) => stats.fairDeals >= 10,
        reward: { money: 150, reputation: 2, type: 'money_and_rep' },
        rewardText: '+$150, +2 Reputación'
    }
};

export class ObjectiveManager {
    constructor(registry) {
        this.registry = registry;
        this.stats = {
            dealsCompleted: 0,
            totalProfit: 0,
            itemsSold: 0,
            stallLevel: registry.get(STATE_KEYS.PLAYER_LEVEL) || 1,
            scammerDeals: 0,
            toughWins: 0,   // Deals won with NPC at molesto/enojado
            fairDeals: 0    // Deals won with NPC still at interesado/neutral
        };
        this.completed = new Set();
        this.activeBonuses = []; // Temporary gameplay bonuses from rewards
    }

    /**
     * Record a game event and update stats
     * @param {string} eventType - 'deal', 'upgrade', 'day'
     * @param {object} data - Event-specific data
     */
    recordEvent(eventType, data = {}) {
        switch (eventType) {
            case 'deal':
                this.stats.dealsCompleted++;
                this.stats.itemsSold++;
                if (data.profit) this.stats.totalProfit += data.profit;
                if (data.npcType === 'estafador' && data.profit >= 0) {
                    this.stats.scammerDeals++;
                }
                if (data.finalEmotion === 'molesto' || data.finalEmotion === 'enojado') {
                    this.stats.toughWins++;
                }
                if (data.finalEmotion === 'interesado' || data.finalEmotion === 'neutral') {
                    this.stats.fairDeals++;
                }
                break;
            case 'upgrade':
                this.stats.stallLevel = data.level || this.stats.stallLevel;
                break;
            case 'day':
                // Expire temporary bonuses
                this.activeBonuses = this.activeBonuses
                    .map(b => ({ ...b, daysLeft: b.daysLeft - 1 }))
                    .filter(b => b.daysLeft > 0);
                break;
        }
    }

    /**
     * Check all objectives and return newly completed ones
     * @returns {Array} List of newly completed objective definitions
     */
    checkObjectives() {
        const newlyCompleted = [];

        for (const [id, def] of Object.entries(OBJECTIVE_DEFINITIONS)) {
            if (this.completed.has(id)) continue;
            if (def.condition(this.stats)) {
                this.completed.add(id);
                newlyCompleted.push({ id, ...def });

                // Activate temporary bonus if present
                if (def.reward.tempBonus) {
                    this.activeBonuses.push({
                        ...def.reward.tempBonus,
                        daysLeft: def.reward.tempBonus.duration,
                        source: id
                    });
                }
            }
        }

        return newlyCompleted;
    }

    /**
     * Get the flattened active bonus modifiers (from objective rewards)
     * These stack with market event modifiers
     */
    getActiveBonuses() {
        const bonuses = { patienceMod: 0, flexMod: 0 };
        for (const b of this.activeBonuses) {
            if (b.patienceMod) bonuses.patienceMod += b.patienceMod;
            if (b.flexMod) bonuses.flexMod += b.flexMod;
        }
        // Soft cap
        bonuses.patienceMod = Math.min(15, bonuses.patienceMod);
        bonuses.flexMod = Math.min(0.10, bonuses.flexMod);
        return bonuses;
    }

    /**
     * Get all objectives with their current states
     */
    getAll() {
        return Object.entries(OBJECTIVE_DEFINITIONS).map(([id, def]) => ({
            id,
            ...def,
            completed: this.completed.has(id),
            progress: this.getProgress(id, def)
        }));
    }

    /**
     * Get progress info for a specific objective
     */
    getProgress(id, def) {
        switch (id) {
            case 'first_sale': return `${Math.min(this.stats.dealsCompleted, 1)}/1`;
            case 'haggle_master_10': return `${Math.min(this.stats.dealsCompleted, 10)}/10`;
            case 'profit_500': return `$${Math.min(this.stats.totalProfit, 500)}/$500`;
            case 'profit_2000': return `$${Math.min(this.stats.totalProfit, 2000)}/$2000`;
            case 'items_sold_20': return `${Math.min(this.stats.itemsSold, 20)}/20`;
            case 'upgrade_stall_3': return `Nivel ${Math.min(this.stats.stallLevel, 3)}/3`;
            case 'upgrade_stall_5': return `Nivel ${Math.min(this.stats.stallLevel, 5)}/5`;
            case 'survive_scammer': return `${Math.min(this.stats.scammerDeals, 1)}/1`;
            case 'tough_negotiator': return `${Math.min(this.stats.toughWins, 5)}/5`;
            case 'fair_dealer': return `${Math.min(this.stats.fairDeals, 10)}/10`;
            default: return '';
        }
    }
}
