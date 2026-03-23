// ============================================================
// MarketEvents — Eventos aleatorios del mercado
// Cada día tiene 30% probabilidad de evento global
// ============================================================

import { EVENT_DEFINITIONS, EVENT_WEIGHTS, EVENT_PROBABILITY } from '../data/events.js';
import { weightedRandom } from '../core/utils.js';

export class MarketEvents {
    constructor(economySystem) {
        this.economy = economySystem;
        this.activeEvents = [];
        this.eventLog = [];
    }

    /**
     * Check for new events when advancing a day
     */
    advanceDay(currentDay) {
        // Remove expired events and revert their effects
        const expired = this.activeEvents.filter(e => e.dayEnd <= currentDay);
        for (const event of expired) {
            this.revertEvent(event);
        }
        this.activeEvents = this.activeEvents.filter(e => e.dayEnd > currentDay);

        // Check for new event
        let newEvent = null;
        if (Math.random() < EVENT_PROBABILITY) {
            newEvent = this.generateEvent(currentDay);
            this.activeEvents.push(newEvent);
            this.applyEvent(newEvent);
            this.eventLog.push(newEvent);
        }

        return {
            newEvent,
            activeEvents: [...this.activeEvents],
            expired
        };
    }

    /**
     * Generate a random market event
     */
    generateEvent(currentDay) {
        const types = Object.keys(EVENT_WEIGHTS);
        const weights = Object.values(EVENT_WEIGHTS);
        const type = weightedRandom(types, weights);
        const def = EVENT_DEFINITIONS[type];

        const duration = def.duration[0] + Math.floor(
            Math.random() * (def.duration[1] - def.duration[0] + 1)
        );

        return {
            id: `event_${currentDay}_${type}`,
            type,
            ...def,
            dayStart: currentDay,
            dayEnd: currentDay + duration,
            duration
        };
    }

    /**
     * Apply event effects to the economy
     */
    applyEvent(event) {
        if (event.category) {
            this.economy.applyEventModifier(event.category, event.demandModifier);
        } else {
            // Global event — affects all categories
            for (const cat of Object.keys(this.economy.categories)) {
                this.economy.applyEventModifier(cat, event.demandModifier * 0.5);
            }
        }
    }

    /**
     * Revert event effects
     */
    revertEvent(event) {
        if (event.category) {
            this.economy.applyEventModifier(event.category, -event.demandModifier);
        } else {
            for (const cat of Object.keys(this.economy.categories)) {
                this.economy.applyEventModifier(cat, -event.demandModifier * 0.5);
            }
        }
    }

    /**
     * Get all active events
     */
    getActiveEvents() {
        return [...this.activeEvents];
    }

    /**
     * Check if a specific event type is active
     */
    isEventActive(eventType) {
        return this.activeEvents.some(e => e.type === eventType);
    }

    /**
     * Get flattened, clamped modifiers from all active events
     * Safe for downstream consumption — prevents extreme stacking
     */
    getActiveModifiers() {
        const mods = {
            spawnWeightOverrides: {},
            rarityShift: 0,
            patienceMod: 0,
            flexMod: 0
        };

        for (const event of this.activeEvents) {
            if (event.spawnWeightOverrides) {
                for (const [type, shift] of Object.entries(event.spawnWeightOverrides)) {
                    mods.spawnWeightOverrides[type] = (mods.spawnWeightOverrides[type] || 0) + shift;
                }
            }
            if (event.rarityShift) mods.rarityShift += event.rarityShift;
            if (event.patienceMod) mods.patienceMod += event.patienceMod;
            if (event.flexMod) mods.flexMod += event.flexMod;
        }

        // Clamp to safe ranges
        mods.rarityShift = Math.max(-0.20, Math.min(0.25, mods.rarityShift));
        mods.patienceMod = Math.max(-15, Math.min(20, mods.patienceMod));
        mods.flexMod = Math.max(-0.10, Math.min(0.15, mods.flexMod));
        for (const type of Object.keys(mods.spawnWeightOverrides)) {
            mods.spawnWeightOverrides[type] = Math.max(-0.25, Math.min(0.30, mods.spawnWeightOverrides[type]));
        }

        return mods;
    }
}
