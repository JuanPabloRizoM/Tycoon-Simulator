// ============================================================
// BargainEngine — Motor de Regateo/Negociación V2
// - NPC-specific patience (hidden maxRounds per type)
// - Slightly more stubborn NPCs
// - Type-specific dialogue and behaviors
// - NPC personality affects responses
// ============================================================

import { EMOTIONAL_STATES, BARGAIN_TYPE_CONFIG, TYPE_DIALOGUES } from '../data/dialogues.js';

export class BargainEngine {
    constructor() {
        this.currentNPC = null;
        this.currentItem = null;
        this.round = 0;
        this.patience = 100;
        this.maxPatience = 100;
        this.flexibility = 0.2;
        this.lastNPCOffer = 0;
        this.history = [];
        this.isPlayerSelling = true;
        this.npcTrait = '';
    }

    startNegotiation(npc, item, isPlayerSelling = true, eventMods = null) {
        this.currentNPC = npc;
        this.currentItem = item;
        this.round = 0;
        this.history = [];
        this.isPlayerSelling = isPlayerSelling;

        // Set NPC-specific patience and flexibility
        const cfg = BARGAIN_TYPE_CONFIG[npc.type] || BARGAIN_TYPE_CONFIG.cliente_normal;
        this.maxPatience = Math.floor(cfg.patience[0] + Math.random() * (cfg.patience[1] - cfg.patience[0]));
        this.flexibility = cfg.flex[0] + Math.random() * (cfg.flex[1] - cfg.flex[0]);

        // Apply event modifiers (clamped by MarketEvents.getActiveModifiers)
        if (eventMods) {
            if (eventMods.patienceMod) this.maxPatience += eventMods.patienceMod;
            if (eventMods.flexMod) this.flexibility = Math.max(0, this.flexibility + eventMods.flexMod);
        }
        this.patience = this.maxPatience;

        // Get NPC trait text
        const dialogues = TYPE_DIALOGUES[npc.type] || TYPE_DIALOGUES.cliente_normal;
        this.npcTrait = dialogues.trait || '';

        // Calculate NPC's perceived value and their target price
        const perceivedValue = this.calculatePerceivedValue(item, npc);
        const targetPrice = this.calculateTargetPrice(perceivedValue, npc, isPlayerSelling);

        // NPC's initial offer
        let initialOffer;
        if (isPlayerSelling) {
            // NPC is buying → starts lower than target price
            const range = cfg.offerRange?.buy || [0.4, 0.7];
            initialOffer = Math.round(targetPrice * (range[0] + Math.random() * (range[1] - range[0])));
        } else {
            // NPC is selling → starts higher than target price
            const range = cfg.offerRange?.sell || [1.4, 1.8];
            initialOffer = Math.round(targetPrice * (range[0] + Math.random() * (range[1] - range[0])));
        }
        
        this.lastNPCOffer = initialOffer;

        this.history.push({
            round: 0,
            type: 'npc_offer',
            amount: initialOffer,
            emotion: npc.emotionalState
        });

        return {
            npcOffer: initialOffer,
            perceivedValue: Math.round(perceivedValue),
            targetPrice: Math.round(targetPrice),
            emotion: npc.emotionalState,
            patience: this.patience,
            maxPatience: this.maxPatience,
            npcTrait: this.npcTrait
        };
    }

    calculatePerceivedValue(item, npc) {
        const cfg = BARGAIN_TYPE_CONFIG[npc.type] || BARGAIN_TYPE_CONFIG.cliente_normal;
        const raritySens = cfg.raritySensitivity || 1.0;
        const adjustedRarity = Math.pow(item.rarityMultiplier || 1, raritySens);
        
        const trueValue = item.baseValue * adjustedRarity * item.condition;
        return trueValue * npc.knowledge;
    }

    calculateTargetPrice(perceivedValue, npc, isPlayerSelling) {
        // If NPC is buying (player is selling): Greed lowers target price. Patience lowers it (can wait for better deal).
        if (isPlayerSelling) {
            return perceivedValue * (1.0 - (npc.greed * 0.3) - (npc.patience * 0.2));
        } else {
            // If NPC is selling: Greed raises target price. Patience raises it (can wait to sell).
            return perceivedValue * (1.0 + (npc.greed * 0.4) + (npc.patience * 0.2));
        }
    }

