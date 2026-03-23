// ============================================================
// TianguisRenderer — Pure environment rendering
// Draws: sky, clouds, sun, ground, buildings, banner,
//        decorations, ambient effects
// Stateless — receives scene for Phaser factories only.
// ============================================================

/**
 * Draw full tianguis background: sky, clouds, sun, ground, buildings, banner.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {{ clouds: Phaser.GameObjects.Graphics[] }}
 */
export function drawBackground(scene, width, height) {
    // Sky with gradient
    const sky = scene.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB3E5FC, 0xB3E5FC, 1);
    sky.fillRect(0, 0, width, 130);

    // Clouds (subtle, animated)
    const cloudY = [30, 50, 25, 55];
    const cloudX = [100, 350, 600, 850];
    const clouds = [];
    for (let i = 0; i < 4; i++) {
        const cloud = scene.add.graphics();
        cloud.fillStyle(0xFFFFFF, 0.5 + Math.random() * 0.2);
        const cw = 40 + Math.random() * 30;
        cloud.fillEllipse(0, 0, cw, 15);
        cloud.fillEllipse(cw * 0.3, -6, cw * 0.6, 12);
        cloud.fillEllipse(-cw * 0.2, -4, cw * 0.5, 10);
        cloud.setPosition(cloudX[i], cloudY[i]);
        cloud.setDepth(1);
        clouds.push(cloud);

        // Drift clouds
        scene.tweens.add({
            targets: cloud,
            x: cloud.x + 40 + Math.random() * 30,
            duration: 15000 + Math.random() * 10000,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Sun with glow
    const sun = scene.add.graphics();
    sun.fillStyle(0xFFD700, 0.2);
    sun.fillCircle(width - 100, 50, 55);
    sun.fillStyle(0xFFD700, 0.4);
    sun.fillCircle(width - 100, 50, 40);
    sun.fillStyle(0xFFD700, 0.8);
    sun.fillCircle(width - 100, 50, 28);
    sun.fillStyle(0xFFF9C4, 0.9);
    sun.fillCircle(width - 100, 50, 18);
    sun.setDepth(1);

    // Sun rays animation
    scene.tweens.add({
        targets: sun,
        alpha: { from: 0.9, to: 1 },
        scaleX: { from: 1, to: 1.05 },
        scaleY: { from: 1, to: 1.05 },
        duration: 3000, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Ground
    const ground = scene.add.graphics();
    ground.fillGradientStyle(0xd4a76a, 0xd4a76a, 0xc49858, 0xc49858, 1);
    ground.fillRect(0, 130, width, height - 130);

    // Ground texture (dirt spots, pebbles)
    for (let i = 0; i < 50; i++) {
        const rx = Math.random() * width;
        const ry = 150 + Math.random() * (height - 220);
        const shade = Math.random() > 0.5 ? 0xc49858 : 0xb8884a;
        ground.fillStyle(shade, 0.25 + Math.random() * 0.15);
        ground.fillCircle(rx, ry, 2 + Math.random() * 4);
    }

    // Worn path lines
    ground.lineStyle(1, 0xb8884a, 0.15);
    for (let y = 200; y < height - 100; y += 60) {
        ground.beginPath();
        ground.moveTo(0, y);
        for (let x = 0; x < width; x += 20) {
            ground.lineTo(x, y + Math.sin(x * 0.02) * 4);
        }
        ground.strokePath();
    }

    // Background buildings
    const buildings = scene.add.graphics();
    const buildingData = [
        { x: 30, y: 50, w: 90, h: 80, color: 0xBCAAA4 },
        { x: 180, y: 40, w: 70, h: 90, color: 0xD7CCC8 },
        { x: 330, y: 55, w: 110, h: 75, color: 0xBCAAA4 },
        { x: 530, y: 35, w: 80, h: 95, color: 0xCFD8DC },
        { x: 680, y: 45, w: 100, h: 85, color: 0xD7CCC8 },
        { x: 840, y: 55, w: 70, h: 75, color: 0xBCAAA4 }
    ];

    for (const b of buildingData) {
        buildings.fillStyle(b.color, 0.7);
        buildings.fillRect(b.x, b.y, b.w, b.h);
        buildings.fillStyle(0x8D6E63, 0.4);
        buildings.fillRect(b.x - 3, b.y - 2, b.w + 6, 5);
        buildings.fillStyle(0x90CAF9, 0.4);
        const windowW = 10, windowH = 12;
        for (let wx = b.x + 10; wx < b.x + b.w - 15; wx += 22) {
            buildings.fillRect(wx, b.y + 14, windowW, windowH);
            buildings.fillRect(wx, b.y + 36, windowW, windowH);
        }
        buildings.fillStyle(0x795548, 0.5);
        buildings.fillRoundedRect(b.x + b.w / 2 - 8, b.y + b.h - 22, 16, 22, { tl: 4, tr: 4, bl: 0, br: 0 });
    }
    buildings.setDepth(2);

    // Title banner
    const banner = scene.add.graphics();
    banner.fillStyle(0x4E342E, 0.9);
    banner.fillRoundedRect(width / 2 - 150, 135, 300, 34, 8);
    banner.fillStyle(0xFFD700, 1);
    banner.fillRoundedRect(width / 2 - 148, 137, 296, 30, 7);
    banner.fillStyle(0xFF8F00, 1);
    banner.fillCircle(width / 2 - 140, 152, 4);
    banner.fillCircle(width / 2 + 140, 152, 4);
    banner.setDepth(10);

    scene.add.text(width / 2, 152, '🏪 EL TIANGUIS 🏪', {
        fontSize: '17px', fontFamily: 'Outfit', fontStyle: 'bold',
        color: '#4E342E'
    }).setOrigin(0.5).setDepth(11);

    return { clouds };
}

/**
 * Place environment decorations: trees, crates, barrels, banderines.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 */
export function placeDecorations(scene, width, height) {
    // Trees on edges
    if (scene.textures.exists('tree')) {
        const treePositions = [
            { x: 40, y: 200 }, { x: width - 40, y: 210 },
            { x: 50, y: 440 }, { x: width - 50, y: 430 }
        ];
        for (const pos of treePositions) {
            const tree = scene.add.sprite(pos.x, pos.y, 'tree');
            tree.setScale(0.9 + Math.random() * 0.3);
            tree.setDepth(pos.y - 20);
            scene.tweens.add({
                targets: tree,
                angle: { from: -1.5, to: 1.5 },
                duration: 3000 + Math.random() * 2000,
                yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    // Crates and barrels near stalls
    if (scene.textures.exists('crate')) {
        const cratePos = [
            { x: 70, y: 280 }, { x: 270, y: 260 },
            { x: 510, y: 290 }, { x: 870, y: 270 },
            { x: 150, y: 470 }, { x: 550, y: 460 }
        ];
        for (const pos of cratePos) {
            const obj = Math.random() > 0.5 ? 'crate' : 'barrel';
            if (scene.textures.exists(obj)) {
                const spr = scene.add.sprite(pos.x, pos.y, obj);
                spr.setScale(0.8 + Math.random() * 0.3);
                spr.setDepth(pos.y - 5);
            }
        }
    }

    // Light poles / lines between stalls
    const lines = scene.add.graphics();
    lines.lineStyle(1, 0x8D6E63, 0.3);
    lines.beginPath(); lines.moveTo(120, 180); lines.lineTo(780, 180); lines.strokePath();

    // Banderines (papel picado) - Animated
    const banderinColors = [0xFF6D00, 0xE91E63, 0x4CAF50, 0x2196F3, 0xFFEB3B, 0x9C27B0];
    for (let x = 130; x < 770; x += 20) {
        const colorPos = Math.floor(Math.random() * banderinColors.length);
        const color = banderinColors[colorPos];

        const flag = scene.add.graphics();
        flag.fillStyle(color, 0.6);
        flag.fillTriangle(-4, 0, 4, 0, 0, 10);
        flag.setPosition(x + 4, 180);
        flag.setDepth(9);

        scene.tweens.add({
            targets: flag,
            scaleY: { from: 1, to: 0.7 + Math.random() * 0.2 },
            scaleX: { from: 1, to: 0.9 + Math.random() * 0.1 },
            angle: { from: -5, to: 5 },
            duration: 400 + Math.random() * 300,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    lines.setDepth(9);
}

/**
 * Create ambient particle effects (dust, leaves).
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 */
export function createAmbientEffects(scene, width, height) {
    // Dust particles
    for (let i = 0; i < 20; i++) {
        const dust = scene.add.graphics();
        dust.fillStyle(0xd4a76a, 0.15 + Math.random() * 0.1);
        dust.fillCircle(0, 0, 1 + Math.random() * 2);
        dust.setPosition(Math.random() * width, 150 + Math.random() * (height - 200));
        dust.setDepth(9998);

        scene.tweens.add({
            targets: dust,
            x: dust.x + 30 + Math.random() * 40,
            y: dust.y - 10 - Math.random() * 20,
            alpha: 0,
            duration: 4000 + Math.random() * 3000,
            onComplete: () => {
                dust.setPosition(Math.random() * width, 150 + Math.random() * (height - 200));
                dust.setAlpha(0.15 + Math.random() * 0.1);
            },
            repeat: -1
        });
    }

    // Occasional leaf
    scene.time.addEvent({
        delay: 6000,
        callback: () => {
            const leaf = scene.add.graphics();
            leaf.fillStyle(0x4CAF50, 0.3);
            leaf.fillEllipse(0, 0, 6, 3);
            leaf.setPosition(-10, 50 + Math.random() * 80);
            leaf.setDepth(9997);

            scene.tweens.add({
                targets: leaf,
                x: width + 20,
                y: leaf.y + 100 + Math.random() * 150,
                angle: 360,
                duration: 8000 + Math.random() * 4000,
                onComplete: () => leaf.destroy()
            });
        },
        loop: true
    });
}
