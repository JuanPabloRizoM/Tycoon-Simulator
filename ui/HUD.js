// ============================================================
// HUD — Head-Up Display
// Muestra: dinero, nivel, reputación, día, eventos
// ============================================================

import { THEME, drawRusticCard, drawWoodPanel, drawPriceTag } from './Theme.js?v=6';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
    }

    create() {
        const { width } = this.scene.cameras.main;

        // HUD Background bar - Wooden shelf style
        const bg = this.scene.add.graphics().setDepth(9000);
        drawWoodPanel(bg, 10, 8, width - 20, 48);
        this.elements.push(bg);

        // Individual stat cards
        const cardGfx = this.scene.add.graphics().setDepth(9001);
        this.elements.push(cardGfx);

        // Money Card (Price Tag style)
        drawPriceTag(cardGfx, 20, 14, 140, 36, THEME.colors.verdeNopal);
        const coinIcon = this.scene.add.sprite(40, 32, 'coin').setScale(0.8).setDepth(9002);
        this.elements.push(coinIcon);

        this.moneyText = this.scene.add.text(56, 32, '$500', {
            fontSize: '18px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.textLight,
            stroke: '#000', strokeThickness: 1
        }).setOrigin(0, 0.5).setDepth(9002);
        this.elements.push(this.moneyText);

        // Level/Stall Card
        drawRusticCard(cardGfx, 170, 14, 170, 36, THEME.colors.cremaLona, THEME.colors.cuerito);
        this.levelText = this.scene.add.text(180, 22, '⭐ Nivel 1', {
            fontSize: '12px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textDark
        }).setOrigin(0, 0.5).setDepth(9002);
        this.elements.push(this.levelText);

        this.levelName = this.scene.add.text(180, 38, 'Puesto improvisado', {
            fontSize: '10px', fontFamily: THEME.fonts.main, color: THEME.colors.textDark, fontStyle: 'italic'
        }).setOrigin(0, 0.5).setDepth(9002);
        this.elements.push(this.levelName);

        // Reputation Card
        drawRusticCard(cardGfx, 350, 14, 160, 36, THEME.colors.azulTurquesa, THEME.colors.textDark);
        this.repText = this.scene.add.text(360, 32, '🤝 Reputación', {
            fontSize: '12px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textDark
        }).setOrigin(0, 0.5).setDepth(9002);
        this.elements.push(this.repText);

        this.repBar = this.scene.add.graphics().setDepth(9002);
        this.elements.push(this.repBar);

        // Day Tag (Price Tag style)
        drawPriceTag(cardGfx, 520, 14, 120, 36, THEME.colors.rojoChile);
        this.dayText = this.scene.add.text(580, 32, '📅 Día 1', {
            fontSize: '16px', fontFamily: THEME.fonts.main, fontStyle: '900', color: THEME.colors.textLight
        }).setOrigin(0.5, 0.5).setDepth(9002);
        this.elements.push(this.dayText);

        // Inventory count Card
        drawPriceTag(cardGfx, 650, 14, 100, 36, THEME.colors.ambarCemp);
        this.invText = this.scene.add.text(700, 32, '📦 0/10', {
            fontSize: '13px', fontFamily: THEME.fonts.main, color: THEME.colors.textDark, fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setDepth(9002);
        this.elements.push(this.invText);

        // Event indicator
        this.eventText = this.scene.add.text(width - 35, 32, '', {
            fontSize: '24px', fontFamily: THEME.fonts.main
        }).setOrigin(1, 0.5).setDepth(9002).setInteractive({ useHandCursor: true });
        this.elements.push(this.eventText);

        this.eventText.on('pointerover', (pointer) => {
            const state = this.scene.getGameState ? this.scene.getGameState() : {};
            const events = state.activeEvents || [];
            if (events.length === 0) return;
            
            const eventDesc = events.map(e => `${e.icon} ${e.name}`).join('\n');
            this.activeTooltipText = this.scene.add.text(pointer.x - 10, pointer.y + 25, eventDesc, {
                fontSize: '14px', fontFamily: THEME.fonts.main, color: THEME.colors.textLight, 
                align: 'right', backgroundColor: '#000', padding: { x: 8, y: 8 }
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
        this.levelText.setText(`⭐ Nivel ${state.level || 1}`);
        this.levelName.setText(LEVEL_NAMES[state.level] || 'Puesto improvisado');

        // Reputation
        const rep = state.reputation || 50;
        this.repText.setText(`🤝 ${rep}`);

        if (this.repBar) {
            this.repBar.clear();
            this.repBar.fillStyle(0x333333, 0.5);
            this.repBar.fillRoundedRect(445, 23, 60, 18, 4);
            this.repBar.fillStyle(THEME.colors.naranjaMango, 1);
            this.repBar.fillRoundedRect(445, 23, 60 * (rep / 100), 18, 4);
        }

        // Day
        this.dayText.setText(`📅 Día ${state.day || 1}`);

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
