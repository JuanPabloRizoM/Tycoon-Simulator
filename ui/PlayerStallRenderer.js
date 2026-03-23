// ============================================================
// PlayerStallRenderer — Draws the player's stall with level-
// based visual progression (L1 improvised → L5 established)
// Stateless: only needs scene for Phaser factories, level for visuals
// ============================================================

import { drawStallUpgrades } from './StallUpgradeRenderer.js?v=6';
import { THEME, drawRusticCard } from './Theme.js?v=6';

/**
 * Draw the player's stall at center bottom of the screen.
 *
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @param {number} level - Player level (1-5)
 */
export function drawPlayerStall(scene, width, height, level) {
    const px = width / 2;
    const py = height - 100;

    // Ground glow — intensity scales with level
    const glowAlpha = 0.06 + (level - 1) * 0.02;
    const glowSize = 140 + (level - 1) * 10;
    const glow = scene.add.graphics();
    glow.fillStyle(0xFFD700, glowAlpha);
    glow.fillEllipse(px, py + 10, glowSize, 55);
    glow.setDepth(py - 10);

    scene.tweens.add({
        targets: glow,
        alpha: { from: glowAlpha - 0.02, to: glowAlpha + 0.02 },
        scaleX: { from: 1, to: 1.02 },
        scaleY: { from: 1, to: 1.02 },
        duration: 3000, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Player stall sprite
    const stallKey = scene.textures.exists('player_stall') ? 'player_stall' : 'stall';
    const stall = scene.add.sprite(px, py, stallKey);
    stall.setScale(1.2);
    stall.setDepth(py);

    // Label — evolves with level
    const stallLabels = [
        '⭐️ Mi Puesto ⭐️',
        '⭐️ Mi Negocito ⭐️',
        '⭐️⭐️ Mi Templo ⭐️⭐️',
        '🏪 Negocio Próspero 🏪',
        '🏪 El Rey del Tianguis 🏪'
    ];
    
    const labelBg = scene.add.graphics();
    drawRusticCard(labelBg, px - 90, py + 40, 180, 28, THEME.colors.ambarCemp, THEME.colors.textDark);
    labelBg.setDepth(py + 1);

    scene.add.text(px, py + 54, stallLabels[level - 1], {
        fontSize: '13px', fontFamily: THEME.fonts.main, fontStyle: 'bold',
        color: THEME.colors.textDark
    }).setOrigin(0.5).setDepth(py + 2);

    // Player character
    const playerSprite = scene.add.sprite(px, py - 40, 'player', 0);
    playerSprite.setScale(0.9);
    playerSprite.setDepth(py + 2);

    scene.tweens.add({
        targets: playerSprite,
        scaleY: { from: 0.9, to: 0.92 },
        duration: 1500, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    scene.time.addEvent({
        delay: 5000,
        callback: () => {
            playerSprite.setFlipX(!playerSprite.flipX);
            scene.tweens.add({
                targets: playerSprite,
                y: playerSprite.y - 2,
                duration: 200, yoyo: true, ease: 'Sine.easeOut'
            });
        },
        loop: true
    });

    // Layered upgrade visuals (delegated)
    drawStallUpgrades(scene, px, py, level);
}
