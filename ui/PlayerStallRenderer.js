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

    // 1. STALL TABLE (Foreground focus)
    // We use the HQ table asset and scale it wide to fill the bottom
    const stall = scene.add.image(px, height + 10, 'stall_table_hq').setOrigin(0.5, 1);
    stall.displayWidth = width * 1.2; // Over-the-counter illusion
    stall.scaleY = stall.scaleX * 0.8; // Slightly squashed for perspective
    stall.setDepth(9000); // Behind HUD but in front of everything else

    // 2. STALL LABEL (Diegetic paper pinned to the wood)
    const labelW = 160, labelH = 40;
    const labelBg = scene.add.graphics().setDepth(9001);
    drawRusticCard(labelBg, px - labelW / 2, height - 50, labelW, labelH, THEME.colors.cremaLona);

    const stallLabels = [
        'MI PUESTO',
        'MI NEGOCITO',
        'MI TEMPLO',
        'NEGOCIO PRÓSPERO',
        'EL REY DEL TIANGUIS'
    ];
    
    scene.add.text(px, height - 30, stallLabels[level - 1], {
        fontSize: '12px', fontFamily: THEME.fonts.main, fontStyle: 'bold',
        color: THEME.colors.maderaOscura
    }).setOrigin(0.5, 1).setDepth(9002);

    // 3. AMBIENT SHADOWS/DETAILS ON TABLE
    // (Simulating items lying around via subtle graphics)
    const tableDetails = scene.add.graphics().setDepth(9001);
    tableDetails.fillStyle(0x000000, 0.1);
    // Random "item" shadows on the table
    for(let i=0; i<3; i++) {
        tableDetails.fillEllipse(px + (i-1)*150, height-20, 80, 20);
    }

    // Layered upgrade visuals (delegated)
    drawStallUpgrades(scene, px, py, level);
}
