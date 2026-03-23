// ============================================================
// DaySummaryPanel — Muestra el resumen del día actual
// ============================================================

export function showDaySummary(scene, stats, newEvent, onConfirm) {
    const { width, height } = scene.cameras.main;
    const panelW = 400;
    const panelH = 500;
    const px = width / 2;
    const py = height / 2;

    const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7)
        .setOrigin(0)
        .setInteractive();
    
    // Panel background
    const panel = scene.add.graphics();
    panel.fillStyle(0x0d0d20, 0.95);
    panel.lineStyle(2, 0x5D5DAE, 1);
    panel.fillRoundedRect(px - panelW/2, py - panelH/2, panelW, panelH, 12);
    panel.strokeRoundedRect(px - panelW/2, py - panelH/2, panelW, panelH, 12);

    const elements = [overlay, panel];

    // Title
    const title = scene.add.text(px, py - panelH/2 + 30, `Fin del Día ${stats.day}`, {
        fontSize: '28px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD700',
        stroke: '#4E342E', strokeThickness: 4
    }).setOrigin(0.5);
    elements.push(title);

    // Separator
    const sep = scene.add.graphics();
    sep.lineStyle(2, 0x5D5DAE, 0.5);
    sep.lineBetween(px - panelW/2 + 20, py - panelH/2 + 60, px + panelW/2 - 20, py - panelH/2 + 60);
    elements.push(sep);

    // Stats
    let currentY = py - panelH/2 + 90;
    
    // Profit
    const profitColor = stats.profit >= 0 ? '#4CAF50' : '#F44336';
    const profitSign = stats.profit >= 0 ? '+' : '-';
    const profitText = scene.add.text(px - panelW/2 + 40, currentY, `Ingresos netos:`, {
        fontSize: '18px', fontFamily: 'Outfit', color: '#fff'
    });
    const profitValue = scene.add.text(px + panelW/2 - 40, currentY, `${profitSign}$${Math.abs(stats.profit)}`, {
        fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: profitColor
    }).setOrigin(1, 0);
    elements.push(profitText, profitValue);
    currentY += 40;

    // Sales closed
    const salesText = scene.add.text(px - panelW/2 + 40, currentY, `Ventas cerradas:`, {
        fontSize: '18px', fontFamily: 'Outfit', color: '#fff'
    });
    const salesValue = scene.add.text(px + panelW/2 - 40, currentY, `${stats.sales}`, {
        fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#4CAF50'
    }).setOrigin(1, 0);
    elements.push(salesText, salesValue);
    currentY += 40;

    // Sales lost
    const lostText = scene.add.text(px - panelW/2 + 40, currentY, `Clientela perdida:`, {
        fontSize: '18px', fontFamily: 'Outfit', color: '#fff'
    });
    const lostValue = scene.add.text(px + panelW/2 - 40, currentY, `${stats.lost}`, {
        fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#F44336'
    }).setOrigin(1, 0);
    elements.push(lostText, lostValue);
    currentY += 40;

    // Upgrades
    if (stats.upgradesBought.length > 0) {
        currentY += 10;
        const upgText = scene.add.text(px, currentY, `⭐ Se adquirieron ${stats.upgradesBought.length} mejoras ⭐`, {
            fontSize: '15px', fontFamily: 'Outfit', fontStyle: 'italic', color: '#FFD700'
        }).setOrigin(0.5);
        elements.push(upgText);
        currentY += 30;
    }

    currentY += 10;
    const sep2 = scene.add.graphics();
    sep2.lineStyle(2, 0x5D5DAE, 0.5);
    sep2.lineBetween(px - panelW/2 + 20, currentY, px + panelW/2 - 20, currentY);
    elements.push(sep2);
    currentY += 30;

    // Event Forecast (Next Day)
    const foreText = scene.add.text(px, currentY, 'Mañana en el Mercado...', {
        fontSize: '20px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#FFD700'
    }).setOrigin(0.5);
    elements.push(foreText);
    currentY += 40;

    if (newEvent) {
        const evIcon = scene.add.text(px, currentY, newEvent.icon, { fontSize: '32px' }).setOrigin(0.5);
        currentY += 40;
        const evName = scene.add.text(px, currentY, newEvent.name, {
            fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5);
        currentY += 25;
        const evDesc = scene.add.text(px, currentY, newEvent.description, {
            fontSize: '14px', fontFamily: 'Outfit', color: '#ccc',
            wordWrap: { width: panelW - 60 }, align: 'center'
        }).setOrigin(0.5);
        elements.push(evIcon, evName, evDesc);
    } else {
        const evDesc = scene.add.text(px, currentY + 15, "Será un día normal y tranquilo.", {
            fontSize: '16px', fontFamily: 'Outfit', color: '#aaa', fontStyle: 'italic'
        }).setOrigin(0.5);
        elements.push(evDesc);
    }

    // Button
    const btnW = 160;
    const btnY = py + panelH/2 - 50;
    
    // Make sure we have the texture, fallback to simple styling if not
    const hasTexture = scene.textures.exists('ui_button_hq');
    let btnBg;
    if (hasTexture) {
        btnBg = scene.add.image(px, btnY, 'ui_button_hq').setDepth(15);
        btnBg.setDisplaySize(btnW, 40);
        btnBg.setTint(0x4CAF50);
    } else {
        btnBg = scene.add.rectangle(px, btnY, btnW, 40, 0x4CAF50).setDepth(15);
        btnBg.setStrokeStyle(2, 0x1B5E20);
    }

    const btnText = scene.add.text(px, btnY - 2, 'Comenzar Día', {
        fontSize: '18px', fontFamily: 'Outfit', fontStyle: 'bold', color: '#111',
        stroke: '#fff', strokeThickness: 2
    }).setOrigin(0.5).setDepth(16);

    const btnHit = scene.add.zone(px - btnW/2, btnY - 20, btnW, 40).setOrigin(0)
        .setInteractive({ useHandCursor: true }).setDepth(17);
    
    // Hover effects
    btnHit.on('pointerover', () => {
        if (hasTexture) btnBg.setTint(0x66BB6A);
        else btnBg.setFillStyle(0x66BB6A);
        scene.tweens.add({ targets: btnText, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    btnHit.on('pointerout', () => {
        if (hasTexture) btnBg.setTint(0x4CAF50);
        else btnBg.setFillStyle(0x4CAF50);
        scene.tweens.add({ targets: btnText, scaleX: 1, scaleY: 1, duration: 100 });
    });

    btnHit.on('pointerdown', () => {
        elements.forEach(e => e.destroy());
        btnBg.destroy();
        btnText.destroy();
        btnHit.destroy();
        if (onConfirm) onConfirm();
    });
    
    elements.push(btnBg, btnText, btnHit);
}
