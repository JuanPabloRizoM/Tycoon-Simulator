// ============================================================
// NegotiationScene — Escena de regateo/negociación V2
// - Custom price input (HTML DOM)
// - Dynamic layout, bigger buttons, glow animations
// - NPC-specific traits and hidden patience
// - Better chat layout (uncramped)
// - Type-specific descriptions (no generic "estafador")
// ============================================================

import { BargainEngine } from '../negotiation/BargainEngine.js?v=6';
import { STATE_KEYS, getState } from '../core/GameState.js?v=6';
import { disableNegotiationUI, createPatienceBar, updatePatienceDisplay as uiUpdatePatience, updateEmotionDisplay as uiUpdateEmotion } from '../ui/NegotiationUI.js?v=6';
import { drawNpcPortrait, setNpcTrait, updateNpcExpression } from '../ui/NpcPortraitSection.js?v=6';
import { addChatMessage } from '../ui/NegotiationUI.js?v=6';
import { THEME, drawRusticCard, drawPriceTag, drawWoodPanel, drawLonaBackground } from '../ui/Theme.js?v=6';
import { processOffer, acceptCurrentOffer, resolveDeal } from '../systems/NegotiationFlow.js?v=6';
import { TelemetryTracker } from '../core/TelemetryTracker.js?v=6';

