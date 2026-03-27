// ============================================================
// HUD — Head-Up Display (Hanging Signs from Top Beam)
// All indicators hang from the stall frame's top beam as
// diegetic cardboard/wood signs on strings.
// ============================================================

import { THEME, drawHangingSign, drawRusticCard } from './Theme.js?v=6';
import { FRAME_THICKNESS, FRAME_TOP } from './TianguisRenderer.js?v=6';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
    }

    create() {
        const { width } = this.scene.cameras.main;
        const beamBottom = FRAME_TOP; // Signs hang from this Y

        // All signs hang from the beam at consistent Y
        const signY = beamBottom + 3; // Just below the beam
        const signH = 38;

        const cardGfx = this.scene.add.graphics().setDepth(9510);
        this.elements.push(cardGfx);

        // ── MONEY (Left side, hanging sign) ──
        const moneyX = FRAME_THICKNESS + 8;
        const moneyW = 105;
        drawHangingSign(cardGfx, moneyX, signY, moneyW, signH, THEME.colors.carton);

        const moneyLabel = this.scene.add.text(moneyX + moneyW / 2, signY + 10, 'EFECTIVO', {
            fontSize: '8px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#7A6858'
        }).setOrigin(0.5).setDepth(9511);
        this.elements.push(moneyLabel);

        this.moneyText = this.scene.add.text(moneyX + moneyW / 2, signY + 26, '$500', {
            fontSize: '16px', fontFamily: THEME.fonts.main, fontStyle: '900', color: '#2A9D8F',
        }).setOrigin(0.5).setDepth(9511);
        this.elements.push(this.moneyText);

        // ── REPUTATION (Next hanging sign) ──
        const repX = moneyX + moneyW + 8;
        const repW = 95;
        drawHangingSign(cardGfx, repX, signY, repW, signH, THEME.colors.carton);

        this.repText = this.scene.add.text(repX + repW / 2, signY + 10, '🤝 50%', {
            fontSize: '10px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#4A3525'
        }).setOrigin(0.5).setDepth(9511);
        this.elements.push(this.repText);

        this.repBar = this.scene.add.graphics().setDepth(9511);
        this.elements.push(this.repBar);
        // Rep bar position stored for update
        this._repBarX = repX + 10;
        this._repBarY = signY + 24;
        this._repBarW = repW - 20;

        // ── DAY (Right side, hanging sign) ──
        const dayW = 85;
        const dayX = width - FRAME_THICKNESS - dayW - 8;
        drawHangingSign(cardGfx, dayX, signY, dayW, signH, THEME.colors.carton);

        this.dayText = this.scene.add.text(dayX + dayW / 2, signY + 20, 'DÍA 1', {
            fontSize: '15px', fontFamily: THEME.fonts.main, fontStyle: '900', color: '#4A3525'
        }).setOrigin(0.5).setDepth(9511);
        this.elements.push(this.dayText);

        // ── INVENTORY (Next to Day, hanging sign) ──
        const invW = 85;
        const invX = dayX - invW - 8;
        drawHangingSign(cardGfx, invX, signY, invW, signH, THEME.colors.carton);

        this.invText = this.scene.add.text(invX + invW / 2, invY_center(signY, signH), '📦 0/10', {
            fontSize: '12px', fontFamily: THEME.fonts.main, color: '#2C1E12', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(9511);
        this.elements.push(this.invText);

        // ── LEVEL (Small tag, below rep bar) ──
        this.levelText = this.scene.add.text(repX + repW / 2, signY + signH + 5, '⭐ Nivel 1', {
            fontSize: '8px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#A0896E'
        }).setOrigin(0.5).setDepth(9510).setAlpha(0.7);
        this.elements.push(this.levelText);

        this.levelName = null; // Level name not shown (too small, clutters)

        // ── EVENT INDICATOR ──
        this.eventText = this.scene.add.text(width / 2, signY + 12, '', {
            fontSize: '22px', fontFamily: THEME.fonts.main
        }).setOrigin(0.5).setDepth(9511).setInteractive({ useHandCursor: true });
        this.elements.push(this.eventText);

        this.eventText.on('pointerover', (pointer) => {
            const state = this.scene.getGameState ? this.scene.getGameState() : {};
            const events = state.activeEvents || [];
            if (events.length === 0) return;
            
            const eventDesc = events.map(e => `${e.icon} ${e.name}`).join('\n');
            this.activeTooltipText = this.scene.add.text(pointer.x - 10, pointer.y + 25, eventDesc, {
                fontSize: '13px', fontFamily: THEME.fonts.main, color: '#F5F0E8', 
                align: 'right', backgroundColor: '#2C1E12', padding: { x: 8, y: 6 }
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

        // Money
        this.moneyText.setText(`$${state.money || 0}`);

        // Level
        if (this.levelText) this.levelText.setText(`⭐ Nivel ${state.level || 1}`);

        // Reputation
        const rep = state.reputation || 50;
        this.repText.setText(`🤝 ${rep}%`);

        if (this.repBar) {
            this.repBar.clear();
            this.repBar.fillStyle(THEME.colors.maderaOscura, 0.4);
            this.repBar.fillRoundedRect(this._repBarX, this._repBarY, this._repBarW, 8, 3);
            this.repBar.fillStyle(THEME.colors.acentoAdvertencia, 1);
            this.repBar.fillRoundedRect(this._repBarX, this._repBarY, this._repBarW * (rep / 100), 8, 3);
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

// Helper — vertical center of a sign
function invY_center(signY, signH) {
    return signY + signH / 2 + 2;
}
