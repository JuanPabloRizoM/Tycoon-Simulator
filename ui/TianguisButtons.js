// Stateless renderer: creates buttons and wires them to callbacks
// ============================================================

import { THEME, drawRusticCard, drawHangingSign } from './Theme.js?v=6';

/**
 * Create the HUD action buttons at the bottom of the screen.
 *
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @param {object} callbacks - { onInventory, onMarket, onAdvanceDay, onUpgrade }
 */
export function createUIButtons(scene, width, height, callbacks) {
    const btnConfig = [
        { text: 'Inventario', x: width - 110, y: height - 55, color: THEME.colors.lonaSecundaria, action: callbacks.onInventory },
        { text: 'Mercado',    x: width - 215, y: height - 55, color: THEME.colors.verdeNopal,     action: callbacks.onMarket },
        { text: 'Sig. Día',   x: 15,          y: height - 55, color: THEME.colors.acentoError,    action: callbacks.onAdvanceDay },
        { text: 'Mejora',     x: 120,         y: height - 55, color: THEME.colors.acentoAdvertencia, action: callbacks.onUpgrade }
    ];

    for (const cfg of btnConfig) {
        const bg = scene.add.graphics().setDepth(9998);
        // Draw as hanging sign (cardboard style)
        drawHangingSign(bg, cfg.x, cfg.y, 90, 38, cfg.color);

        const btn = scene.add.text(cfg.x + 45, cfg.y + 19, cfg.text, {
            fontSize: '11px', fontFamily: THEME.fonts.main, fontStyle: '900',
            color: THEME.colors.textLight,
            stroke: '#2C1E12', strokeThickness: 1
        }).setOrigin(0.5).setDepth(9999).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            scene.tweens.add({
                targets: [btn], scaleX: 1.1, scaleY: 1.1,
                duration: 100, ease: 'Back.easeOut'
            });
            bg.setAlpha(0.8);
        });
        btn.on('pointerout', () => {
            scene.tweens.add({
                targets: [btn], scaleX: 1, scaleY: 1,
                duration: 100
            });
            bg.setAlpha(1);
        });
        btn.on('pointerdown', cfg.action);
    }
}
