// ============================================================
// UpgradesPanel — UI modal to purchase specific stall upgrades
// ============================================================

import { UPGRADE_TREES } from '../data/upgrades.js';
import { STATE_KEYS, getState } from '../core/GameState.js';
import { THEME, drawWarmOverlayPanel } from './Theme.js?v=6';

/**
 * Toggle the upgrades panel.
 */
export function toggleUpgrades(scene) {
    if (scene.upgradesPanel) {
        if (scene.activeTooltipBg) scene.activeTooltipBg.destroy();
        if (scene.activeTooltipText) scene.activeTooltipText.destroy();
        scene.upgradesPanel.forEach(obj => obj.destroy());
        scene.upgradesPanel = null;
        return;
    }

    const { width, height } = scene.cameras.main;
    const panelX = width / 2 - 250;
    const panelY = 80;
    const panelW = 500;
    const panelH = height - 160;

    scene.upgradesPanel = [];

    const bg = scene.add.graphics().setDepth(9980);
    drawWarmOverlayPanel(bg, panelX, panelY, panelW, panelH, THEME.colors.acentoAdvertencia);
    scene.upgradesPanel.push(bg);

    const title = scene.add.text(
        width / 2, panelY + 25,
        '⭐ Mejoras del Puesto',
        { fontSize: '20px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#F0C040' }
    ).setOrigin(0.5).setDepth(9981);
    scene.upgradesPanel.push(title);

    const closeBtn = scene.add.text(panelX + panelW - 30, panelY + 10, '✕', {
        fontSize: '20px', fontFamily: THEME.fonts.main, color: '#C0392B'
    }).setDepth(9982).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => toggleUpgrades(scene));
    scene.upgradesPanel.push(closeBtn);

    const startY = panelY + 60;
    const trees = Object.values(UPGRADE_TREES);
    const rowHeight = 60;

    trees.forEach((tree, i) => {
        const iy = startY + i * rowHeight;
        const currentLevel = getState(scene.registry, STATE_KEYS[tree.id]);
        const cost = tree.costs[currentLevel];
        const isMaxed = currentLevel >= tree.maxLevel;
        const money = getState(scene.registry, STATE_KEYS.PLAYER_MONEY);
        const canAfford = money >= cost;

        const rowBg = scene.add.graphics().setDepth(9981);
        rowBg.fillStyle(THEME.colors.madera, 0.4);
        rowBg.fillRoundedRect(panelX + 20, iy, panelW - 40, 50, 6);
        scene.upgradesPanel.push(rowBg);

        const nameText = scene.add.text(panelX + 35, iy + 8, `${tree.name} (Nvl ${currentLevel})`, {
            fontSize: '15px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: isMaxed ? '#4CAF50' : '#F5F0E8'
        }).setDepth(9982);
        scene.upgradesPanel.push(nameText);

        const descText = scene.add.text(panelX + 35, iy + 28, tree.description, {
            fontSize: '12px', fontFamily: THEME.fonts.main, color: '#A09080', wordWrap: { width: 300 }
        }).setDepth(9982);
        scene.upgradesPanel.push(descText);

        if (!isMaxed) {
            const btnBg = scene.add.graphics().setDepth(9982);
            btnBg.fillStyle(canAfford ? 0x4CAF50 : 0x555555, 1);
            btnBg.fillRoundedRect(panelX + panelW - 120, iy + 10, 90, 30, 6);
            scene.upgradesPanel.push(btnBg);

            const btnText = scene.add.text(panelX + panelW - 75, iy + 25, `$${cost}`, {
                fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#F5F0E8'
            }).setOrigin(0.5).setDepth(9983);
            scene.upgradesPanel.push(btnText);

            // Interactive zone over the button graphic
            const hitArea = scene.add.zone(panelX + panelW - 120, iy + 10, 90, 30).setOrigin(0).setInteractive({ useHandCursor: canAfford }).setDepth(9984);
            scene.upgradesPanel.push(hitArea);

            if (canAfford) {
                hitArea.on('pointerdown', () => {
                    if (scene.activeTooltipBg) scene.activeTooltipBg.destroy();
                    if (scene.activeTooltipText) scene.activeTooltipText.destroy();
                    scene.buySpecificUpgrade(tree.id, cost);
                    toggleUpgrades(scene);
                    toggleUpgrades(scene); 
                });
            }

            // Minimal Tooltip — warm dark background
            hitArea.on('pointerover', (pointer) => {
                const txt = `Costo: $${cost}\nNivel ${currentLevel} -> Nivel ${currentLevel + 1}`;
                scene.activeTooltipText = scene.add.text(pointer.x, pointer.y - 15, txt, {
                    fontSize: '13px', fontFamily: THEME.fonts.main, color: '#F5F0E8', align: 'center', backgroundColor: '#2C1E12', padding: { x: 6, y: 6 }
                }).setOrigin(0.5, 1).setDepth(10000);
                scene.upgradesPanel.push(scene.activeTooltipText);
            });

            hitArea.on('pointerout', () => {
                if (scene.activeTooltipText) {
                    scene.activeTooltipText.destroy();
                    scene.activeTooltipText = null;
                }
            });
        } else {
            const maxText = scene.add.text(panelX + panelW - 75, iy + 25, 'MÁXIMO', {
                fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#4CAF50'
            }).setOrigin(0.5).setDepth(9982);
            scene.upgradesPanel.push(maxText);
        }
    });

    const tip = scene.add.text(width / 2, panelY + panelH - 25, 'Cada mejora afecta las mecánicas del mercado al instante.', {
        fontSize: '11px', fontFamily: THEME.fonts.main, color: '#7A6858'
    }).setOrigin(0.5).setDepth(9981);
    scene.upgradesPanel.push(tip);
}
