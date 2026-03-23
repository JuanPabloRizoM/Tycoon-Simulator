// ============================================================
// TianguisScene — Escena principal del tianguis
// VERSIÓN 2: Escenario más vivo con decoraciones, personajes
// animados y puestos realistas
// ============================================================

import { NPCManager } from '../npc/NPCManager.js?v=6';
import { EconomySystem } from '../economy/EconomySystem.js?v=6';
import { MarketEvents } from '../economy/MarketEvents.js?v=6';
import { ObjectiveManager } from '../economy/ObjectiveManager.js?v=6';
import { InventoryManager } from '../inventory/InventoryManager.js?v=6';
import { ObjectFactory } from '../inventory/ObjectFactory.js?v=6';
import { HUD } from '../ui/HUD.js?v=6';
import { STATE_KEYS, getState } from '../core/GameState.js?v=6';
import { drawBackground, placeDecorations, createAmbientEffects } from '../ui/TianguisRenderer.js?v=6';
import { advanceDay as dayCycleAdvance, checkInitialEvents as dayCycleCheckEvents, processPendingDeal, processObjectiveRewards } from '../systems/DayCycle.js?v=6';
import { toggleInventory } from '../ui/InventoryPanel.js?v=6';
import { showMarketInfo } from '../ui/MarketInfoPanel.js?v=6';
import { toggleUpgrades } from '../ui/UpgradesPanel.js?v=6';
import { createUIButtons } from '../ui/TianguisButtons.js?v=6';
import { drawPlayerStall } from '../ui/PlayerStallRenderer.js?v=6';
import { TelemetryTracker } from '../core/TelemetryTracker.js?v=6';
import { showDaySummary } from '../ui/DaySummaryPanel.js?v=6';
import { THEME, drawRusticCard } from '../ui/Theme.js?v=6';

