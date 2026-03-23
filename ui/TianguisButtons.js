// Stateless renderer: creates buttons and wires them to callbacks
// ============================================================

import { THEME, drawRusticCard } from './Theme.js?v=6';

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
        { text: '📦 Inventario',   x: width - 130, color: THEME.colors.azulTurquesa, action: callbacks.onInventory },
        { text: '📊 Mercado',      x: width - 260, color: THEME.colors.verdeNopal, action: callbacks.onMarket },
        { text: '⏩ Sig. Día',     x: 20,          color: THEME.colors.rojoChile, action: callbacks.onAdvanceDay },
        { text: '⭐ Mejora',       x: 150,         color: THEME.colors.ambarCemp, action: callbacks.onUpgrade }
    ];

    for (const cfg of btnConfig) {
        const bg = scene.add.graphics().setDepth(9998);
        drawRusticCard(bg, cfg.x, height - 50, 120, 42, cfg.color, THEME.colors.textDark);

        const btn = scene.add.text(cfg.x + 60, height - 29, cfg.text, {
            fontSize: '13px', fontFamily: THEME.fonts.main, fontStyle: '900',
            color: THEME.colors.textLight,
            stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(9999).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            scene.tweens.add({
                targets: [btn, bg], y: { from: 0, to: -3 },
                duration: 100, ease: 'Sine.easeOut'
            });
            btn.setScale(1.1);
        });
        btn.on('pointerout', () => {
            scene.tweens.add({
                targets: [btn, bg], y: 0,
                duration: 100, ease: 'Sine.easeOut'
            });
            btn.setScale(1);
        });
        btn.on('pointerdown', cfg.action);
    }
}
