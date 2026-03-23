// ============================================================
// NPCFactory — Generación Procedural de NPCs
// Tipos: coleccionista, turista, revendedor, cliente_normal, estafador
// ============================================================

import { NPC_PROFILES, NPC_NAMES } from '../data/npcs.js';
import { randomRange, weightedRandom } from '../core/utils.js';

let npcIdCounter = 0;

export class NPCFactory {
    static getWeightsForLevel(level) {
        if (level === 1) return { cliente_normal: 0.65, turista: 0.30, revendedor: 0.03, coleccionista: 0.01, estafador: 0.01 };
        if (level === 2) return { cliente_normal: 0.45, turista: 0.30, revendedor: 0.18, coleccionista: 0.02, estafador: 0.05 };
        if (level === 3) return { cliente_normal: 0.30, turista: 0.25, revendedor: 0.30, coleccionista: 0.07, estafador: 0.08 };
        if (level === 4) return { cliente_normal: 0.20, turista: 0.15, revendedor: 0.35, coleccionista: 0.20, estafador: 0.10 };
        return { cliente_normal: 0.15, turista: 0.10, revendedor: 0.35, coleccionista: 0.30, estafador: 0.10 };
    }

    static generateNPC(type = null, playerLevel = 1, spawnOverrides = null) {
        if (!type) {
            const weightsObj = { ...this.getWeightsForLevel(playerLevel) };
            
            // Apply event-driven spawn weight overrides
            if (spawnOverrides) {
                for (const [npcType, shift] of Object.entries(spawnOverrides)) {
                    if (weightsObj[npcType] !== undefined) {
                        weightsObj[npcType] = Math.max(0.01, weightsObj[npcType] + shift);
                    }
                }
                // Re-normalize so weights sum to 1
                const total = Object.values(weightsObj).reduce((s, w) => s + w, 0);
                for (const k of Object.keys(weightsObj)) {
                    weightsObj[k] /= total;
                }
            }
            
            const types = Object.keys(weightsObj);
            const weights = Object.values(weightsObj);
            type = weightedRandom(types, weights);
        }

        const profile = NPC_PROFILES[type];
        const names = NPC_NAMES[type];
        const name = names[Math.floor(Math.random() * names.length)];

        // Adjust budget based on player level
        const budgetMultiplier = 1 + (playerLevel - 1) * 0.3;

        // Generate offerRange from profile
        const offerRangeMin = Math.round(randomRange(...profile.offerRange) * 100) / 100;
        const offerRangeMax = Math.round(Math.min(offerRangeMin + randomRange(0.1, 0.25), 1.0) * 100) / 100;

        return {
            id: ++npcIdCounter,
            name,
            type,
            description: profile.description,
            patience: Math.round(randomRange(...profile.patience) * 100) / 100,
            greed: Math.round(randomRange(...profile.greed) * 100) / 100,
            knowledge: Math.round(randomRange(...profile.knowledge) * 100) / 100,
            ego: Math.round(randomRange(...profile.ego) * 100) / 100,
            risk: Math.round(randomRange(...profile.risk) * 100) / 100,
            budget: Math.round(randomRange(...profile.budget) * budgetMultiplier),
            offerRange: [offerRangeMin, offerRangeMax],
            mood: 'neutral',
            emotionalState: 'neutral',
            interactionCount: 0,
            texture: type === 'regateador' ? 'npc_cliente_normal_neutral' : (['turista', 'revendedor', 'coleccionista', 'cliente_normal', 'estafador'].includes(type) ? `npc_${type}_neutral` : `npc_${type}`)
        };
    }

    static getProfile(type) {
        return NPC_PROFILES[type] || null;
    }

    static getAllTypes() {
        return Object.keys(NPC_PROFILES);
    }
}
