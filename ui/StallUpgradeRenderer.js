// ============================================================
// StallUpgradeRenderer — Draws level-based visual upgrades for
// the player's stall.
// Stateless rendering helper used by PlayerStallRenderer.
// ============================================================

/**
 * Draw level-scaled visual upgrades on the player stall.
 * @param {Phaser.Scene} scene
 * @param {number} px - Center X of stall
 * @param {number} py - Center Y of stall
 * @param {number} level
 */
export function drawStallUpgrades(scene, px, py, level) {
    const g = scene.add.graphics();
    g.setDepth(py + 3);

    // Level 2+: Tarp Canopy, Crates, Table Merchandise
    if (level >= 2) {
        g.fillStyle(0xD84315, 0.7);
        g.fillRect(px - 55, py - 75, 110, 12);
        g.fillStyle(0x000000, 0.15);
        g.fillRect(px - 55, py - 63, 110, 3);

        g.fillStyle(0x6D4C41, 0.85);
        g.fillRect(px - 62, py + 20, 18, 16);
        g.lineStyle(1, 0x3E2723, 0.6);
        g.strokeRect(px - 62, py + 20, 18, 16);
        g.lineBetween(px - 62, py + 20, px - 44, py + 36);

        g.fillStyle(0x795548, 0.8);
        g.fillRect(px + 44, py + 24, 14, 12);
        g.lineStyle(1, 0x3E2723, 0.5);
        g.strokeRect(px + 44, py + 24, 14, 12);

        const merchColors = [0xF44336, 0x2196F3, 0x4CAF50, 0xFFEB3B];
        for (let i = 0; i < 4; i++) {
            g.fillStyle(merchColors[i], 0.7);
            g.fillRect(px - 30 + i * 16, py - 8, 10, 7);
        }
    }

    // Level 3+: Wider Canopy, Shelf, Price Tag
    if (level >= 3) {
        g.fillStyle(0xBF360C, 0.65);
        g.fillRect(px - 70, py - 77, 140, 14);
        g.fillStyle(0xFFEB3B, 0.5);
        g.fillRect(px - 70, py - 64, 140, 2);

        g.fillStyle(0x5D4037, 0.8);
        g.fillRect(px + 30, py - 20, 22, 14);
        g.fillStyle(0x4E342E, 0.75);
        g.fillRect(px + 32, py - 32, 18, 12);
        g.lineStyle(1, 0x3E2723, 0.4);
        g.strokeRect(px + 30, py - 20, 22, 14);
        g.strokeRect(px + 32, py - 32, 18, 12);

        g.fillStyle(0xFFF9C4, 0.9);
        g.fillRect(px + 35, py - 60, 14, 10);
        g.lineStyle(1, 0x795548, 0.6);
        g.strokeRect(px + 35, py - 60, 14, 10);
        g.lineStyle(1, 0x6D4C41, 0.5);
        g.lineBetween(px + 42, py - 64, px + 42, py - 60);
        scene.add.text(px + 42, py - 55, '$', {
            fontSize: '7px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#5D4037'
        }).setOrigin(0.5).setDepth(py + 4);
    }

    // Level 4+: Structural Poles, Richer Display, Hanging Light
    if (level >= 4) {
        const poleG = scene.add.graphics();
        poleG.setDepth(py - 1);

        poleG.lineStyle(4, 0x4E342E, 0.9);
        poleG.lineBetween(px - 58, py - 75, px - 58, py + 30);
        poleG.lineBetween(px + 58, py - 75, px + 58, py + 30);

        poleG.lineStyle(3, 0x5D4037, 0.8);
        poleG.lineBetween(px - 58, py - 75, px + 58, py - 75);

        poleG.lineStyle(2, 0x6D4C41, 0.6);
        poleG.lineBetween(px - 58, py - 40, px - 45, py - 40);
        poleG.lineBetween(px + 58, py - 40, px + 45, py - 40);

        const richG = scene.add.graphics();
        richG.setDepth(py + 3);
        const richColors = [0xE91E63, 0x9C27B0, 0x00BCD4, 0xFF5722, 0x8BC34A];
        for (let i = 0; i < 5; i++) {
            richG.fillStyle(richColors[i], 0.65);
            richG.fillRoundedRect(px - 35 + i * 14, py - 12, 11, 9, 2);
        }

        const lightG = scene.add.graphics();
        lightG.setDepth(py + 5);
        lightG.lineStyle(1, 0x424242, 0.7);
        lightG.lineBetween(px, py - 75, px, py - 58);
        lightG.fillStyle(0xFFF9C4, 0.9);
        lightG.fillCircle(px, py - 55, 4);
        lightG.fillStyle(0xFFD54F, 0.15);
        lightG.fillCircle(px, py - 55, 12);
    }

    // Level 5: Sign Board, Premium Items, Warm Glow
    if (level >= 5) {
        const signG = scene.add.graphics();
        signG.setDepth(py + 6);
        signG.fillStyle(0x3E2723, 0.9);
        signG.fillRoundedRect(px - 40, py - 98, 80, 20, 4);
        signG.lineStyle(1, 0xFFD54F, 0.6);
        signG.strokeRoundedRect(px - 40, py - 98, 80, 20, 4);

        scene.add.text(px, py - 88, 'EL PUESTO', {
            fontSize: '10px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD54F'
        }).setOrigin(0.5).setDepth(py + 7);

        const premG = scene.add.graphics();
        premG.setDepth(py + 4);
        premG.fillStyle(0xFFD700, 0.6);
        premG.fillCircle(px - 20, py - 6, 5);
        premG.lineStyle(1, 0xFFA000, 0.7);
        premG.strokeCircle(px - 20, py - 6, 5);
        premG.fillStyle(0xAB47BC, 0.6);
        premG.fillTriangle(px + 10, py - 2, px + 16, py - 14, px + 22, py - 2);
        premG.fillStyle(0x1565C0, 0.5);
        premG.fillRect(px - 5, py - 14, 12, 10);
        premG.lineStyle(1, 0xFFD700, 0.7);
        premG.strokeRect(px - 5, py - 14, 12, 10);

        const warmGlow = scene.add.graphics();
        warmGlow.setDepth(py - 5);
        warmGlow.fillStyle(0xFFAB00, 0.06);
        warmGlow.fillEllipse(px, py + 15, 200, 70);
    }
}
