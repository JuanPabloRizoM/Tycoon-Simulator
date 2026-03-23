// ============================================================
// NegotiationFlow — Orchestrates negotiation business logic
// The scene calls this; it never decides rules itself.
// Returns structured outcomes for the scene to render.
// ============================================================

import { STATE_KEYS, getState } from '../core/GameState.js';

/**
 * Process a player offer through the bargain engine.
 * Returns a structured result the scene can render without making business decisions.
 *
 * @param {object} params
 * @param {BargainEngine} params.engine
 * @param {number} params.amount - Player's offer
 * @param {boolean} params.isPlayerBuying
 * @param {number} params.playerMoney
 * @param {string} params.npcName
 * @returns {{ type: string, message?: string, counterOffer?: number, finalPrice?: number, patience?: number, maxPatience?: number, emotion?: string, error?: string }}
 */
export function processOffer({ engine, amount, isPlayerBuying, playerMoney, npcName }) {
    // Validation: can the player afford this?
    if (isPlayerBuying && amount > playerMoney) {
        return { type: 'validation_error', error: '¡No tienes suficiente dinero!' };
    }

    if (amount <= 0 || isNaN(amount)) {
        return { type: 'validation_error', error: 'Ingresa un precio válido mayor a $0.' };
    }

    const result = engine.evaluateOffer(amount);

    // Find last NPC offer from engine history
    const lastNPCOffer = [...engine.history]
        .reverse()
        .find(h => h.type === 'npc_response' || h.type === 'npc_offer');

    // Normalize the NPC message (strip "Name: " prefix if engine added it)
    const cleanMessage = result.message
        ? result.message.replace(`${npcName}: `, '')
        : '';

    return {
        type: result.result,  // 'accept' | 'counter' | 'reject' | 'walk_away'
        reason: result.reason,
        message: cleanMessage,
        counterOffer: result.counterOffer || null,
        finalPrice: result.finalPrice || null,
        lastNPCOffer: lastNPCOffer ? lastNPCOffer.amount : null,
        patience: result.patience,
        maxPatience: result.maxPatience,
        emotion: result.emotion
    };
}

/**
 * Accept the current NPC offer.
 * @param {BargainEngine} engine
 * @returns {{ type: string, finalPrice?: number, message?: string }}
 */
export function acceptCurrentOffer(engine) {
    const result = engine.acceptLastOffer();
    if (result.result === 'accept') {
        return {
            type: 'accept',
            finalPrice: result.finalPrice,
            message: result.message
        };
    }
    return { type: 'error', message: 'No hay oferta activa para aceptar.' };
}

/**
 * Resolve a completed deal: update money, inventory, transaction, deal result.
 * Pure state mutation — no rendering.
 *
 * @param {object} params
 * @param {Phaser.Data.DataManager} params.registry
 * @param {number} params.price - Agreed price
 * @param {boolean} params.isPlayerBuying
 * @param {number} params.playerMoney - Current money before deal
 * @param {object} params.itemData
 * @param {object} params.npcData
 * @param {object} params.inventoryManager
 * @param {object} params.economySystem
 * @returns {{ newMoney: number, dealMessage: string, dealProfit: number }}
 */
export function resolveDeal({ registry, price, isPlayerBuying, playerMoney, itemData, npcData, inventoryManager, economySystem }) {
    let newMoney;
    let dealMessage;

    if (isPlayerBuying) {
        newMoney = playerMoney - price;
        inventoryManager.addItem(itemData, price);
        dealMessage = `Compraste ${itemData.name} por $${price}`;
    } else {
        newMoney = playerMoney + price;
        const totalEarnings = (getState(registry, STATE_KEYS.TOTAL_EARNINGS)) + price;
        registry.set(STATE_KEYS.TOTAL_EARNINGS, totalEarnings);
        dealMessage = `Vendiste ${itemData.name} por $${price}`;
    }

    // Update player money in registry
    registry.set(STATE_KEYS.PLAYER_MONEY, newMoney);

    // Record in economy system
    economySystem.recordTransaction(itemData, isPlayerBuying ? 'buy' : 'sell');

    // Store deal result for ObjectiveManager pickup
    const dealProfit = isPlayerBuying ? 0 : price;
    registry.set(STATE_KEYS.LAST_DEAL_RESULT, {
        npcType: npcData.type,
        profit: dealProfit,
        finalEmotion: npcData.emotionalState || 'neutral',
        isPlayerBuying
    });

    return { newMoney, dealMessage, dealProfit };
}