export class NegotiationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NegotiationScene' });
        this.bargainEngine = new BargainEngine();
    }

    init(data) {
        console.log("[NegotiationScene] init called with data:", data);
        this.npcData = data.npcData || data.npc;
        this.itemData = data.itemData || data.item;
        this.isPlayerBuying = data.isPlayerBuying;
        this.economySystem = data.economySystem;
        this.inventoryManager = data.inventoryManager;
        this.marketEvents = data.marketEvents;
        this.playerMoney = data.playerMoney;
        this.playerReputation = data.playerReputation;
        this.negotiationActive = true;
        this.uiElements = [];
        this.historyTexts = [];
        this.domInput = null;
        this.patienceIndicator = null;
    }

    create() {
        console.log("[NegotiationScene] create() started.");
        
        // --- STRONG VALIDATION ---
        if (!this.npcData || !this.itemData || !this.economySystem || !this.inventoryManager) {
            console.error("[NegotiationScene] CRITICAL ERROR: Missing payload data! Aborting and returning to TianguisScene.");
            console.error("- npcData:", !!this.npcData, "- itemData:", !!this.itemData, "- economy:", !!this.economySystem, "- inventory:", !!this.inventoryManager);
            // Wait 1 frame to ensure graceful fallback
            this.time.delayedCall(50, () => {
                this.scene.start('TianguisScene');
            });
            return;
        }

        // Explicit cleanup on scene shutdown to prevent visual hangs
        this.events.on('shutdown', () => {
            if (this.domInput) {
                this.domInput.remove();
                this.domInput = null;
            }
            this.children.removeAll();
        });

        const { width, height } = this.cameras.main;

        // === BACKGROUND ===
        const bg = this.add.graphics();
        drawLonaBackground(bg, width, height);

        // --- NEW HQ ASSET: Stall Table Surface ---
        const tableSurface = this.add.image(width / 2, height, 'stall_table_hq').setOrigin(0.5, 1);
        tableSurface.displayWidth = width;
        tableSurface.scaleY = tableSurface.scaleX; // Maintain aspect ratio
        tableSurface.setDepth(1);
        tableSurface.setAlpha(0.65); // Dim table so it doesn't overpower the item and NPC

        // Main container with animated border
        this.mainBorder = this.add.graphics();
        this.drawAnimatedBorder(width, height);

        // === THREE-COLUMN TOP SECTION ===
        // Left: NPC info   |   Center: Item   |   Right: Deal stats
        const topH = 300;
        this.drawNPCSection(30, 25, 290, topH);
        this.drawItemSection(340, 25, 220, topH);
        this.drawDealStats(580, 25, width - 610, topH);

        // === BOTTOM SECTION: Negotiation Panel ===
        this.drawNegotiationPanel(30, topH + 40, width - 60, height - topH - 60);

        // === Start negotiation ===
        const eventMods = this.registry.get(STATE_KEYS.EVENT_MODIFIERS) || null;
        const startResult = this.bargainEngine.startNegotiation(
            this.npcData, this.itemData, !this.isPlayerBuying, eventMods
        );

        // Propagate portrait trait + open message
        if (startResult.npcTrait) {
            setNpcTrait(this.portrait, startResult.npcTrait);
        }

        // Build explicit context objects (populated after sub-draws)
        // chatCtx is set in drawNegotiationPanel above.
        this.emotionCtx = {
            emotionEmoji:   this.portrait.emotionEmoji,
            emotionLabel:   this.portrait.emotionLabel,
            npcSprite:      this.portrait.sprite,
            npcHasEmotions: this.portrait.npcHasEmotions,
            npcType:        this.portrait.npcType,
            textures:       this.textures,
            tweens:         this.tweens,
            baseScale:      this.portrait.baseScale
        };
        // Add vignette overlay for near-walk_away warning
        this.warningOverlay = this.add.graphics();
        this.warningOverlay.fillStyle(0xFF0000, 1);
        this.warningOverlay.fillRect(0, 0, width, height);
        this.warningOverlay.setBlendMode(Phaser.BlendModes.SCREEN);
        this.warningOverlay.setAlpha(0);
        this.warningOverlay.setDepth(50);

        this.patienceCtx = {
            indicator: this.portrait.patienceIndicator,
            tweens:    this.tweens,
            barBg:     this.patienceBarRefs.barBg,
            barFill:   this.patienceBarRefs.barFill,
            barWidth:  this.patienceBarRefs.barWidth,
            x:         this.patienceBarRefs.x,
            y:         this.patienceBarRefs.y,
            warningOverlay: this.warningOverlay
        };
        this.uiCtx = {
            uiElements: this.uiElements,
            domInput:   null   // set in createDOMInput
        };

        const openMsg = this.isPlayerBuying
            ? `Tengo un ${this.itemData.name}. ¿Te interesa por $${startResult.npcOffer}?`
            : `Me interesa tu ${this.itemData.name}. Te ofrezco $${startResult.npcOffer}.`;

        this.addToHistory(this.npcData.name, openMsg, 'npc');
        this.updateEmotionDisplay(startResult.emotion);
        this.updatePatienceDisplay(startResult.patience / startResult.maxPatience);

        // Scene entrance
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Create DOM input for custom price
        this.createDOMInput();

        // Tutorial Check
        if (!this.registry.get(STATE_KEYS.HAS_SEEN_TUTORIAL)) {
            this.time.delayedCall(500, () => this.showTutorialSteps());
        }
    }

    drawAnimatedBorder(width, height) {
        this.mainBorder.clear();
        this.mainBorder.lineStyle(2, 0xFFD700, 0.4);
        this.mainBorder.strokeRoundedRect(15, 12, width - 30, height - 24, 16);
        this.mainBorder.lineStyle(1, 0xFFD700, 0.15);
        this.mainBorder.strokeRoundedRect(18, 15, width - 36, height - 30, 14);
    }

    showTutorialSteps() {
        const cx = this.cameras.main.centerX;
        
        const blocker = this.add.graphics();
        blocker.fillStyle(0x000000, 0.6);
        blocker.fillRect(0, 0, 800, 600);
        blocker.setDepth(100);
        blocker.setInteractive(new Phaser.Geom.Rectangle(0, 0, 800, 600), Phaser.Geom.Rectangle.Contains);

        const textStyle = { font: '20px Arial', fill: '#000', align: 'center', wordWrap: { width: 350 } };
        const box = this.add.graphics();
        box.setDepth(101);
        
        const txt = this.add.text(cx, 300, '', textStyle).setOrigin(0.5).setDepth(102);
        
        const steps = [
            { text: "¡Primer cliente!\n\nMira su presupuesto estimado y el valor de tu objeto. Ofrécele algo justo.", y: 150 },
            { text: "La barra superior es su Paciencia.\n\nSi pides demasiado o lo insultas, se bajará. Si llega a 0, se marchará.", y: 200 },
            { text: "Usa los botones para subir/bajar la oferta, o escribe el precio tú mismo.\n\n¡Ciérralo rápido!", y: 450 }
        ];

        let currentStep = 0;

        const drawStep = () => {
            if (currentStep >= steps.length) {
                blocker.destroy();
                box.destroy();
                txt.destroy();
                
                // Mark tutorial complete in Registry and LocalStorage
                this.registry.set(STATE_KEYS.HAS_SEEN_TUTORIAL, true);
                try { localStorage.setItem('tianguis_has_seen_tutorial', 'true'); } catch (e) {}
                return;
            }

            const step = steps[currentStep];
            txt.setText(step.text);
            txt.setPosition(cx, step.y);
            
            box.clear();
            box.fillStyle(0xFFE5A3, 1);
            box.fillRoundedRect(cx - 200, step.y - 60, 400, 150, 12);
            box.lineStyle(4, 0xD4B055, 1);
            box.strokeRoundedRect(cx - 200, step.y - 60, 400, 150, 12);
            
            const btnText = this.add.text(cx, step.y + 50, "Continuar (Click)", { font: 'bold 16px Arial', fill: '#800' }).setOrigin(0.5).setDepth(102);
            
            blocker.removeAllListeners('pointerdown');
            blocker.on('pointerdown', () => {
                btnText.destroy();
                currentStep++;
                drawStep();
            });
        };

        drawStep();
    }

    // ============================
    //  NPC Section — delegated to NpcPortraitSection
    // ============================
    drawNPCSection(x, y, w, h) {
        this.portrait = drawNpcPortrait(this, x, y, w, h, this.npcData);
    }

    // ============================
    //  Item Section (center)
    // ============================
    drawItemSection(x, y, w, h) {
        const panel = this.add.graphics();
        
        // Rustic Card Background instead of tech box
        drawRusticCard(panel, x, y, w, h);

        // Header
        this.add.text(x + w / 2, y + 18, '🏷️ Objeto', {
            fontSize: THEME.textStyles.h2.fontSize, fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.verdeNopal
        }).setOrigin(0.5);

        // Item icon with glow ring
        const rarityKey = this.itemData.rarity === 'común' ? 'comun' :
            this.itemData.rarity === 'épico' ? 'epico' : this.itemData.rarity;
        const rarityColors = {
            'común': 0x9E9E9E, 'raro': 0x2196F3, 'épico': 0x9C27B0, 'legendario': 0xFFD700
        };
        const glowColor = rarityColors[this.itemData.rarity] || 0x9E9E9E;

        // Glow ring
        // Remove procedural glow lines since the card has its own
        // panel.lineStyle(3, glowColor, 0.4); ...
        
        // Item icon with support for high-res assets
        const itemTexture = this.itemData.textureHQ || `item_${rarityKey}`;
        const isItemHQ = !!this.itemData.textureHQ;
        // Trimmed item_novedad_hq is ~388x503.
        // We want it to be around 100-120px tall on the card, so 0.25 is a good scale.
        const itemBaseScale = isItemHQ ? 0.25 : 1.3;

        const itemIcon = this.add.sprite(x + w / 2, y + 60, itemTexture);
        itemIcon.setScale(itemBaseScale);

        // Floating animation
        this.tweens.add({
            targets: itemIcon,
            y: { from: y + 58, to: y + 63 },
            duration: 2000, yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Item name
        this.add.text(x + w / 2, y + 100, this.itemData.name, {
            fontSize: '15px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#fff',
            stroke: '#000', strokeThickness: 2,
            wordWrap: { width: w - 20 }, align: 'center'
        }).setOrigin(0.5);

        // Category
        const catLabels = {
            electronica: '⚡ Electrónica', videojuegos_retro: '🎮 Retro',
            antiguedades: '🏛️ Antigüedad', juguetes: '🧸 Juguetes', moda_urbana: '👗 Moda'
        };
        this.add.text(x + w / 2, y + 125, catLabels[this.itemData.category] || this.itemData.category, {
            fontSize: '12px', fontFamily: 'Outfit', color: '#c0c0c0'
        }).setOrigin(0.5);

        // Rarity badge with colored background
        const rarityTextColors = {
            'común': '#BDBDBD', 'raro': '#64B5F6', 'épico': '#CE93D8', 'legendario': '#FFD700'
        };
        const rarBg = this.add.graphics();
        rarBg.fillStyle(glowColor, 0.9);
        rarBg.fillRoundedRect(x + w / 2 - 40, y + 134, 80, 18, 4);
        
        this.add.text(x + w / 2, y + 148, `⭐ ${this.itemData.rarity.toUpperCase()}`, {
            fontSize: '12px', fontFamily: 'Outfit', fontStyle: 'bold',
            color: rarityTextColors[this.itemData.rarity] || '#fff',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 1);

        // Condition bar (visual, clean)
        this.add.text(x + 15, y + 170, 'Condición', {
            fontSize: '11px', fontFamily: 'Outfit', color: '#bbb'
        });
        const condBarBg = this.add.graphics();
        condBarBg.fillStyle(0x333333, 1);
        condBarBg.fillRoundedRect(x + 15, y + 188, w - 30, 10, 5);
        const condColor = this.itemData.condition > 0.7 ? 0x4CAF50 :
            this.itemData.condition > 0.4 ? 0xFFC107 : 0xF44336;
        condBarBg.fillStyle(condColor, 1);
        condBarBg.fillRoundedRect(x + 15, y + 188, (w - 30) * this.itemData.condition, 10, 5);

        this.add.text(x + w - 15, y + 170, this.itemData.conditionLabel, {
            fontSize: '11px', fontFamily: 'Outfit', color: condColor > 0xBB0000 ? '#F44336' : '#4CAF50'
        }).setOrigin(1, 0);

        // Market value (prominent)
        const marketValue = this.economySystem.calculatePrice(this.itemData);
        drawPriceTag(panel, x + 10, y + 215, w - 20, 44, THEME.colors.ambarCemp);

        this.add.text(x + w / 2, y + 226, 'Valor Base', {
            fontSize: '12px', fontFamily: THEME.fonts.main, color: THEME.colors.textDark
        }).setOrigin(0.5).setAlpha(0.8);
        this.add.text(x + w / 2, y + 246, `$${marketValue}`, {
            fontSize: '20px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.textDark
        }).setOrigin(0.5);
    }

    // ============================
    //  Deal Stats (right column)
    // ============================
    drawDealStats(x, y, w, h) {
        const panel = this.add.graphics();
        drawRusticCard(panel, x, y, w, h, THEME.colors.cremaLona);

        // Title
        const actionText = this.isPlayerBuying ? '💰 Puesto' : '💰 Puesto';
        const actionColor = THEME.colors.textDark;
        this.add.text(x + w / 2, y + 18, actionText, {
            fontSize: '16px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: actionColor
        }).setOrigin(0.5);

        // Money display (big, prominent)
        panel.fillStyle(0xFFFFFF, 0.5);
        panel.fillRoundedRect(x + 10, y + 35, w - 20, 44, 8);

        this.add.text(x + w / 2, y + 45, 'Tu Dinero', {
            fontSize: '12px', fontFamily: THEME.fonts.main, color: THEME.colors.textDark, fontStyle: 'bold'
        }).setOrigin(0.5);
        this.moneyText = this.add.text(x + w / 2, y + 66, `$${this.playerMoney}`, {
            fontSize: '22px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.verdeNopal
        }).setOrigin(0.5);

        // Removed round dots visually, but kept horizontal space consistent
        panel.lineStyle(1, 0x3d3d7e, 0.3);
        panel.beginPath(); panel.moveTo(x + 15, y + 165); panel.lineTo(x + w - 15, y + 165); panel.strokePath();

        // Quick stats
        this.add.text(x + 15, y + 180, '📊 Reputación', {
            fontSize: '13px', fontFamily: 'Outfit', color: '#bbb'
        });
        const repBar = this.add.graphics();
        repBar.fillStyle(0x333333, 1);
        repBar.fillRoundedRect(x + 15, y + 200, w - 30, 8, 4);
        repBar.fillStyle(0xFFC107, 1);
        repBar.fillRoundedRect(x + 15, y + 200, (w - 30) * (this.playerReputation / 100), 8, 4);

        this.add.text(x + w - 15, y + 180, `${this.playerReputation}%`, {
            fontSize: '13px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFC107'
        }).setOrigin(1, 0);

        // Last offer display
        panel.fillStyle(0x1a1a3e, 0.8);
        panel.fillRoundedRect(x + 10, y + 210, w - 20, 36, 6);
        this.add.text(x + w / 2, y + 228, 'Última Oferta NPC', {
            fontSize: '12px', fontFamily: 'Outfit', color: '#bbb'
        }).setOrigin(0.5);
        this.lastOfferText = this.add.text(x + w / 2, y + 248, '---', {
            fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD700'
        }).setOrigin(0.5);

        // Patience Bar (NEW)
        this.add.text(x + 15, y + 265, 'Paciencia del NPC', {
            fontSize: '12px', fontFamily: 'Outfit', color: '#bbb'
        });
        this.patienceBarRefs = createPatienceBar(this, x + 15, y + 285, w - 30);
    }

    // ============================
    //  Negotiation Panel (bottom)
    // ============================
    drawNegotiationPanel(x, y, w, h) {
        const panel = this.add.graphics();
        drawWoodPanel(panel, x, y, w, h);

        // === CHAT AREA (left 60%) ===
        const chatW = w * 0.58;
        const chatX = x + 10;
        const chatY = y + 10;
        const chatH = h - 20;

        // Chat background (carton-styled paper)
        const chatBg = this.add.graphics();
        drawRusticCard(chatBg, chatX, chatY, chatW, chatH, THEME.colors.cremaLona, THEME.colors.cuerito);

        // Chat header
        chatBg.fillStyle(0x1a1a3e, 0.8);
        chatBg.fillRoundedRect(chatX, chatY, chatW, 24, { tl: 10, tr: 10, bl: 0, br: 0 });
        this.add.text(chatX + 10, chatY + 14, '💬 Negociación', {
            fontSize: '14px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#a0a0e0'
        }).setOrigin(0, 0.5).setDepth(10);

        // Store chat area coords as explicit context object
        // chatAreaY = chatY + 30, chatAreaH = chatH - 40 → bottom = chatAreaY + chatAreaH
        this.chatCtx = {
            x:      chatX + 10,
            y:      chatY + 30,
            w:      chatW - 20,
            h:      chatH - 40,
            bottom: (chatY + 30) + (chatH - 40),
            texts:  this.historyTexts,
            add:    this.add,
            tweens: this.tweens
        };

        // === CONTROLS AREA (right 40%) ===
        const ctrlX = x + chatW + 25;
        const ctrlY = y + 10;
        const ctrlW = w - chatW - 35;
        const ctrlH = h - 20;

        // Controls background
        const ctrlBg = this.add.graphics();
        ctrlBg.fillStyle(0x0d0d20, 0.4);
        ctrlBg.fillRoundedRect(ctrlX, ctrlY, ctrlW, ctrlH, 10);

        // === PRESET OFFER BUTTONS (bigger, with glow) ===
        const marketValue = this.economySystem.calculatePrice(this.itemData);
        const presets = [
            { label: '-30%', mult: 0.7, color: THEME.colors.error, textColor: THEME.colors.textLight },
            { label: '-15%', mult: 0.85, color: THEME.colors.naranjaMango, textColor: THEME.colors.textDark },
            { label: 'Valor', mult: 1.0, color: THEME.colors.azulTurquesa, textColor: THEME.colors.textDark },
            { label: '+15%', mult: 1.15, color: THEME.colors.success, textColor: THEME.colors.textLight },
            { label: '+30%', mult: 1.3, color: THEME.colors.verdeNopal, textColor: THEME.colors.textLight }
        ];

        const btnRows = 3;
        const btnCols = 2;
        const btnW = (ctrlW - 30) / btnCols;
        const btnH = 34;
        const btnStartY = ctrlY + 6;

        for (let i = 0; i < presets.length; i++) {
            const preset = presets[i];
            const col = i % btnCols;
            const row = Math.floor(i / btnCols);
            const bx = ctrlX + 10 + col * (btnW + 6);
            const by = btnStartY + row * (btnH + 6);
            const offerAmount = Math.round(marketValue * preset.mult);

            // Button glow background
            const glowBg = this.add.graphics().setDepth(9);
            glowBg.fillStyle(preset.color, 0.15);
            glowBg.fillRoundedRect(bx - 1, by - 1, btnW + 2, btnH + 2, 8);

            // Button body (HQ Asset)
            const btnBg = this.add.image(bx + btnW / 2, by + btnH / 2, 'ui_button_hq').setDepth(10);
            btnBg.setDisplaySize(btnW, btnH);
            btnBg.setTint(preset.color);

            const btnText = this.add.text(bx + btnW / 2, by + 10, preset.label, {
                fontSize: '13px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: preset.textColor,
                stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5).setDepth(11);

            const priceText = this.add.text(bx + btnW / 2, by + 24, `$${offerAmount}`, {
                fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: '800', color: preset.textColor,
                stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5).setDepth(11);

            // Interactive zone
            const hitZone = this.add.zone(bx, by, btnW, btnH).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(12);
            hitZone.on('pointerover', () => {
                btnBg.setTint(0xffffff);
                glowBg.clear();
                glowBg.fillStyle(preset.color, 0.3);
                glowBg.fillRoundedRect(bx - 3, by - 3, btnW + 6, btnH + 6, 10);
            });
            hitZone.on('pointerout', () => {
                btnBg.setTint(preset.color);
                glowBg.clear();
                glowBg.fillStyle(preset.color, 0.15);
                glowBg.fillRoundedRect(bx - 1, by - 1, btnW + 2, btnH + 2, 8);
            });
            hitZone.on('pointerdown', () => this.makeOffer(offerAmount));

            this.uiElements.push(hitZone, btnBg, glowBg, btnText, priceText);
        }

        // === CUSTOM INPUT LABEL ===
        const inputY = btnStartY + 3 * (btnH + 6) + 4;
        this.add.text(ctrlX + ctrlW / 2, inputY, '✏️ Tu Oferta', {
            fontSize: '13px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#a0a0e0'
        }).setOrigin(0.5).setDepth(10);

        // Input box placeholder (DOM input will overlay)
        this.inputPlaceholder = this.add.graphics().setDepth(9);
        this.inputPlaceholder.fillStyle(0x0d0d20, 0.8);
        this.inputPlaceholder.fillRoundedRect(ctrlX + 8, inputY + 16, ctrlW - 16, 32, 6);
        this.inputPlaceholder.lineStyle(1, 0x5d5dae, 0.5);
        this.inputPlaceholder.strokeRoundedRect(ctrlX + 8, inputY + 16, ctrlW - 16, 32, 6);

        // Store input area coords for DOM input positioning
        this.inputRect = {
            x: ctrlX + 8,
            y: inputY + 16,
            w: ctrlW - 16,
            h: 32
        };

        // Send button for custom offer
        const sendBtnY = inputY + 52;
        const sendBtnW = ctrlW - 16;
        
        const sendBg = this.add.image(ctrlX + 8 + sendBtnW / 2, sendBtnY + 16, 'ui_button_hq').setDepth(10);
        sendBg.setDisplaySize(sendBtnW, 32);
        sendBg.setTint(THEME.colors.azulTurquesa);

        const sendText = this.add.text(ctrlX + 8 + sendBtnW / 2, sendBtnY + 16, '📨 Enviar Oferta', {
            fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textDark,
        }).setOrigin(0.5).setDepth(11);

        const sendHit = this.add.zone(ctrlX + 8, sendBtnY, sendBtnW, 32).setOrigin(0)
            .setInteractive({ useHandCursor: true }).setDepth(12);
        sendHit.on('pointerover', () => {
             sendBg.setTint(THEME.colors.textLight);
        });
        sendHit.on('pointerout', () => {
             sendBg.setTint(THEME.colors.azulTurquesa);
        });
        sendHit.on('pointerdown', () => this.submitCustomOffer());
        this.uiElements.push(sendHit, sendBg, sendText);

        // === ACTION BUTTONS (bottom row, tightened for 540p) ===
        const actY = sendBtnY + 38;
        const actionBtns = [
            { label: '✅ Aceptar', color: THEME.colors.success, hoverColor: THEME.colors.textLight, action: () => this.acceptOffer() },
            { label: '❌ Rechazar', color: THEME.colors.error, hoverColor: THEME.colors.textLight, action: () => this.walkAway() },
            { label: '🔙 Salir', color: THEME.colors.cartonOscuro, hoverColor: THEME.colors.textLight, action: () => this.returnToTianguis() }
        ];

        const actBtnW = (ctrlW - 24) / 3;
        for (let i = 0; i < actionBtns.length; i++) {
            const act = actionBtns[i];
            const ax = ctrlX + 8 + i * (actBtnW + 4);

            const aBg = this.add.image(ax + actBtnW / 2, actY + 20, 'ui_button_hq').setDepth(15);
            aBg.setDisplaySize(actBtnW, 36);
            aBg.setTint(act.color);

            const aText = this.add.text(ax + actBtnW / 2, actY + 18, act.label, {
                fontSize: '12px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textLight,
                stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5).setDepth(16);

            const aHit = this.add.zone(ax, actY, actBtnW, 36).setOrigin(0)
                .setInteractive({ useHandCursor: true }).setDepth(17);
            aHit.on('pointerover', () => {
                this.tweens.add({ targets: aText, scaleX: 1.1, scaleY: 1.1, duration: 100, ease: 'Back.easeOut' });
                aBg.setTint(act.hoverColor);
            });
            aHit.on('pointerout', () => {
                this.tweens.add({ targets: aText, scaleX: 1, scaleY: 1, duration: 100 });
                aBg.setTint(act.color);
            });
            aHit.on('pointerdown', act.action);
            this.uiElements.push(aHit, aBg, aText);
        }
    }

    // ============================
    //  DOM Input for custom price
    // ============================
    createDOMInput() {
        // Create a DOM element input
        const canvas = this.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.cameras.main.width;
        const scaleY = canvasRect.height / this.cameras.main.height;

        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Escribe tu precio...';
        input.style.cssText = `
      position: absolute;
      left: ${canvasRect.left + this.inputRect.x * scaleX}px;
      top: ${canvasRect.top + this.inputRect.y * scaleY}px;
      width: ${this.inputRect.w * scaleX}px;
      height: ${this.inputRect.h * scaleY}px;
      background: rgba(13, 13, 32, 0.9);
      border: 1px solid rgba(93, 93, 174, 0.5);
      border-radius: 6px;
      color: #FFD700;
      font-family: 'Outfit', sans-serif;
      font-size: ${12 * scaleY}px;
      font-weight: bold;
      text-align: center;
      outline: none;
      padding: 0 8px;
      box-sizing: border-box;
      z-index: 1000;
    `;
        input.addEventListener('focus', () => {
            input.style.borderColor = 'rgba(255, 215, 0, 0.6)';
            input.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.2)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(93, 93, 174, 0.5)';
            input.style.boxShadow = 'none';
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitCustomOffer();
            }
        });

        document.body.appendChild(input);
        this.domInput = input;
        // Keep uiCtx domInput reference in sync
        if (this.uiCtx) this.uiCtx.domInput = input;
    }

    submitCustomOffer() {
        if (!this.domInput || !this.negotiationActive) return;
        const value = parseInt(this.domInput.value);
        if (isNaN(value) || value <= 0) {
            this.addToHistory('Sistema', 'Ingresa un precio válido mayor a $0.', 'system');
            return;
        }
        this.domInput.value = '';
        this.handleOffer(value);
    }

    // ============================
    //  Game Logic — delegates to NegotiationFlow
    // ============================

    // Alias for preset offer buttons in drawNegotiationPanel
    makeOffer(amount) { return this.handleOffer(amount); }

    handleOffer(amount) {
        if (!this.negotiationActive) return;

        const result = processOffer({
            engine: this.bargainEngine,
            amount,
            isPlayerBuying: this.isPlayerBuying,
            playerMoney: this.playerMoney,
            npcName: this.npcData.name
        });

        if (result.type === 'validation_error') {
            this.addToHistory('Sistema', result.error, 'error');
            return;
        }

        this.addToHistory('Tú', `¿Qué tal $${amount}?`, 'player');

        if (result.patience !== undefined && result.maxPatience !== undefined) {
            const ratio = result.patience / result.maxPatience;
            this.updatePatienceDisplay(ratio);
            // UX hook: warn when patience is critically low
            if (ratio < 0.20) showPatienceWarning(this.patienceCtx);
        }
        this.updateEmotionDisplay(result.emotion);

        // Portrait expression + portrait reaction via NpcPortraitSection
        updateNpcExpression(this.portrait, result.emotion, this);
        flashPortraitReaction(this.emotionCtx, result.type);

        if (result.lastNPCOffer) {
            this.lastOfferText.setText(`$${result.lastNPCOffer}`);
        }

        this.renderOfferOutcome(result);
    }

    renderOfferOutcome(result) {
        switch (result.type) {
            case 'accept':
                this.addToHistory(this.npcData.name, result.message, 'success');
                this.completeDeal(result.finalPrice, result.reason);
                break;
            case 'counter':
                this.addToHistory(this.npcData.name, result.message, 'npc');
                this.lastOfferText.setText(`$${result.counterOffer}`);
                this.tweens.add({
                    targets: this.lastOfferText,
                    scaleX: 1.3, scaleY: 1.3, duration: 200, yoyo: true, ease: 'Back.easeOut'
                });
                break;
            case 'reject':
                this.addToHistory(this.npcData.name, result.message, 'npc');
                this.cameras.main.shake(200, 0.004);
                this.tweens.add({
                    targets: this.emotionEmoji,
                    scaleX: 1.5, scaleY: 1.5, duration: 150, yoyo: true
                });
                break;
            case 'walk_away':
                this.addToHistory(this.npcData.name, result.message, 'error');
                this.showOutcomeFeedback(result.reason, 'error');
                this.negotiationActive = false;
                this.disableUI();
                this.time.delayedCall(2500, () => this.returnToTianguis());
                break;
        }
    }

    // updateCharacterExpression → moved to NpcPortraitSection.updateNpcExpression()

    acceptOffer() {
        if (!this.negotiationActive) return;
        const result = acceptCurrentOffer(this.bargainEngine);
        if (result.type === 'accept') {
            this.addToHistory('Sistema', result.message, 'success');
            this.completeDeal(result.finalPrice, result.reason);
        }
    }

    completeDeal(price, reason = 'accepted') {
        this.negotiationActive = false;
        this.disableUI();
        
        this.showOutcomeFeedback(reason, 'success');

        // Delegate state mutation to NegotiationFlow
        const dealResult = resolveDeal({
            registry: this.registry,
            price,
            isPlayerBuying: this.isPlayerBuying,
            playerMoney: this.playerMoney,
            itemData: this.itemData,
            npcData: this.npcData,
            inventoryManager: this.inventoryManager,
            economySystem: this.economySystem
        });

        // Record telemetry
        const patienceLeft = this.bargainEngine.patience;
        const maxPatience = this.bargainEngine.maxPatience;
        // In this game, baseValue is what it's worth. Buying below it = profit. Selling above it = profit.
        const profit = this.isPlayerBuying ? (this.itemData.baseValue - price) : (price - this.itemData.baseValue);
        TelemetryTracker.recordDeal(this.npcData, this.itemData, profit, true, patienceLeft, maxPatience);

        // Render results only
        this.playerMoney = dealResult.newMoney;
        this.moneyText.setText(`$${this.playerMoney}`);
        this.addToHistory('💰', dealResult.dealMessage, 'success');

        // Visual effects
        this.cameras.main.flash(400, 255, 215, 0, true);
        this.tweens.add({
            targets: this.moneyText,
            scaleX: 1.4, scaleY: 1.4, duration: 300, yoyo: true, ease: 'Bounce.easeOut'
        });

        this.time.delayedCall(2500, () => this.returnToTianguis());
    }

    walkAway() {
        this.negotiationActive = false;
        this.disableUI();
        this.addToHistory('Sistema', 'Te alejaste de la negociación.', 'system');
        this.showOutcomeFeedback('player_walked_away', 'error');

        // Record telemetry (lost deal)
        const patienceLeft = this.bargainEngine.patience;
        const maxPatience = this.bargainEngine.maxPatience;
        TelemetryTracker.recordDeal(this.npcData, this.itemData, 0, false, patienceLeft, maxPatience);

        this.time.delayedCall(1500, () => this.returnToTianguis());
    }

    returnToTianguis() {
        if (this.domInput) {
            this.domInput.remove();
            this.domInput = null;
        }
        this.scene.start('TianguisScene');
    }

    // ============================
    //  Chat System (uncramped)
    // ============================
    addToHistory(speaker, text, type = 'system') {
        addChatMessage(this.chatCtx, speaker, text, type);
    }

    // ============================
    //  UI Updates — delegate to NegotiationUI context functions
    // ============================
    updateEmotionDisplay(emotion) {
        uiUpdateEmotion(this.emotionCtx, emotion);
    }

    updatePatienceDisplay(patienceRatio) {
        uiUpdatePatience(this.patienceCtx, patienceRatio);
    }

    disableUI() {
        disableNegotiationUI(this.uiCtx);
    }

    shutdown() {
        // Clean up DOM input when scene shuts down
        if (this.domInput) {
            this.domInput.remove();
            this.domInput = null;
        }
    }

    showOutcomeFeedback(reason, type) {
        let text = '';
        switch(reason) {
            case 'patience_exhausted': text = 'Se hartó y se fue.'; break;
            case 'price_too_high': text = 'Oferta exageradamente cara.'; break;
            case 'price_too_low': text = 'Oferta ofensivamente baja.'; break;
            case 'budget_exceeded': text = 'Supera su presupuesto.'; break;
            case 'player_walked_away': text = 'Te retiraste de la venta.'; break;
            case 'accepted': text = '¡Trato justo!'; break;
            default: return; // No text for unknown reasons
        }

        const color = type === 'success' ? '#4CAF50' : '#F44336';
        const feedback = this.add.text(400, 300, text, {
            font: 'bold 28px Arial', fill: color, stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: feedback,
            y: 200,
            alpha: 0,
            duration: 2500,
            ease: 'Power2'
        });
    }
}
