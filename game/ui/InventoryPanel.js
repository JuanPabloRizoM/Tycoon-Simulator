// ============================================================
// InventoryPanel — Inventory UI panel for TianguisScene
// Stateless: receives scene + deps, returns panel elements array
// ============================================================

import { THEME, drawWarmOverlayPanel } from './Theme.js?v=6';

/**
 * Toggle the inventory panel on/off.
 * Manages lifecycle via scene.inventoryPanel array.
 *
 * @param {Phaser.Scene} scene
 * @param {InventoryManager} inventoryManager
 * @param {EconomySystem} economySystem
 */
export function toggleInventory(scene, inventoryManager, economySystem) {
    // Close if already open
    if (scene.inventoryPanel) {
        scene.inventoryPanel.forEach(obj => obj.destroy());
        scene.inventoryPanel = null;
        return;
    }

    const { width, height } = scene.cameras.main;
    const panelX = width / 2 - 200;
    const panelY = 60;
    const panelW = 400;
    const panelH = height - 120;

    scene.inventoryPanel = [];

    const bg = scene.add.graphics().setDepth(9980);
    drawWarmOverlayPanel(bg, panelX, panelY, panelW, panelH, THEME.colors.acentoAdvertencia);
    scene.inventoryPanel.push(bg);

    const title = scene.add.text(
        width / 2, panelY + 25,
        `📦 Inventario (${inventoryManager.getItemCount()}/${inventoryManager.getCapacity()})`,
        { fontSize: '18px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#F0C040' }
    ).setOrigin(0.5).setDepth(9981);
    scene.inventoryPanel.push(title);

    const items = inventoryManager.items;
    const startY = panelY + 55;

    if (items.length === 0) {
        const empty = scene.add.text(
            width / 2, startY + 40,
            'Tu inventario está vacío.\n¡Negocia con los NPCs para conseguir objetos!',
            { fontSize: '14px', fontFamily: THEME.fonts.main, color: '#A09080', align: 'center', wordWrap: { width: 350 } }
        ).setOrigin(0.5).setDepth(9981);
        scene.inventoryPanel.push(empty);
    } else {
        for (let i = 0; i < Math.min(items.length, 8); i++) {
            const item = items[i];
            const iy = startY + i * 50;

            const rowBg = scene.add.graphics().setDepth(9981);
            rowBg.fillStyle(THEME.colors.madera, 0.4);
            rowBg.fillRoundedRect(panelX + 15, iy, panelW - 30, 42, 6);
            scene.inventoryPanel.push(rowBg);

            const dotColor = item.rarityColor ? parseInt(item.rarityColor.replace('#', '0x')) : 0x9E9E9E;
            const dot = scene.add.graphics().setDepth(9982);
            dot.fillStyle(dotColor, 1);
            dot.fillCircle(panelX + 30, iy + 21, 6);
            scene.inventoryPanel.push(dot);

            const nameText = scene.add.text(panelX + 45, iy + 6, item.name, {
                fontSize: '13px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: '#F5F0E8'
            }).setDepth(9982);
            scene.inventoryPanel.push(nameText);

            const info = scene.add.text(
                panelX + 45, iy + 24,
                `${item.rarity} · ${item.conditionLabel} · $${item.purchasePrice || '?'}`,
                { fontSize: '11px', fontFamily: THEME.fonts.main, color: '#A09080' }
            ).setDepth(9982);
            scene.inventoryPanel.push(info);

            const marketValue = economySystem.calculatePrice(item);
            const valText = scene.add.text(
                panelX + panelW - 45, iy + 14,
                `$${marketValue}`,
                {
                    fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold',
                    color: marketValue > (item.purchasePrice || 0) ? '#4CAF50' : '#C0392B'
                }
            ).setOrigin(1, 0.5).setDepth(9982);
            scene.inventoryPanel.push(valText);
        }
    }

    const closeBtn = scene.add.text(panelX + panelW - 30, panelY + 10, '✕', {
        fontSize: '20px', fontFamily: THEME.fonts.main, color: '#C0392B'
    }).setDepth(9982).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => toggleInventory(scene, inventoryManager, economySystem));
    scene.inventoryPanel.push(closeBtn);

    const stats = inventoryManager.getStats();
    const statsY = panelY + panelH - 50;
    const statsText = scene.add.text(
        width / 2, statsY,
        `Compras: ${stats.totalBuys} | Ventas: ${stats.totalSells} | Ganancia: $${stats.totalProfit}`,
        { fontSize: '11px', fontFamily: THEME.fonts.main, color: '#A09080' }
    ).setOrigin(0.5).setDepth(9982);
    scene.inventoryPanel.push(statsText);
}
