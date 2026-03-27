// ============================================================
// HUD — Head-Up Display
// Muestra: dinero, nivel, reputación, día, eventos
// ============================================================

import { THEME, drawRusticCard, drawWoodPanel, drawPriceTag, drawPinnedPaper, drawHangingSign } from './Theme.js?v=6';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
    }

    create() {
        const { width, height } = this.scene.cameras.main;

        // HUD Background - NO MORE full bar. We use individual diegetic bits.
        const cardGfx = this.scene.add.graphics().setDepth(9001);
        this.elements.push(cardGfx);

        // --- MONEY (Pinned Paper at Top Left) ---
        const moneyW = 120, moneyH = 40;
        drawPinnedPaper(cardGfx, 20, 20, moneyW, moneyH, THEME.colors.cremaLona);
        
        this.moneyText = this.scene.add.text(20 + moneyW / 2, 42, '$500', {
            fontSize: '18px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.verdeNopal,
        }).setOrigin(0.5).setDepth(9002);
        this.elements.push(this.moneyText);

        const moneyLabel = this.scene.add.text(20 + moneyW / 2, 30, 'EFECTIVO', {
            fontSize: '9px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.maderaOscura
        }).setOrigin(0.5).setDepth(9002).setAlpha(0.7);
        this.elements.push(moneyLabel);

        // --- DAY (Hanging Sign at Top Right) ---
        const dayW = 100, dayH = 45;
        const dayX = width - 120;
        drawHangingSign(cardGfx, dayX, 25, dayW, dayH, THEME.colors.carton);
        
        this.dayText = this.scene.add.text(dayX + dayW / 2, 25 + 22, 'DÍA 1', {
            fontSize: '16px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.maderaOscura
        }).setOrigin(0.5).setDepth(9002);
        this.elements.push(this.dayText);

        // --- REPUTATION (Cardboard scrap below Money) ---
        const repX = 20, repY = 75, repW = 120, repH = 30;
        drawRusticCard(cardGfx, repX, repY, repW, repH, THEME.colors.carton, THEME.colors.maderaOscura);
        
        this.repText = this.scene.add.text(repX + 10, repY + 15, '🤝 50%', {
            fontSize: '11px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.maderaOscura
        }).setOrigin(0, 0.5).setDepth(9002);
        this.elements.push(this.repText);

        this.repBar = this.scene.add.graphics().setDepth(9002);
        this.elements.push(this.repBar);

        // --- INVENTORY (Pinned paper bottom right or top right below day?) ---
        // Let's put it top right below day
        const invX = width - 120, invY = 85, invW = 100, invH = 30;
        drawPinnedPaper(cardGfx, invX, invY, invW, invH, THEME.colors.cremaLona);
        
        this.invText = this.scene.add.text(invX + invW / 2, invY + 15, '📦 0/10', {
            fontSize: '12px', fontFamily: THEME.fonts.main, color: '#2C1E12', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(9002);
        this.elements.push(this.invText);

        // --- LEVEL (Small wood tag below Inventory) ---
        const lvlX = width - 120, lvlY = 125, lvlW = 100, lvlH = 22;
        drawRusticCard(cardGfx, lvlX, lvlY, lvlW, lvlH, THEME.colors.madera, THEME.colors.maderaOscura);
        
        this.levelText = this.scene.add.text(lvlX + lvlW / 2, lvlY + 7, '⭐ Nivel 1', {
            fontSize: '10px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#F5F0E8'
        }).setOrigin(0.5).setDepth(9002);
        this.elements.push(this.levelText);

        this.levelName = this.scene.add.text(lvlX + lvlW / 2, lvlY + 17, 'Puesto improvisado', {
            fontSize: '7px', fontFamily: THEME.fonts.main, color: '#F5F0E8'
        }).setOrigin(0.5).setDepth(9002).setAlpha(0.8);
        this.elements.push(this.levelName);

        // Event indicator (Hanging bit at far right)
        this.eventText = this.scene.add.text(width - 140, 48, '', {
            fontSize: '24px', fontFamily: THEME.fonts.main
        }).setOrigin(1, 0.5).setDepth(9002).setInteractive({ useHandCursor: true });
        this.elements.push(this.eventText);

        this.eventText.on('pointerover', (pointer) => {
            const state = this.scene.getGameState ? this.scene.getGameState() : {};
            const events = state.activeEvents || [];
            if (events.length === 0) return;
            
            const eventDesc = events.map(e => `${e.icon} ${e.name}`).join('\n');
            this.activeTooltipText = this.scene.add.text(pointer.x - 10, pointer.y + 25, eventDesc, {
                fontSize: '14px', fontFamily: THEME.fonts.main, color: '#F5F0E8', 
                align: 'right', backgroundColor: '#2C1E12', padding: { x: 8, y: 8 }
            }).setOrigin(1, 0).setDepth(10000);
            this.elements.push(this.activeTooltipText);
        });

        this.eventText.on('pointerout', () => {
            if (this.activeTooltipText) {
                this.activeTooltipText.destroy();
                this.activeTooltipText = null;
            }
        });
    }

    update(state) {
        if (!state) return;

        const LEVEL_NAMES = {
            1: 'Puesto improvisado',
            2: 'Puesto con lona',
            3: 'Puesto grande',
            4: 'Tienda fija',
            5: 'Importador internacional'
        };

        // Money
        this.moneyText.setText(`$${state.money || 0}`);

        // Level
        if (this.levelText) this.levelText.setText(`⭐ Nivel ${state.level || 1}`);
        if (this.levelName) this.levelName.setText(LEVEL_NAMES[state.level] || 'Puesto improvisado');

        // Reputation
        const rep = state.reputation || 50;
        this.repText.setText(`🤝 ${rep}%`);

        if (this.repBar) {
            this.repBar.clear();
            this.repBar.fillStyle(0x333333, 0.5);
            this.repBar.fillRoundedRect(60, 75 + 10, 75, 10, 4);
            this.repBar.fillStyle(THEME.colors.acentoAdvertencia, 1);
            this.repBar.fillRoundedRect(60, 75 + 10, 75 * (rep / 100), 10, 4);
        }

        // Day
        this.dayText.setText(`DÍA ${state.day || 1}`);

        // Inventory
        this.invText.setText(`📦 ${state.inventoryCount || 0}/${state.inventoryCapacity || 10}`);

        // Events
        const events = state.activeEvents || [];
        if (events.length > 0) {
            this.eventText.setText(events.map(e => e.icon).join(' '));
        } else {
            this.eventText.setText('');
        }
    }

    destroy() {
        for (const el of this.elements) {
            if (el && el.destroy) el.destroy();
        }
    }
}
