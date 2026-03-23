// ============================================================
// MarketInfoPanel — Market overview UI panel for TianguisScene
// Stateless: receives scene + deps, returns panel elements array
// ============================================================

/**
 * Toggle the market info panel on/off.
 * Manages lifecycle via scene.marketPanel array.
 *
 * @param {Phaser.Scene} scene
 * @param {EconomySystem} economySystem
 * @param {MarketEvents} marketEvents
 */
export function showMarketInfo(scene, economySystem, marketEvents) {
    // Close if already open
    if (scene.marketPanel) {
        scene.marketPanel.forEach(obj => obj.destroy());
        scene.marketPanel = null;
        return;
    }

    const { width } = scene.cameras.main;
    const panelX = 30;
    const panelY = 60;
    const panelW = 300;
    const panelH = 320;

    scene.marketPanel = [];

    const bg = scene.add.graphics().setDepth(9980);
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(2, 0x2196F3, 0.6);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    scene.marketPanel.push(bg);

    const title = scene.add.text(panelX + panelW / 2, panelY + 25, '📊 Estado del Mercado', {
        fontSize: '16px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#2196F3'
    }).setOrigin(0.5).setDepth(9981);
    scene.marketPanel.push(title);

    const overview = economySystem.getMarketOverview();
    let y = panelY + 55;

    for (const [, cat] of Object.entries(overview)) {
        const trendIcon = cat.trend === 'up' ? '📈' : cat.trend === 'down' ? '📉' : '➡️';
        const factorColor = cat.factor > 1.2 ? '#4CAF50' : cat.factor < 0.8 ? '#F44336' : '#FFC107';

        const label = scene.add.text(panelX + 20, y, `${cat.label}`, {
            fontSize: '13px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#ddd'
        }).setDepth(9981);
        scene.marketPanel.push(label);

        const factor = scene.add.text(
            panelX + panelW - 20, y,
            `${trendIcon} x${cat.factor.toFixed(2)}`,
            { fontSize: '13px', fontFamily: 'Outfit', color: factorColor }
        ).setOrigin(1, 0).setDepth(9981);
        scene.marketPanel.push(factor);

        const bar = scene.add.graphics().setDepth(9981);
        bar.fillStyle(0x333333, 1);
        bar.fillRoundedRect(panelX + 20, y + 22, panelW - 40, 8, 4);
        bar.fillStyle(parseInt(factorColor.replace('#', '0x')), 1);
        bar.fillRoundedRect(panelX + 20, y + 22, Math.min((panelW - 40) * (cat.factor / 2), panelW - 40), 8, 4);
        scene.marketPanel.push(bar);

        y += 48;
    }

    const events = marketEvents.getActiveEvents();
    if (events.length > 0) {
        const evTitle = scene.add.text(panelX + panelW / 2, y + 5, '⚡ Eventos Activos', {
            fontSize: '13px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD700'
        }).setOrigin(0.5).setDepth(9981);
        scene.marketPanel.push(evTitle);

        for (const ev of events) {
            y += 22;
            const evText = scene.add.text(panelX + 20, y + 5, `${ev.icon} ${ev.name}`, {
                fontSize: '11px', fontFamily: 'Outfit', color: '#FFC107'
            }).setDepth(9981);
            scene.marketPanel.push(evText);
        }
    }

    const closeBtn = scene.add.text(panelX + panelW - 25, panelY + 10, '✕', {
        fontSize: '18px', fontFamily: 'Outfit', color: '#ff5555'
    }).setDepth(9982).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => showMarketInfo(scene, economySystem, marketEvents));
    scene.marketPanel.push(closeBtn);
}