export class TianguisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TianguisScene' });
        this.economySystem = null;
        this.marketEvents = null;
        this.objectiveManager = null;
        this.inventoryManager = null;
        this.npcManager = null;
        this.hud = null;
        this.hud = null;
        this.selectedNPC = null;
        this.showingInventory = false;
        this.isTransitioning = false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Reset camera on start/restart
        this.cameras.main.resetFX();
        this.cameras.main.setAlpha(1);
        this.cameras.main.setBackgroundColor(0x87CEEB);

        // Initialize systems
        this.economySystem = new EconomySystem();
        this.marketEvents = new MarketEvents(this.economySystem);
        this.objectiveManager = new ObjectiveManager(this.registry);
        this.inventoryManager = new InventoryManager(getState(this.registry, STATE_KEYS.UPG_CAPACITY));

        // --- HUD (Must be ready before processing deal results below!) ---
        this.hud = new HUD(this);
        this.hud.create();
        this.hud.update(this.getGameState());

        // Process any pending deal result from NegotiationScene (Safe now that HUD is ready)
        this.processPendingDealResult();

        // --- Draw tianguis background (delegated to TianguisRenderer) ---
        const bgResult = drawBackground(this, width, height);
        this.clouds = bgResult.clouds;

        // --- Place decorations (delegated to TianguisRenderer) ---
        placeDecorations(this, width, height);

        // --- Place market stalls ---
        this.placeStalls();

        // --- Player's stall (delegated to PlayerStallRenderer) ---
        const visualLevel = getState(this.registry, STATE_KEYS.UPG_VISUAL);
        drawPlayerStall(this, width, height, visualLevel);

        // --- Ambient particles (delegated to TianguisRenderer) ---
        createAmbientEffects(this, width, height);

        // --- NPC Manager ---
        this.npcManager = new NPCManager(this);
        this.npcManager.init();

        // --- UI Buttons (delegated to TianguisButtons) ---
        createUIButtons(this, width, height, {
            onInventory:   () => { if (!this.isTransitioning) toggleInventory(this, this.inventoryManager, this.economySystem); },
            onMarket:      () => { if (!this.isTransitioning) showMarketInfo(this, this.economySystem, this.marketEvents); },
            onAdvanceDay:  () => { if (!this.isTransitioning) this.advanceDay(); },
            onUpgrade:     () => { if (!this.isTransitioning) toggleUpgrades(this); }
        });

        // --- NPC click handler ---
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            console.log("[TianguisScene] clicked", gameObject, "isTransitioning?", this.isTransitioning);
            if (this.isTransitioning) return;
            const npcEntry = this.npcManager.activeNPCs.find(n => n.sprite === gameObject);
            console.log("[TianguisScene] npcEntry found:", !!npcEntry, npcEntry?.state);
            if (npcEntry && npcEntry.state !== 'leaving' && npcEntry.state !== 'entering') {
                this.isTransitioning = true;
                this.input.enabled = false; // Disable all scene input
                if (this.npcManager) this.npcManager.hideNPCLabel(); // Clear floating labels
                console.log("[TianguisScene] Calling startNegotiation...");
                this.startNegotiation(npcEntry);
            }
        });

        // --- Day advance timer ---
        this.time.addEvent({
            delay: 60000,
            callback: () => this.advanceDay(),
            loop: true
        });

        // --- Initial Events ---
        this.checkInitialEvents();

        // --- Ambient Loops ---
        this.backgroundShoppers = [];
        this.time.addEvent({
            delay: 4000,
            callback: () => this.trySpawnBackgroundShopper(),
            loop: true
        });

        // Final fadeIn to show everything
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    // drawTianguisBackground → moved to ui/TianguisRenderer.js

    // placeDecorations → moved to ui/TianguisRenderer.js

    placeStalls() {
        const stallPositions = [
            { x: 150, y: 270 }, { x: 350, y: 250 },
            { x: 590, y: 270 }, { x: 810, y: 260 },
            { x: 230, y: 430 }, { x: 470, y: 450 },
            { x: 710, y: 430 },
        ];

        // Tints simulating different colored tarps (faded)
        const stallTints = [
            0xffffff, // normal
            0xffdddd, // faded red
            0xddffdd, // faded green
            0xddddff, // faded blue
            0xffffcc, // faded yellow
            0xffeebb  // faded orange
        ];

        const stallThemes = ['stall_ropa', 'stall_electronica', 'stall_fruta', 'stall_antiguedades'];

        for (const pos of stallPositions) {
            // Pick a random merchandise theme
            const themeKey = stallThemes[Math.floor(Math.random() * stallThemes.length)];
            const stall = this.add.sprite(pos.x, pos.y, themeKey);
            stall.setDepth(pos.y - 10);
            
            // Randomize look
            stall.setScale(0.95 + Math.random() * 0.1);
            stall.setTint(stallTints[Math.floor(Math.random() * stallTints.length)]);

            // Optional attached prop
            if (Math.random() > 0.4 && this.textures.exists('crate')) {
                const isCrate = Math.random() > 0.5;
                const prop = this.add.sprite(
                    pos.x + (Math.random() > 0.5 ? 40 : -40), 
                    pos.y + 20, 
                    isCrate ? 'crate' : 'barrel'
                );
                prop.setScale(0.7);
                prop.setDepth(stall.depth + 1);
            }
        }
    }

    // drawPlayerStall → moved to ui/PlayerStallRenderer.js
    // drawStallUpgrades → moved to ui/StallUpgradeRenderer.js
    // createAmbientEffects → moved to ui/TianguisRenderer.js

    // createUIButtons → moved to ui/TianguisButtons.js

    startNegotiation(npcEntry) {
        try {
            console.log("[TianguisScene] Getting ready to transition...", npcEntry?.data?.name);
            
            if (!npcEntry || !npcEntry.data) {
                throw new Error("Invalid npcEntry provided to startNegotiation");
            }

            const networkLevel = getState(this.registry, STATE_KEYS.UPG_NETWORK);
            const trustLevel = getState(this.registry, STATE_KEYS.UPG_TRUST);
            const eventMods = getState(this.registry, STATE_KEYS.EVENT_MODIFIERS) || {};
            
            const patienceBonus = (trustLevel - 1) * 5 + (eventMods.patienceMod || 0);

            console.log("[TianguisScene] Generating item...");
            const item = ObjectFactory.generateItem(null, networkLevel, eventMods.rarityShift || 0);
            
            if (!item || !item.baseValue) {
                throw new Error("ObjectFactory.generateItem returned an invalid item.");
            }
            
            const isPlayerBuying = Math.random() > 0.4;
            
            const payload = {
                npc: npcEntry.data,
                item,
                isPlayerBuying,
                economySystem: this.economySystem,
                inventoryManager: this.inventoryManager,
                marketEvents: this.marketEvents,
                playerMoney: getState(this.registry, STATE_KEYS.PLAYER_MONEY),
                playerReputation: getState(this.registry, STATE_KEYS.PLAYER_REPUTATION),
                eventMods: { patienceMod: patienceBonus, flexMod: eventMods.flexMod || 0 }
            };
            
            console.log("[TianguisScene] startNegotiation payload verified:", payload);

            // Directly start scene without delays to isolate bug
            console.log("[TianguisScene] Starting NegotiationScene NOW!");
            this.scene.start('NegotiationScene', payload);

        } catch (error) {
            console.error("[TianguisScene] Error in startNegotiation:", error);
            // Restore state so it doesn't hard-lock
            this.isTransitioning = false;
            this.input.enabled = true;
            if (this.hud) {
                // Show a brief error to user instead of silent fail (Styled Toast)
                const toastGfx = this.add.graphics().setDepth(10000);
                drawRusticCard(toastGfx, this.cameras.main.width / 2 - 140, 60, 280, 40, THEME.colors.error, THEME.colors.textLight);
                
                const msg = this.add.text(this.cameras.main.width / 2, 80, "Error iniciando negociación", {
                    fontSize: '15px', color: '#fff', fontFamily: THEME.fonts.main, fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(10001);
                
                this.time.delayedCall(2000, () => {
                    msg.destroy();
                    toastGfx.destroy();
                });
            }
        }
    }

    buySpecificUpgrade(upgradeKey, cost) {
        const currentMoney = getState(this.registry, STATE_KEYS.PLAYER_MONEY);
        const currentLvl = getState(this.registry, STATE_KEYS[upgradeKey]);
        
        if (currentMoney >= cost) {
            this.registry.set(STATE_KEYS.PLAYER_MONEY, currentMoney - cost);
            this.registry.set(STATE_KEYS[upgradeKey], currentLvl + 1);
            
            // Sync inventory capacity if upgraded
            if (upgradeKey === 'UPG_CAPACITY') {
                this.inventoryManager.setCapacityLevel(currentLvl + 1);
            }

            TelemetryTracker.recordUpgrade(upgradeKey, cost);

            // Re-render stall if it was visual
            if (upgradeKey === 'UPG_VISUAL') {
                this.scene.restart();
            }
            
            this.hud.update(this.getGameState());
            this.showNotification(`¡Mejora adquirida!`);
            this.cameras.main.flash(400, 255, 215, 0);

            // Maintain average player level for existing generic objective compatibility
            const maxLvl = Math.max(
                getState(this.registry, STATE_KEYS.UPG_VISUAL),
                getState(this.registry, STATE_KEYS.UPG_CAPACITY)
            );
            this.registry.set(STATE_KEYS.PLAYER_LEVEL, maxLvl);
            
            // Record upgrade for objectives
            this.objectiveManager.recordEvent('upgrade', { level: maxLvl });
            const completed = processObjectiveRewards(this.registry, this.objectiveManager);
            this.renderObjectiveCompletions(completed);
        } else {
            this.showNotification(`Faltan $${cost - currentMoney} para mejorar`);
        }
    }

    advanceDay() {
        // Collect today's data from Telemetry
        const stats = TelemetryTracker.getDayStats();

        // Delegate day logic to DayCycle system
        const result = dayCycleAdvance(this.registry, this.economySystem, this.marketEvents);

        // Show DaySummaryPanel with stats and the newEvent from `result`
        showDaySummary(this, stats, result.eventResult.newEvent, () => {
            if (result.eventResult.newEvent) {
                this.showEventNotification(result.eventResult.newEvent);
            }

            this.npcManager.trySpawnNPC();

            // Process objectives
            this.objectiveManager.recordEvent('day');
            const completed = processObjectiveRewards(this.registry, this.objectiveManager);
            this.renderObjectiveCompletions(completed);

            this.hud.update(this.getGameState());

            // Day transition visual
            this.cameras.main.flash(400, 255, 183, 77);
            this.showNotification(`☀️ Día ${result.day}`);
            
            // Start fresh telemetry day with the new scheduled event
            TelemetryTracker.startNewDay(result.day, result.eventResult.newEvent);
        });
    }

    processPendingDealResult() {
        const result = processPendingDeal(this.registry, this.objectiveManager);
        if (result.hasDeal) {
            // Apply objective rewards
            const completed = processObjectiveRewards(this.registry, this.objectiveManager);
            this.renderObjectiveCompletions(completed);
        }
    }

    renderObjectiveCompletions(completed) {
        if (!completed || completed.length === 0) return;

        completed.forEach((obj, index) => {
            this.time.delayedCall(index * 2500, () => {
                this.showObjectiveNotification(obj);
            });
        });

        this.hud.update(this.getGameState());
    }

    showObjectiveNotification(objective) {
        const { width } = this.cameras.main;

        const bg = this.add.graphics().setDepth(9992);
        bg.fillStyle(0x1B5E20, 0.9);
        bg.fillRoundedRect(width / 2 - 180, 60, 360, 75, 12);
        bg.fillStyle(0x4CAF50, 1);
        bg.fillRoundedRect(width / 2 - 178, 62, 356, 4, 2);

        const title = this.add.text(width / 2, 85, `${objective.icon} ¡Objetivo Completo!`, {
            fontSize: '16px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#4CAF50'
        }).setOrigin(0.5).setDepth(9993);

        const name = this.add.text(width / 2, 108, objective.name, {
            fontSize: '14px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(9993);

        const reward = this.add.text(width / 2, 126, objective.rewardText, {
            fontSize: '12px', fontFamily: 'Outfit', color: '#FFD700'
        }).setOrigin(0.5).setDepth(9993);

        // Slide in
        const elements = [bg, title, name, reward];
        elements.forEach(el => { el.setAlpha(0); el.y -= 20; });
        this.tweens.add({
            targets: elements,
            alpha: 1, y: '+=20', duration: 400, ease: 'Back.easeOut'
        });

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: elements,
                alpha: 0, y: '-=30', duration: 400,
                onComplete: () => elements.forEach(el => el.destroy())
            });
        });
    }

    showEventNotification(event) {
        const { width } = this.cameras.main;

        const bg = this.add.graphics().setDepth(9990);
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(width / 2 - 210, 80, 420, 105, 14);
        bg.fillStyle(0xFFD700, 1);
        bg.fillRoundedRect(width / 2 - 208, 82, 416, 4, 2);

        const title = this.add.text(width / 2, 110, `${event.icon} ${event.name}`, {
            fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD700'
        }).setOrigin(0.5).setDepth(9991);

        const desc = this.add.text(width / 2, 145, event.description, {
            fontSize: '13px', fontFamily: 'Outfit', color: '#ffffff',
            wordWrap: { width: 380 }, align: 'center'
        }).setOrigin(0.5).setDepth(9991);

        // Slide in
        bg.setAlpha(0); title.setAlpha(0); desc.setAlpha(0);
        bg.y -= 20; title.y -= 20; desc.y -= 20;
        this.tweens.add({
            targets: [bg, title, desc],
            alpha: 1, y: '+=20', duration: 400, ease: 'Back.easeOut'
        });

        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: [bg, title, desc],
                alpha: 0, y: '-=30', duration: 400,
                onComplete: () => { bg.destroy(); title.destroy(); desc.destroy(); }
            });
        });
    }

    showNotification(text) {
        const { width } = this.cameras.main;
        const notif = this.add.text(width / 2, 175, text, {
            fontSize: '22px', fontFamily: 'Outfit', fontStyle: 'bold',
            color: '#FFD700', stroke: '#4E342E', strokeThickness: 4
        }).setOrigin(0.5).setDepth(9999).setAlpha(0);

        this.tweens.add({
            targets: notif,
            alpha: 1, y: 165, scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 },
            duration: 400, ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: notif, alpha: 0, y: 155, duration: 300,
                        onComplete: () => notif.destroy()
                    });
                });
            }
        });
    }

    // toggleInventory → moved to ui/InventoryPanel.js

    // showMarketInfo → moved to ui/MarketInfoPanel.js

    checkInitialEvents() {
        const result = dayCycleCheckEvents(this.registry, this.marketEvents);
        if (result.newEvent) {
            this.time.delayedCall(1000, () => {
                this.showEventNotification(result.newEvent);
            });
        }
    }

    getGameState() {
        return {
            money: getState(this.registry, STATE_KEYS.PLAYER_MONEY),
            level: getState(this.registry, STATE_KEYS.PLAYER_LEVEL),
            reputation: getState(this.registry, STATE_KEYS.PLAYER_REPUTATION),
            day: getState(this.registry, STATE_KEYS.CURRENT_DAY),
            inventoryCount: this.inventoryManager.getItemCount(),
            inventoryCapacity: this.inventoryManager.getCapacity(),
            activeEvents: this.marketEvents.getActiveEvents()
        };
    }

    update(time, delta) {
        if (this.npcManager) {
            this.npcManager.update(time, delta);
        }

        // Clean up off-screen background shoppers
        const { width } = this.cameras.main;
        for (let i = this.backgroundShoppers.length - 1; i >= 0; i--) {
            const shopper = this.backgroundShoppers[i];
            if ((shopper.goingRight && shopper.x > width + 50) || 
                (!shopper.goingRight && shopper.x < -50)) {
                shopper.destroy();
                this.backgroundShoppers.splice(i, 1);
            }
        }
    }

    trySpawnBackgroundShopper() {
        if (this.backgroundShoppers.length >= 6) return; // Cap at 6 max
        // 50% chance to skip this interval to group spawns randomly
        if (Math.random() > 0.5) return;

        const { width } = this.cameras.main;
        const keys = ['npc_turista_neutral', 'npc_cliente_normal_neutral', 'npc_revendedor_neutral', 'player'];
        const key = keys[Math.floor(Math.random() * keys.length)];

        const goingRight = Math.random() > 0.5;
        const startX = goingRight ? -40 : width + 40;
        const startY = 160 + Math.random() * 30; // Walk along the top row behind stalls

        if (this.textures.exists(key)) {
            const shopper = this.add.sprite(startX, startY, key, 0);
            shopper.setScale(0.35 * (0.8 + Math.random() * 0.2)); // Slightly varied scale
            shopper.setDepth(startY); // Respect isometric depth behind stalls
            shopper.setTint(0x5D4037); // Dark brown silhouette tint
            shopper.setAlpha(0.6); // Semi-transparent
            shopper.setFlipX(!goingRight);
            shopper.goingRight = goingRight;

            // Optional: small bobbing walk
            this.tweens.add({
                targets: shopper,
                y: startY - 2,
                duration: 250,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Move across screen
            const speed = 10000 + Math.random() * 8000;
            this.tweens.add({
                targets: shopper,
                x: goingRight ? width + 50 : -50,
                duration: speed,
                ease: 'Linear'
            });

            this.backgroundShoppers.push(shopper);
        }
    }
}
