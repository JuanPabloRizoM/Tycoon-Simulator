// ============================================================
// TianguisRenderer — Stall-Frame POV environment rendering
// Creates the "looking from behind your counter" perspective
// with wooden frame borders, market visible through opening,
// hanging lights, and depth fog.
// Stateless — receives scene for Phaser factories only.
// ============================================================

import { THEME } from './Theme.js?v=6';

// Layout constants — define the stall frame geometry
const FRAME_THICKNESS = 50;       // Side pillars width
const FRAME_TOP = 45;             // Top beam height
const COUNTER_HEIGHT = 130;       // Bottom counter occupies this much

/**
 * Draw the full stall-frame POV background.
 * Returns references for clouds animation.
 */
export function drawBackground(scene, width, height) {
    // ── 1. SKY visible through the frame opening ──
    const viewL = FRAME_THICKNESS;
    const viewR = width - FRAME_THICKNESS;
    const viewT = FRAME_TOP;
    const viewB = height - COUNTER_HEIGHT;
    const viewW = viewR - viewL;
    const viewH = viewB - viewT;

    const sky = scene.add.graphics().setDepth(0);
    // Warm sunset gradient for the sky portion
    sky.fillGradientStyle(0xD4875A, 0xD4875A, 0xE8C495, 0xE8C495, 1);
    sky.fillRect(viewL, viewT, viewW, viewH * 0.35);

    // ── 2. GROUND (market floor visible through opening) ──
    const groundY = viewT + viewH * 0.35;
    sky.fillGradientStyle(0xC4A87A, 0xC4A87A, 0xB09570, 0xB09570, 1);
    sky.fillRect(viewL, groundY, viewW, viewH * 0.65);

    // Ground texture (subtle dirt spots)
    for (let i = 0; i < 30; i++) {
        const rx = viewL + Math.random() * viewW;
        const ry = groundY + 10 + Math.random() * (viewH * 0.6);
        const shade = Math.random() > 0.5 ? 0xBE9058 : 0xA87E4A;
        sky.fillStyle(shade, 0.2 + Math.random() * 0.1);
        sky.fillCircle(rx, ry, 1.5 + Math.random() * 3);
    }

    // ── 3. BACKGROUND BUILDINGS (through opening, desaturated) ──
    const buildings = scene.add.graphics().setDepth(1);
    const bData = [
        { x: viewL + 20,  w: 80,  h: 60, color: 0x8A7A6A },
        { x: viewL + 130, w: 60,  h: 70, color: 0x9A8A7A },
        { x: viewL + 240, w: 90,  h: 55, color: 0x8A7A6A },
        { x: viewL + 380, w: 70,  h: 75, color: 0xA09080 },
        { x: viewL + 500, w: 85,  h: 65, color: 0x9A8A7A },
        { x: viewL + 630, w: 65,  h: 55, color: 0x8A7A6A },
        { x: viewL + 730, w: 75,  h: 60, color: 0x9A8A7A }
    ];
    for (const b of bData) {
        const by = viewT + viewH * 0.35 - b.h;
        buildings.fillStyle(b.color, 0.5); // Desaturated/faded
        buildings.fillRect(b.x, by, b.w, b.h);
        // Roof
        buildings.fillStyle(THEME.colors.madera, 0.3);
        buildings.fillRect(b.x - 2, by - 2, b.w + 4, 4);
        // Windows (warm amber glow, subtle)
        buildings.fillStyle(0xFFD9A0, 0.3);
        for (let wx = b.x + 8; wx < b.x + b.w - 12; wx += 18) {
            buildings.fillRect(wx, by + 10, 8, 10);
        }
    }

    // ── 4. MARKET STALLS (midground, through opening) ──
    const lonas = scene.add.graphics().setDepth(2);
    const lonaColors = [0xC0392B, 0xE76F51, 0x2E86AB, 0xF0C040, 0x4CAF50, 0xD4875A];
    // Row of lona/tarp tops visible in the market
    for (let i = 0; i < 6; i++) {
        const lx = viewL + 30 + i * (viewW / 6);
        const ly = groundY - 15 + Math.random() * 10;
        const lw = viewW / 7;
        const color = lonaColors[i % lonaColors.length];
        lonas.fillStyle(color, 0.45);
        // Scalloped tarp shape
        lonas.beginPath();
        lonas.moveTo(lx, ly);
        lonas.lineTo(lx + lw, ly);
        lonas.lineTo(lx + lw + 5, ly + 18);
        lonas.lineTo(lx - 5, ly + 18);
        lonas.closePath();
        lonas.fillPath();
        // Scallop edge
        for (let sx = lx; sx < lx + lw; sx += 12) {
            lonas.fillStyle(color, 0.3);
            lonas.fillTriangle(sx, ly + 18, sx + 6, ly + 24, sx + 12, ly + 18);
        }
    }

    // ── 5. BANDERINES (papel picado) across the market opening ──
    const banderinLine = scene.add.graphics().setDepth(3);
    banderinLine.lineStyle(1, THEME.colors.madera, 0.4);
    const banY = viewT + 20;
    banderinLine.beginPath();
    banderinLine.moveTo(viewL + 10, banY);
    // Slightly curved string
    for (let bx = viewL + 10; bx <= viewR - 10; bx += 5) {
        const sag = Math.sin((bx - viewL) / viewW * Math.PI) * 8;
        banderinLine.lineTo(bx, banY + sag);
    }
    banderinLine.strokePath();

    const banderinColors = [0xFF6D00, 0xC0392B, 0x4CAF50, 0xF0C040, 0xFFEB3B, 0xE76F51];
    const flags = [];
    for (let bx = viewL + 20; bx < viewR - 20; bx += 16) {
        const ci = Math.floor(Math.random() * banderinColors.length);
        const flag = scene.add.graphics().setDepth(3);
        const sag = Math.sin((bx - viewL) / viewW * Math.PI) * 8;
        flag.fillStyle(banderinColors[ci], 0.55);
        flag.fillTriangle(-3, 0, 3, 0, 0, 8);
        flag.setPosition(bx, banY + sag);
        scene.tweens.add({
            targets: flag,
            scaleY: { from: 1, to: 0.75 + Math.random() * 0.15 },
            angle: { from: -4, to: 4 },
            duration: 500 + Math.random() * 400,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
        flags.push(flag);
    }

    // ── 6. DEPTH FOG (pushes background back) ──
    const fog = scene.add.graphics().setDepth(4);
    fog.fillGradientStyle(
        THEME.colors.fondoBase, THEME.colors.fondoBase,
        THEME.colors.fondoBase, THEME.colors.fondoBase,
        0.0, 0.0, 0.25, 0.25
    );
    fog.fillRect(viewL, viewT, viewW, viewH);

    // ── 7. CLOUDS (subtle, warm-tinted, inside the opening) ──
    const clouds = [];
    const cloudPositions = [
        { x: viewL + 80, y: viewT + 15 },
        { x: viewL + viewW * 0.4, y: viewT + 10 },
        { x: viewL + viewW * 0.7, y: viewT + 20 },
    ];
    for (const cp of cloudPositions) {
        const cloud = scene.add.graphics().setDepth(1);
        cloud.fillStyle(0xFFF5E6, 0.35);
        const cw = 30 + Math.random() * 25;
        cloud.fillEllipse(0, 0, cw, 10);
        cloud.fillEllipse(cw * 0.25, -4, cw * 0.5, 8);
        cloud.setPosition(cp.x, cp.y);
        clouds.push(cloud);
        scene.tweens.add({
            targets: cloud,
            x: cloud.x + 30 + Math.random() * 20,
            duration: 18000 + Math.random() * 8000,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ── 8. SUN (warm glow, top area of opening) ──
    const sun = scene.add.graphics().setDepth(1);
    const sunX = viewR - 80;
    const sunY = viewT + 30;
    sun.fillStyle(0xFFD700, 0.15);
    sun.fillCircle(sunX, sunY, 40);
    sun.fillStyle(0xFFD700, 0.3);
    sun.fillCircle(sunX, sunY, 28);
    sun.fillStyle(0xFFF9C4, 0.6);
    sun.fillCircle(sunX, sunY, 16);
    scene.tweens.add({
        targets: sun,
        alpha: { from: 0.85, to: 1 },
        scaleX: { from: 1, to: 1.04 },
        scaleY: { from: 1, to: 1.04 },
        duration: 3500, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    return { clouds, viewL, viewR, viewT, viewB };
}

/**
 * Draw the wooden stall frame (pillars + top beam + shelf).
 * This is the highest-depth static element framing the entire scene.
 */
export function drawStallFrame(scene, width, height) {
    const frame = scene.add.graphics().setDepth(9500);

    const viewL = FRAME_THICKNESS;
    const viewR = width - FRAME_THICKNESS;
    const viewB = height - COUNTER_HEIGHT;

    // ── LEFT PILLAR ──
    frame.fillStyle(THEME.colors.madera, 1);
    frame.fillRect(0, 0, FRAME_THICKNESS, height);
    // Wood grain lines
    frame.lineStyle(1, THEME.colors.maderaOscura, 0.3);
    for (let ly = 10; ly < height; ly += 25) {
        frame.beginPath();
        frame.moveTo(5, ly);
        frame.lineTo(FRAME_THICKNESS - 5, ly + 3);
        frame.strokePath();
    }
    // Left pillar edge highlight
    frame.fillStyle(0xFFFFFF, 0.06);
    frame.fillRect(FRAME_THICKNESS - 3, 0, 3, height);

    // ── RIGHT PILLAR ──
    frame.fillStyle(THEME.colors.madera, 1);
    frame.fillRect(viewR, 0, FRAME_THICKNESS, height);
    frame.lineStyle(1, THEME.colors.maderaOscura, 0.3);
    for (let ly = 15; ly < height; ly += 25) {
        frame.beginPath();
        frame.moveTo(viewR + 5, ly);
        frame.lineTo(width - 5, ly + 2);
        frame.strokePath();
    }
    frame.fillStyle(0x000000, 0.08);
    frame.fillRect(viewR, 0, 3, height);

    // ── TOP BEAM ──
    frame.fillStyle(THEME.colors.maderaOscura, 1);
    frame.fillRect(0, 0, width, FRAME_TOP);
    // Plank lines
    frame.lineStyle(1, THEME.colors.madera, 0.2);
    for (let lx = 20; lx < width; lx += 40) {
        frame.beginPath();
        frame.moveTo(lx, 5);
        frame.lineTo(lx + 2, FRAME_TOP - 3);
        frame.strokePath();
    }
    // Bottom edge
    frame.fillStyle(THEME.colors.madera, 1);
    frame.fillRoundedRect(0, FRAME_TOP - 5, width, 8, 2);

    // ── SHELF / BRACKET on left pillar (decorative) ──
    frame.fillStyle(THEME.colors.maderaOscura, 0.8);
    frame.fillRect(0, viewB - 30, FRAME_THICKNESS + 15, 6);
    // Right pillar bracket
    frame.fillRect(viewR - 15, viewB - 30, FRAME_THICKNESS + 15, 6);

    // ── HANGING LIGHT BULBS along top beam ──
    const bulbs = scene.add.graphics().setDepth(9501);
    const bulbCount = 5;
    const bulbSpacing = (viewR - viewL) / (bulbCount + 1);
    for (let i = 1; i <= bulbCount; i++) {
        const bx = viewL + i * bulbSpacing;
        const by = FRAME_TOP + 2;
        const stringLen = 12 + Math.sin(i * 1.5) * 4;
        // String
        bulbs.lineStyle(1, THEME.colors.maderaOscura, 0.6);
        bulbs.beginPath();
        bulbs.moveTo(bx, FRAME_TOP - 2);
        bulbs.lineTo(bx, by + stringLen);
        bulbs.strokePath();
        // Bulb glow
        bulbs.fillStyle(0xFFD54F, 0.12);
        bulbs.fillCircle(bx, by + stringLen + 4, 14);
        // Bulb body
        bulbs.fillStyle(0xFFD54F, 0.7);
        bulbs.fillCircle(bx, by + stringLen + 4, 5);
        bulbs.fillStyle(0xFFF9C4, 0.9);
        bulbs.fillCircle(bx, by + stringLen + 3, 2.5);
    }

    // Subtle warm glow at bottom of frame opening
    const glow = scene.add.graphics().setDepth(9499);
    glow.fillGradientStyle(0xFFD54F, 0xFFD54F, 0xFFD54F, 0xFFD54F, 0.06, 0.06, 0.0, 0.0);
    glow.fillRect(viewL, FRAME_TOP, viewR - viewL, 50);
}

/**
 * Draw the player's counter across the bottom of the screen.
 * This is the foreground anchor — highest visual weight.
 */
export function drawPlayerCounter(scene, width, height, level) {
    const counterY = height - COUNTER_HEIGHT;
    const g = scene.add.graphics().setDepth(9600);

    // ── COUNTER TOP SURFACE ──
    // Front face (darker, facing player)
    g.fillStyle(THEME.colors.maderaOscura, 1);
    g.fillRect(0, counterY, width, COUNTER_HEIGHT);

    // Top surface (lighter, horizontal wooden planks)
    g.fillStyle(THEME.colors.madera, 1);
    g.fillRect(0, counterY, width, 18);
    // Top edge highlight
    g.fillStyle(0xFFFFFF, 0.08);
    g.fillRect(FRAME_THICKNESS, counterY, width - FRAME_THICKNESS * 2, 3);

    // ── WOOD GRAIN on front face ──
    g.lineStyle(1, THEME.colors.madera, 0.15);
    for (let ly = counterY + 25; ly < height; ly += 20) {
        g.beginPath();
        g.moveTo(FRAME_THICKNESS + 10, ly);
        g.lineTo(width - FRAME_THICKNESS - 10, ly + 2);
        g.strokePath();
    }

    // ── VERTICAL PLANK SEPARATORS ──
    g.lineStyle(2, 0x000000, 0.1);
    const plankW = (width - FRAME_THICKNESS * 2) / 5;
    for (let i = 1; i < 5; i++) {
        const px = FRAME_THICKNESS + i * plankW;
        g.beginPath();
        g.moveTo(px, counterY + 18);
        g.lineTo(px, height);
        g.strokePath();
    }

    // ── ITEM SHADOWS on counter surface ──
    g.fillStyle(0x000000, 0.08);
    g.fillEllipse(width * 0.25, counterY + 50, 70, 18);
    g.fillEllipse(width * 0.5,  counterY + 45, 80, 20);
    g.fillEllipse(width * 0.75, counterY + 55, 65, 16);

    // ── STALL LABEL (level-dependent, carved into counter) ──
    const stallLabels = [
        'MI PUESTO', 'MI NEGOCITO', 'MI TEMPLO',
        'NEGOCIO PRÓSPERO', 'EL REY DEL TIANGUIS'
    ];
    scene.add.text(width / 2, counterY + COUNTER_HEIGHT - 20, stallLabels[level - 1], {
        fontSize: '10px', fontFamily: THEME.fonts.main, fontStyle: 'bold',
        color: '#A0896E'
    }).setOrigin(0.5).setDepth(9601).setAlpha(0.6);
}

/**
 * Create ambient particle effects (dust, leaves) — constrained to frame opening.
 */
export function createAmbientEffects(scene, width, height) {
    const viewL = FRAME_THICKNESS;
    const viewR = width - FRAME_THICKNESS;
    const viewT = FRAME_TOP;
    const viewB = height - COUNTER_HEIGHT;

    // Dust motes inside the frame opening
    for (let i = 0; i < 15; i++) {
        const dust = scene.add.graphics().setDepth(5);
        dust.fillStyle(0xD4A86A, 0.12 + Math.random() * 0.08);
        dust.fillCircle(0, 0, 1 + Math.random() * 1.5);
        dust.setPosition(
            viewL + Math.random() * (viewR - viewL),
            viewT + Math.random() * (viewB - viewT)
        );
        scene.tweens.add({
            targets: dust,
            x: dust.x + 20 + Math.random() * 30,
            y: dust.y - 8 - Math.random() * 15,
            alpha: 0,
            duration: 5000 + Math.random() * 3000,
            onComplete: () => {
                dust.setPosition(
                    viewL + Math.random() * (viewR - viewL),
                    viewT + Math.random() * (viewB - viewT)
                );
                dust.setAlpha(0.12 + Math.random() * 0.08);
            },
            repeat: -1
        });
    }
}

// Export layout constants for other modules
export { FRAME_THICKNESS, FRAME_TOP, COUNTER_HEIGHT };
