// ============================================================
// DayCycle — Day lifecycle orchestration
// Manages: day advance, event rolling, deal result processing,
//          objective reward application
// Returns pure data — scenes render the results.
// ============================================================

import { STATE_KEYS, getState } from '../core/GameState.js';

/**
 * Advance the game by one day:
 * - increment day counter
 * - advance economy
 * - roll for events
 * - store event modifiers
 *
 * @param {Phaser.Data.DataManager} registry
 * @param {EconomySystem} economySystem
 * @param {MarketEvents} marketEvents
 * @returns {{ day: number, economySnapshot: object, eventResult: object, eventMods: object }}
 */
export function advanceDay(registry, economySystem, marketEvents) {
    let currentDay = getState(registry, STATE_KEYS.CURRENT_DAY);
    currentDay++;
    registry.set(STATE_KEYS.CURRENT_DAY, currentDay);

    const economySnapshot = economySystem.advanceDay();
    const eventResult = marketEvents.advanceDay(currentDay);

    // Store flattened event modifiers for downstream systems
    const eventMods = marketEvents.getActiveModifiers();
    registry.set(STATE_KEYS.EVENT_MODIFIERS, eventMods);

    return { day: currentDay, economySnapshot, eventResult, eventMods };
}

/**
 * Check for initial events at scene start (day 1).
 *
 * @param {Phaser.Data.DataManager} registry
 * @param {MarketEvents} marketEvents
 * @returns {{ newEvent: object|null }}
 */
export function checkInitialEvents(registry, marketEvents) {
    const currentDay = getState(registry, STATE_KEYS.CURRENT_DAY);
    const result = marketEvents.advanceDay(currentDay);
    return { newEvent: result.newEvent || null };
}

/**
 * Consume a pending deal result from the registry.
 * Records the event with ObjectiveManager.
 *
 * @param {Phaser.Data.DataManager} registry
 * @param {ObjectiveManager} objectiveManager
 * @returns {{ hasDeal: boolean, dealResult: object|null }}
 */
export function processPendingDeal(registry, objectiveManager) {
    const dealResult = registry.get(STATE_KEYS.LAST_DEAL_RESULT);
    if (dealResult) {
        objectiveManager.recordEvent('deal', dealResult);
        registry.set(STATE_KEYS.LAST_DEAL_RESULT, null);
        return { hasDeal: true, dealResult };
    }
    return { hasDeal: false, dealResult: null };
}

/**
 * Check and apply rewards from completed objectives.
 *
 * @param {Phaser.Data.DataManager} registry
 * @param {ObjectiveManager} objectiveManager
 * @returns {Array} completed objectives list
 */
export function processObjectiveRewards(registry, objectiveManager) {
    const completed = objectiveManager.checkObjectives();
    if (completed.length === 0) return [];

    for (const obj of completed) {
        if (obj.reward.money) {
            const current = getState(registry, STATE_KEYS.PLAYER_MONEY);
            registry.set(STATE_KEYS.PLAYER_MONEY, current + obj.reward.money);
        }
        if (obj.reward.reputation) {
            const rep = getState(registry, STATE_KEYS.PLAYER_REPUTATION);
            registry.set(STATE_KEYS.PLAYER_REPUTATION, rep + obj.reward.reputation);
        }
    }

    return completed;
}