    getRandomDialogue(type, category) {
        const dialogues = TYPE_DIALOGUES[type] || TYPE_DIALOGUES.cliente_normal;
        const pool = dialogues[category] || ['"..."'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    evaluateOffer(playerOffer) {
        if (!this.currentNPC || !this.currentItem) {
            return { result: 'error', message: 'No active negotiation' };
        }

        this.round++;
        const npc = this.currentNPC;
        const item = this.currentItem;

        this.history.push({
            round: this.round,
            type: 'player_offer',
            amount: playerOffer,
            emotion: npc.emotionalState
        });

        const perceivedValue = this.calculatePerceivedValue(item, npc);
        const targetPrice = this.calculateTargetPrice(perceivedValue, npc, this.isPlayerSelling);

        let result;

        if (this.isPlayerSelling) {
            result = this.evaluateSellingOffer(playerOffer, targetPrice, perceivedValue, npc);
        } else {
            result = this.evaluateBuyingOffer(playerOffer, targetPrice, perceivedValue, npc);
        }

        this.updateEmotion(npc, result);

        this.history.push({
            round: this.round,
            type: 'npc_response',
            result: result.result,
            reason: result.reason,
            amount: result.counterOffer || playerOffer,
            emotion: npc.emotionalState
        });

        // Check if patience is depleted or negotiation failed
        if (this.patience <= 0 || result.result === 'walk_away') {
            result.result = 'walk_away';
            const walkMsg = this.getRandomDialogue(npc.type, 'walkAway');
            result.message = `${npc.name}: ${walkMsg}`;
            npc.emotionalState = 'enojado';
            this.patience = 0;
        }

        if (result.counterOffer) {
            this.lastNPCOffer = result.counterOffer;
        }

        return {
            ...result,
            reason: result.reason,
            round: this.round,
            patience: this.patience,
            maxPatience: this.maxPatience,
            emotion: npc.emotionalState,
            perceivedValue: Math.round(perceivedValue),
            targetPrice: Math.round(targetPrice)
        };
    }

    calculatePatienceDamage(deltaRatio, npcType) {
        let baseDamage = 0;
        const cfg = BARGAIN_TYPE_CONFIG[npcType] || BARGAIN_TYPE_CONFIG.cliente_normal;
        const damageMult = cfg.patienceDamageMult || 1.0;

        if (deltaRatio <= 0.05) {
            if (npcType === 'turista') return -(Math.floor(Math.random() * 4) + 1);
            baseDamage = Math.floor(Math.random() * 3) + 1;
        } else if (deltaRatio <= 0.25) {
            baseDamage = 5 + Math.floor(Math.random() * 8);
        } else if (deltaRatio <= 0.5) {
            baseDamage = 15 + Math.floor(Math.random() * 10);
        } else {
            baseDamage = 30 + Math.floor(Math.random() * 15);
        }
        
        const rawDamage = baseDamage + (Math.floor(Math.random() * 5) - 2);
        return Math.max(0, Math.round(rawDamage * damageMult));
    }

    evaluateSellingOffer(playerOffer, targetPrice, perceivedValue, npc) {
        // targetPrice is the ideal price for the NPC when buying
        // They will flex up to a maximum
        let maxAcceptable = targetPrice * (1 + this.flexibility);
        
        if (playerOffer <= maxAcceptable) {
            const msg = this.getRandomDialogue(npc.type, 'accept');
            return {
                result: 'accept',
                reason: 'accepted',
                finalPrice: playerOffer,
                message: `${npc.name}: ${msg}`
            };
        }

        const deltaRatio = (playerOffer - maxAcceptable) / targetPrice;
        const damage = this.calculatePatienceDamage(deltaRatio, npc.type);
        this.patience = Math.max(0, this.patience - damage);

        if (this.patience <= 0) {
            return { result: 'walk_away', reason: 'patience_exhausted' };
        }

        const gap = playerOffer - this.lastNPCOffer;
        const cfg = BARGAIN_TYPE_CONFIG[npc.type] || BARGAIN_TYPE_CONFIG.cliente_normal;
        const tolerance = cfg.insultTolerance || 0.35;
        
        if (deltaRatio <= tolerance) {
            let concession = gap * this.flexibility;
            if (this.patience < this.maxPatience * 0.4) {
                concession *= 0.5; 
            }
            const counter = Math.floor(this.lastNPCOffer + concession);
            const safeCounter = Math.min(counter, maxAcceptable);

            if (safeCounter > this.lastNPCOffer + 1) {
                const msg = this.getRandomDialogue(npc.type, 'counter').replace('%PRICE%', safeCounter);
                return {
                    result: 'counter',
                    reason: 'counter',
                    counterOffer: safeCounter,
                    message: `${npc.name}: ${msg}`
                };
            }
        }

        const msgType = (deltaRatio > tolerance) ? 'unseriousReject' : 'reject';
        const msg = this.getRandomDialogue(npc.type, msgType);
        return {
            result: 'reject',
            reason: (deltaRatio > tolerance) ? 'price_too_high' : 'budget_exceeded',
            message: `${npc.name}: ${msg}`
        };
    }

    evaluateBuyingOffer(playerOffer, targetPrice, perceivedValue, npc) {
        // targetPrice is the ideal price for the NPC when selling
        // They will flex down to a minimum
        let minAcceptable = Math.max(targetPrice * (1 - this.flexibility), perceivedValue * 0.9);

        if (playerOffer >= minAcceptable) {
            const msg = this.getRandomDialogue(npc.type, 'accept');
            return {
                result: 'accept',
                reason: 'accepted',
                finalPrice: playerOffer,
                message: `${npc.name}: ${msg}`
            };
        }

        const deltaRatio = (minAcceptable - playerOffer) / targetPrice;
        const damage = this.calculatePatienceDamage(deltaRatio, npc.type);
        this.patience = Math.max(0, this.patience - damage);

        if (this.patience <= 0) {
            return { result: 'walk_away', reason: 'patience_exhausted' };
        }

        const gap = this.lastNPCOffer - playerOffer;
        const cfg = BARGAIN_TYPE_CONFIG[npc.type] || BARGAIN_TYPE_CONFIG.cliente_normal;
        const tolerance = cfg.insultTolerance || 0.35;
        
        if (deltaRatio <= tolerance) {
            let concession = gap * this.flexibility;
            if (this.patience < this.maxPatience * 0.4) {
                concession *= 0.5; 
            }
            const counter = Math.floor(this.lastNPCOffer - concession);
            const safeCounter = Math.max(counter, minAcceptable);

            if (safeCounter < this.lastNPCOffer - 1) {
                const msg = this.getRandomDialogue(npc.type, 'counter').replace('%PRICE%', safeCounter);
                return {
                    result: 'counter',
                    reason: 'counter',
                    counterOffer: safeCounter,
                    message: `${npc.name}: ${msg}`
                };
            }
        }

        const msgType = (deltaRatio > tolerance) ? 'unseriousReject' : 'reject';
        const msg = this.getRandomDialogue(npc.type, msgType);
        return {
            result: 'reject',
            reason: 'price_too_low',
            message: `${npc.name}: ${msg}`
        };
    }

    updateEmotion(npc, negotiationResult) {
        if (negotiationResult.result === 'accept') {
            npc.emotionalState = 'interesado';
            return;
        }

        const patienceRatio = this.patience / this.maxPatience;

        if (patienceRatio > 0.65) {
            npc.emotionalState = 'neutral';
        } else if (patienceRatio > 0.35) {
            npc.emotionalState = 'dudoso';
        } else if (patienceRatio > 0.1) {
            npc.emotionalState = 'molesto';
        } else {
            npc.emotionalState = 'enojado';
        }
    }

    acceptLastOffer() {
        const lastNPCOffer = [...this.history]
            .reverse()
            .find(h => h.type === 'npc_response' || h.type === 'npc_offer');

        if (!lastNPCOffer) return { result: 'error' };

        return {
            result: 'accept',
            reason: 'accepted',
            finalPrice: lastNPCOffer.amount,
            message: `¡Trato hecho por $${lastNPCOffer.amount}!`,
            emotion: 'interesado'
        };
    }

    getSummary() {
        return {
            npc: this.currentNPC,
            item: this.currentItem,
            rounds: this.round,
            history: this.history,
            isPlayerSelling: this.isPlayerSelling
        };
    }

    walkAway() {
        return {
            result: 'walk_away',
            reason: 'player_walked_away',
            message: 'Te alejaste de la negociación.',
            npc: this.currentNPC
        };
    }
}
