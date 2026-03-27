// ============================================================
// TianguisButtons — Action buttons as hanging signs from beam
// All 4 buttons share the same visual family (drawHangingSign)
// ============================================================

import { THEME, drawHangingSign } from './Theme.js?v=6';
import { FRAME_THICKNESS, FRAME_TOP } from './TianguisRenderer.js?v=6';

/**
 * Create the HUD action buttons hanging from the top beam.
 * Evenly spaced in the center area between HUD signs.
 */
export function createUIButtons(scene, width, height, callbacks) {
    const beamBottom = FRAME_TOP;
    const signY = beamBottom + 3;
    const btnH = 36;
    const btnW = 82;
    const gap = 6;

    // Center the 4 buttons in the available space
    const totalW = 4 * btnW + 3 * gap;
    const startX = (width - totalW) / 2;

    const btnConfig = [
        { text: 'Sig. Día',    color: THEME.colors.lonaPrincipal,    action: callbacks.onAdvanceDay },
        { text: 'Mejora',      color: THEME.colors.acentoAdvertencia, action: callbacks.onUpgrade },
        { text: 'Mercado',     color: THEME.colors.lonaSecundaria,   action: callbacks.onMarket },
        { text: 'Inventario',  color: THEME.colors.madera,          action: callbacks.onInventory }
    ];

    for (let i = 0; i < btnConfig.length; i++) {
        const cfg = btnConfig[i];
        const bx = startX + i * (btnW + gap);

        const bg = scene.add.graphics().setDepth(9510);
        drawHangingSign(bg, bx, signY, btnW, btnH, cfg.color);

        const btn = scene.add.text(bx + btnW / 2, signY + btnH / 2 + 2, cfg.text, {
            fontSize: '11px', fontFamily: THEME.fonts.main, fontStyle: '900',
            color: '#F5F0E8',
            stroke: '#2C1E12', strokeThickness: 1
        }).setOrigin(0.5).setDepth(9511).setInteractive({ useHandCursor: true });

        // Hover: gentle alpha pulse, NO scale change
        btn.on('pointerover', () => {
            bg.setAlpha(0.8);
        });
        btn.on('pointerout', () => {
            bg.setAlpha(1);
        });
        btn.on('pointerdown', cfg.action);
    }
}
