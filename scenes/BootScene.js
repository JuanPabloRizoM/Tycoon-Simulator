// ============================================================
// BootScene — Genera assets proceduralmente y prepara el juego
// VERSIÓN 2: Personajes grandes y detallados, puestos realistas,
// spritesheets con frames de animación
// ============================================================

import { initializeGameState } from '../core/GameState.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        const barW = 400, barH = 30;
        const barX = (width - barW) / 2;
        const barY = height / 2 + 40;

        const bg = this.add.graphics();
        bg.fillStyle(0x2C1E12, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(width / 2, height / 2 - 60, '🏪 TIANGUIS TYCOON', {
            fontSize: '36px', fontFamily: 'Outfit', fontStyle: 'bold',
            color: '#F0C040', stroke: '#2C1E12', strokeThickness: 4
        }).setOrigin(0.5);

        const npcTypes = ['turista', 'revendedor', 'coleccionista', 'cliente_normal', 'estafador'];
        const emotions = ['neutral', 'thinking', 'happy', 'annoyed'];
        
        npcTypes.forEach(type => {
            emotions.forEach(emotion => {
                const key = `npc_${type}_${emotion}`;
                this.load.image(key, `assets/characters/${key}.png`);
            });
        });
        
        this.load.image('item_novedad_hq', 'assets/items/item_novedad_hq.png');
        this.load.image('ui_button_hq', 'assets/ui/ui_button_hq.png');
        this.load.image('stall_table_hq', 'assets/ui/stall_table_hq.png');
        this.load.image('ui_item_card_hq', 'assets/ui/ui_item_card_hq.png');

        this.add.text(width / 2, height / 2, 'Cargando...', {
            fontSize: '16px', fontFamily: 'Outfit', color: '#ffffff'
        }).setOrigin(0.5);

        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x333333, 1);
        progressBg.fillRoundedRect(barX, barY, barW, barH, 8);

        const progressBar = this.add.graphics();
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFFD700, 1);
            progressBar.fillRoundedRect(barX + 3, barY + 3, (barW - 6) * value, barH - 6, 6);
        });
    }

    create() {
        this.generateTextures();

        // Initialize all game state from centralized defaults
        initializeGameState(this.registry);

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(600, () => {
            this.scene.start('TianguisScene');
        });
    }

    // ==========================================
    //  HELPER: draw a character onto a graphics
    //  cx,cy = center of the character
    //  opts = { skin, shirt, pants, shoes, hair, hairStyle, hatColor, hatStyle,
    //           accessory, eyeStyle, mouthStyle, armAngle }
    // ==========================================
    drawCharacter(g, cx, cy, opts) {
        const {
            skin = 0xFFCC80, shirt = 0x2196F3, shirtDark = 0x1565C0,
            pants = 0x37474F, pantsDark = 0x263238, shoes = 0x5D4037,
            hair = 0x4E342E, hairStyle = 'short',
            hatColor = null, hatStyle = null,
            accessory = null, eyeStyle = 'normal', mouthStyle = 'smile',
            armAngle = 0, shadow = true
        } = opts;

        // --- Shadow ---
        if (shadow) {
            g.fillStyle(0x000000, 0.15);
            g.fillEllipse(cx, cy + 52, 32, 8);
        }

        // --- Legs (slightly apart, with knee shading) ---
        // Left leg
        g.fillStyle(pants, 1);
        g.fillRoundedRect(cx - 13, cy + 18, 11, 22, 3);
        g.fillStyle(pantsDark, 1);
        g.fillRect(cx - 13, cy + 32, 11, 3); // knee crease
        // Right leg
        g.fillStyle(pants, 1);
        g.fillRoundedRect(cx + 2, cy + 18, 11, 22, 3);
        g.fillStyle(pantsDark, 1);
        g.fillRect(cx + 2, cy + 32, 11, 3);

        // --- Shoes ---
        g.fillStyle(shoes, 1);
        g.fillRoundedRect(cx - 15, cy + 38, 14, 7, { tl: 2, tr: 2, bl: 4, br: 4 });
        g.fillRoundedRect(cx + 1, cy + 38, 14, 7, { tl: 2, tr: 2, bl: 4, br: 4 });
        // Shoe highlights
        g.fillStyle(0xFFFFFF, 0.15);
        g.fillRect(cx - 13, cy + 39, 10, 2);
        g.fillRect(cx + 3, cy + 39, 10, 2);

        // --- Body / Shirt ---
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx - 16, cy - 12, 32, 32, 5);
        // Shirt collar
        g.fillStyle(shirtDark, 1);
        g.beginPath();
        g.moveTo(cx - 5, cy - 12);
        g.lineTo(cx, cy - 6);
        g.lineTo(cx + 5, cy - 12);
        g.closePath();
        g.fillPath();
        // Shirt fold lines
        g.lineStyle(1, shirtDark, 0.4);
        g.beginPath();
        g.moveTo(cx - 3, cy - 2);
        g.lineTo(cx - 1, cy + 12);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + 3, cy);
        g.lineTo(cx + 2, cy + 10);
        g.strokePath();

        // --- Arms ---
        const armLen = 20;
        // Left arm
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx - 22, cy - 8, 8, 18, 3);
        g.fillStyle(skin, 1);
        g.fillCircle(cx - 18, cy + 13, 5); // hand
        // Right arm
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx + 14, cy - 8, 8, 18, 3);
        g.fillStyle(skin, 1);
        g.fillCircle(cx + 18, cy + 13, 5); // hand

        // --- Neck ---
        g.fillStyle(skin, 1);
        g.fillRect(cx - 4, cy - 16, 8, 6);

        // --- Head ---
        g.fillStyle(skin, 1);
        g.fillCircle(cx, cy - 26, 16);
        // Ear left
        g.fillCircle(cx - 15, cy - 25, 4);
        g.fillStyle(0xFFB74D, 0.5);
        g.fillCircle(cx - 15, cy - 25, 2);
        // Ear right
        g.fillStyle(skin, 1);
        g.fillCircle(cx + 15, cy - 25, 4);
        g.fillStyle(0xFFB74D, 0.5);
        g.fillCircle(cx + 15, cy - 25, 2);

        // --- Hair ---
        g.fillStyle(hair, 1);
        if (hairStyle === 'short') {
            g.fillRoundedRect(cx - 16, cy - 42, 32, 14, 8);
            g.fillRect(cx - 15, cy - 35, 4, 6);
        } else if (hairStyle === 'long') {
            g.fillRoundedRect(cx - 17, cy - 43, 34, 18, 10);
            g.fillRect(cx - 17, cy - 30, 5, 14);
            g.fillRect(cx + 12, cy - 30, 5, 14);
        } else if (hairStyle === 'curly') {
            for (let a = 0; a < Math.PI; a += 0.4) {
                g.fillCircle(cx + Math.cos(a) * 14, cy - 36 - Math.sin(a) * 8, 5);
            }
        } else if (hairStyle === 'bald') {
            g.fillStyle(skin, 1);
            g.fillCircle(cx, cy - 38, 6);
        } else if (hairStyle === 'mohawk') {
            g.fillRoundedRect(cx - 4, cy - 48, 8, 16, 3);
        }

        // --- Hat (if any) ---
        if (hatStyle === 'sombrero') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 22, cy - 40, 44, 6, 3); // brim
            g.fillRoundedRect(cx - 12, cy - 50, 24, 12, 4); // crown
            g.fillStyle(0xFFFFFF, 0.2);
            g.fillRect(cx - 10, cy - 42, 20, 2); // band
        } else if (hatStyle === 'gorra') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 16, cy - 42, 32, 8, 4);
            g.fillRect(cx - 20, cy - 38, 16, 4); // visor
            g.fillStyle(0xFFFFFF, 0.15);
            g.fillCircle(cx, cy - 40, 4); // logo dot
        } else if (hatStyle === 'lentes') {
            // sunglasses instead of hat
            g.fillStyle(0x111111, 1);
            g.fillRoundedRect(cx - 12, cy - 30, 10, 7, 3);
            g.fillRoundedRect(cx + 2, cy - 30, 10, 7, 3);
            g.fillRect(cx - 2, cy - 28, 4, 2); // bridge
            g.fillStyle(0x333333, 0.6);
            g.fillRoundedRect(cx - 10, cy - 29, 6, 4, 2);
            g.fillRoundedRect(cx + 4, cy - 29, 6, 4, 2);
        } else if (hatStyle === 'boina') {
            g.fillStyle(hatColor, 1);
            g.fillEllipse(cx - 2, cy - 40, 28, 10);
            g.fillCircle(cx - 2, cy - 43, 4);
        } else if (hatStyle === 'bandana') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 16, cy - 38, 32, 5, 2);
            // knot
            g.fillCircle(cx + 14, cy - 34, 3);
            g.fillCircle(cx + 17, cy - 32, 2);
        }

        // --- Eyes ---
        if (eyeStyle === 'normal') {
            g.fillStyle(0xFFFFFF, 1);
            g.fillEllipse(cx - 6, cy - 28, 7, 6);
            g.fillEllipse(cx + 6, cy - 28, 7, 6);
            g.fillStyle(0x333333, 1);
            g.fillCircle(cx - 5, cy - 27, 2.5);
            g.fillCircle(cx + 7, cy - 27, 2.5);
            // Pupils/shine
            g.fillStyle(0xFFFFFF, 0.8);
            g.fillCircle(cx - 4, cy - 28, 1);
            g.fillCircle(cx + 8, cy - 28, 1);
        } else if (eyeStyle === 'suspicious') {
            g.fillStyle(0xFFFFFF, 1);
            g.fillEllipse(cx - 6, cy - 27, 7, 4);
            g.fillEllipse(cx + 6, cy - 27, 7, 4);
            g.fillStyle(0x333333, 1);
            g.fillCircle(cx - 5, cy - 27, 2);
            g.fillCircle(cx + 7, cy - 27, 2);
        } else if (eyeStyle === 'wide') {
            g.fillStyle(0xFFFFFF, 1);
            g.fillCircle(cx - 6, cy - 28, 5);
            g.fillCircle(cx + 6, cy - 28, 5);
            g.fillStyle(0x333333, 1);
            g.fillCircle(cx - 6, cy - 27, 3);
            g.fillCircle(cx + 6, cy - 27, 3);
            g.fillStyle(0xFFFFFF, 0.8);
            g.fillCircle(cx - 5, cy - 28, 1.2);
            g.fillCircle(cx + 5, cy - 28, 1.2);
        } else if (eyeStyle === 'cool') {
            // half-lidded
            g.fillStyle(0xFFFFFF, 1);
            g.fillEllipse(cx - 6, cy - 27, 7, 4);
            g.fillEllipse(cx + 6, cy - 27, 7, 4);
            g.fillStyle(skin, 1);
            g.fillRect(cx - 10, cy - 31, 20, 3); // eyelids
            g.fillStyle(0x333333, 1);
            g.fillCircle(cx - 5, cy - 26, 2);
            g.fillCircle(cx + 7, cy - 26, 2);
        }

        // --- Eyebrows ---
        g.lineStyle(2, hair, 0.8);
        g.beginPath();
        g.moveTo(cx - 10, cy - 33);
        g.lineTo(cx - 2, cy - 34);
        g.strokePath();
        g.beginPath();
        g.moveTo(cx + 2, cy - 34);
        g.lineTo(cx + 10, cy - 33);
        g.strokePath();

        // --- Nose ---
        g.fillStyle(0xFFB74D, 0.4);
        g.fillCircle(cx, cy - 22, 2.5);

        // --- Mouth ---
        if (mouthStyle === 'smile') {
            g.lineStyle(2, 0xD84315, 0.8);
            g.beginPath();
            g.arc(cx, cy - 18, 5, 0.2, Math.PI - 0.2, false);
            g.strokePath();
        } else if (mouthStyle === 'smirk') {
            g.lineStyle(2, 0xD84315, 0.7);
            g.beginPath();
            g.arc(cx + 3, cy - 18, 4, 0.3, Math.PI - 0.6, false);
            g.strokePath();
        } else if (mouthStyle === 'neutral') {
            g.lineStyle(2, 0xBF360C, 0.5);
            g.beginPath();
            g.moveTo(cx - 4, cy - 17);
            g.lineTo(cx + 4, cy - 17);
            g.strokePath();
        } else if (mouthStyle === 'open') {
            g.fillStyle(0xBF360C, 0.8);
            g.fillEllipse(cx, cy - 17, 6, 4);
            g.fillStyle(0xFFFFFF, 0.6);
            g.fillRect(cx - 2, cy - 19, 4, 2);
        } else if (mouthStyle === 'grin') {
            g.lineStyle(2, 0xD84315, 0.9);
            g.beginPath();
            g.arc(cx, cy - 17, 6, 0.1, Math.PI - 0.1, false);
            g.strokePath();
            g.fillStyle(0xFFFFFF, 0.5);
            g.fillRect(cx - 4, cy - 16, 8, 2);
        }

        // --- Accessory ---
        if (accessory === 'bag') {
            g.fillStyle(0x6D4C41, 1);
            g.fillRoundedRect(cx + 18, cy, 10, 14, 3);
            g.lineStyle(1, 0x4E342E, 0.6);
            g.strokeRoundedRect(cx + 18, cy, 10, 14, 3);
            g.fillStyle(0x8D6E63, 1);
            g.fillRect(cx + 20, cy + 2, 6, 2);
        } else if (accessory === 'camera') {
            g.fillStyle(0x333333, 1);
            g.fillRoundedRect(cx - 26, cy - 4, 12, 10, 3);
            g.fillStyle(0x555555, 1);
            g.fillCircle(cx - 20, cy + 1, 3);
            g.fillStyle(0x90CAF9, 0.6);
            g.fillCircle(cx - 20, cy + 1, 1.5);
        } else if (accessory === 'chain') {
            g.lineStyle(2, 0xFFD700, 0.8);
            g.beginPath();
            g.arc(cx, cy - 10, 8, 0.3, Math.PI - 0.3, false);
            g.strokePath();
            g.fillStyle(0xFFD700, 1);
            g.fillCircle(cx, cy - 2, 3);
        } else if (accessory === 'moustache') {
            g.fillStyle(hair, 1);
            g.beginPath();
            g.arc(cx - 4, cy - 19, 4, Math.PI, 0, false);
            g.arc(cx + 4, cy - 19, 4, Math.PI, 0, false);
            g.fillPath();
        } else if (accessory === 'backpack') {
            g.fillStyle(0x1565C0, 0.8);
            g.fillRoundedRect(cx - 24, cy - 6, 8, 20, 3);
            g.fillStyle(0x0D47A1, 0.6);
            g.fillRect(cx - 23, cy, 6, 3);
        }

        // --- Blush ---
        g.fillStyle(0xFF8A80, 0.15);
        g.fillCircle(cx - 10, cy - 22, 4);
        g.fillCircle(cx + 10, cy - 22, 4);
    }

    // ==========================================
    //  Generate spritesheet: 3 frames side by side
    //  Frame 0: idle (standing)
    //  Frame 1: walk left step
    //  Frame 2: walk right step
    // ==========================================
    generateCharacterSheet(key, opts) {
        const fw = 80, fh = 110; // frame size
        const totalW = fw * 3;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const cx = fw / 2, cy = fh / 2 + 10;

        // Frame 0: idle
        this.drawCharacter(g, cx, cy, { ...opts, armAngle: 0 });

        // Frame 1: walk step left — shift legs
        const g1cx = cx + fw;
        this.drawCharacterWalkFrame(g, g1cx, cy, opts, -1);

        // Frame 2: walk step right
        const g2cx = cx + fw * 2;
        this.drawCharacterWalkFrame(g, g2cx, cy, opts, 1);

        g.generateTexture(key, totalW, fh);
        g.destroy();

        // Create spritesheet config
        const frameConfig = {
            frameWidth: fw,
            frameHeight: fh
        };

        // Add to texture manager as spritesheet
        const tex = this.textures.get(key);
        tex.add(0, 0, 0, 0, fw, fh);
        tex.add(1, 0, fw, 0, fw, fh);
        tex.add(2, 0, fw * 2, 0, fw, fh);

        // Create animations
        this.anims.create({
            key: `${key}_idle`,
            frames: [{ key, frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: `${key}_walk`,
            frames: [
                { key, frame: 1 },
                { key, frame: 0 },
                { key, frame: 2 },
                { key, frame: 0 }
            ],
            frameRate: 6,
            repeat: -1
        });
    }

    drawCharacterWalkFrame(g, cx, cy, opts, direction) {
        const {
            skin = 0xFFCC80, shirt = 0x2196F3, shirtDark = 0x1565C0,
            pants = 0x37474F, pantsDark = 0x263238, shoes = 0x5D4037,
            hair = 0x4E342E, hairStyle = 'short',
            hatColor = null, hatStyle = null,
            accessory = null, eyeStyle = 'normal', mouthStyle = 'smile'
        } = opts;

        const legShift = 5 * direction;

        // Shadow
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(cx, cy + 52, 32, 8);

        // Left leg (shifted)
        g.fillStyle(pants, 1);
        g.fillRoundedRect(cx - 13 - legShift, cy + 18, 11, 22, 3);
        g.fillStyle(pantsDark, 1);
        g.fillRect(cx - 13 - legShift, cy + 34, 11, 2);
        // Right leg (shifted opposite)
        g.fillStyle(pants, 1);
        g.fillRoundedRect(cx + 2 + legShift, cy + 18, 11, 22, 3);
        g.fillStyle(pantsDark, 1);
        g.fillRect(cx + 2 + legShift, cy + 34, 11, 2);

        // Shoes (shifted with legs)
        g.fillStyle(shoes, 1);
        g.fillRoundedRect(cx - 15 - legShift, cy + 38, 14, 7, { tl: 2, tr: 2, bl: 4, br: 4 });
        g.fillRoundedRect(cx + 1 + legShift, cy + 38, 14, 7, { tl: 2, tr: 2, bl: 4, br: 4 });

        // Body
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx - 16, cy - 12, 32, 32, 5);
        g.fillStyle(shirtDark, 1);
        g.beginPath();
        g.moveTo(cx - 5, cy - 12);
        g.lineTo(cx, cy - 6);
        g.lineTo(cx + 5, cy - 12);
        g.closePath();
        g.fillPath();

        // Arms (swinging)
        const armSwing = 6 * direction;
        // Left arm
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx - 22, cy - 8 - armSwing, 8, 18, 3);
        g.fillStyle(skin, 1);
        g.fillCircle(cx - 18, cy + 13 - armSwing, 5);
        // Right arm
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(cx + 14, cy - 8 + armSwing, 8, 18, 3);
        g.fillStyle(skin, 1);
        g.fillCircle(cx + 18, cy + 13 + armSwing, 5);

        // Neck
        g.fillStyle(skin, 1);
        g.fillRect(cx - 4, cy - 16, 8, 6);

        // Head (slight bob)
        const headBob = direction * 1;
        g.fillCircle(cx, cy - 26 - Math.abs(headBob), 16);
        g.fillCircle(cx - 15, cy - 25, 4);
        g.fillCircle(cx + 15, cy - 25, 4);

        // Hair
        g.fillStyle(hair, 1);
        if (hairStyle === 'short') {
            g.fillRoundedRect(cx - 16, cy - 42 - Math.abs(headBob), 32, 14, 8);
        } else if (hairStyle === 'long') {
            g.fillRoundedRect(cx - 17, cy - 43 - Math.abs(headBob), 34, 18, 10);
            g.fillRect(cx - 17, cy - 30, 5, 14);
            g.fillRect(cx + 12, cy - 30, 5, 14);
        } else if (hairStyle === 'curly') {
            for (let a = 0; a < Math.PI; a += 0.4) {
                g.fillCircle(cx + Math.cos(a) * 14, cy - 36 - Math.sin(a) * 8, 5);
            }
        } else if (hairStyle === 'mohawk') {
            g.fillRoundedRect(cx - 4, cy - 48, 8, 16, 3);
        }

        // Hat
        if (hatStyle === 'sombrero') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 22, cy - 40, 44, 6, 3);
            g.fillRoundedRect(cx - 12, cy - 50, 24, 12, 4);
        } else if (hatStyle === 'gorra') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 16, cy - 42, 32, 8, 4);
            g.fillRect(cx - 20, cy - 38, 16, 4);
        } else if (hatStyle === 'lentes') {
            g.fillStyle(0x111111, 1);
            g.fillRoundedRect(cx - 12, cy - 30, 10, 7, 3);
            g.fillRoundedRect(cx + 2, cy - 30, 10, 7, 3);
            g.fillRect(cx - 2, cy - 28, 4, 2);
        } else if (hatStyle === 'boina') {
            g.fillStyle(hatColor, 1);
            g.fillEllipse(cx - 2, cy - 40, 28, 10);
        } else if (hatStyle === 'bandana') {
            g.fillStyle(hatColor, 1);
            g.fillRoundedRect(cx - 16, cy - 38, 32, 5, 2);
            g.fillCircle(cx + 14, cy - 34, 3);
        }

        // Eyes (simpler in walk)
        g.fillStyle(0xFFFFFF, 1);
        g.fillEllipse(cx - 6, cy - 28, 6, 5);
        g.fillEllipse(cx + 6, cy - 28, 6, 5);
        g.fillStyle(0x333333, 1);
        g.fillCircle(cx - 5 + direction, cy - 27, 2);
        g.fillCircle(cx + 7 + direction, cy - 27, 2);

        // Eyebrows
        g.lineStyle(2, hair, 0.7);
        g.beginPath(); g.moveTo(cx - 10, cy - 33); g.lineTo(cx - 2, cy - 34); g.strokePath();
        g.beginPath(); g.moveTo(cx + 2, cy - 34); g.lineTo(cx + 10, cy - 33); g.strokePath();

        // Nose
        g.fillStyle(0xFFB74D, 0.4);
        g.fillCircle(cx, cy - 22, 2.5);

        // Mouth
        g.lineStyle(2, 0xD84315, 0.6);
        g.beginPath();
        g.moveTo(cx - 3, cy - 17);
        g.lineTo(cx + 3, cy - 17);
        g.strokePath();

        // Blush
        g.fillStyle(0xFF8A80, 0.1);
        g.fillCircle(cx - 10, cy - 22, 4);
        g.fillCircle(cx + 10, cy - 22, 4);

        // Accessory in walk
        if (accessory === 'bag') {
            g.fillStyle(0x6D4C41, 1);
            g.fillRoundedRect(cx + 18, cy + armSwing, 10, 14, 3);
        } else if (accessory === 'camera') {
            g.fillStyle(0x333333, 1);
            g.fillRoundedRect(cx - 26, cy - 4 - armSwing, 12, 10, 3);
        } else if (accessory === 'chain') {
            g.lineStyle(2, 0xFFD700, 0.8);
            g.beginPath(); g.arc(cx, cy - 10, 8, 0.3, Math.PI - 0.3, false); g.strokePath();
        } else if (accessory === 'moustache') {
            g.fillStyle(hair, 1);
            g.beginPath();
            g.arc(cx - 4, cy - 19, 4, Math.PI, 0, false);
            g.arc(cx + 4, cy - 19, 4, Math.PI, 0, false);
            g.fillPath();
        } else if (accessory === 'backpack') {
            g.fillStyle(0x1565C0, 0.8);
            g.fillRoundedRect(cx - 24, cy - 6 + armSwing * 0.3, 8, 20, 3);
        }
    }

    generateTextures() {
        // === PLAYER CHARACTER (spritesheet) ===
        this.generateCharacterSheet('player', {
            skin: 0xFFCC80, shirt: 0x2196F3, shirtDark: 0x1565C0,
            pants: 0x1A237E, pantsDark: 0x0D1642, shoes: 0x5D4037,
            hair: 0x4E342E, hairStyle: 'short',
            hatStyle: 'sombrero', hatColor: 0x8B4513,
            eyeStyle: 'normal', mouthStyle: 'smile',
            accessory: 'moustache'
        });

        // === NPC CHARACTER SHEETS ===
        const npcDesigns = {
            coleccionista: {
                skin: 0xFFE0B2, shirt: 0x9C27B0, shirtDark: 0x6A1B9A,
                pants: 0x4A148C, pantsDark: 0x311B92, shoes: 0x3E2723,
                hair: 0x9E9E9E, hairStyle: 'bald',
                hatStyle: 'boina', hatColor: 0x6A1B9A,
                eyeStyle: 'wide', mouthStyle: 'neutral',
                accessory: 'bag'
            },
            turista: {
                skin: 0xFFCCBC, shirt: 0xFF9800, shirtDark: 0xE65100,
                pants: 0x795548, pantsDark: 0x5D4037, shoes: 0xBDBDBD,
                hair: 0xFFEB3B, hairStyle: 'short',
                hatStyle: 'gorra', hatColor: 0xE65100,
                eyeStyle: 'wide', mouthStyle: 'open',
                headBob: 0,
                accessory: 'camera'
            },
            revendedor: {
                skin: 0xD7CCC8, shirt: 0x4CAF50, shirtDark: 0x2E7D32,
                pants: 0x212121, pantsDark: 0x111111, shoes: 0x1B5E20,
                hair: 0x212121, hairStyle: 'short',
                hatStyle: 'gorra', hatColor: 0x1B5E20,
                eyeStyle: 'cool', mouthStyle: 'smirk',
                accessory: 'chain'
            },
            cliente_normal: {
                skin: 0xFFCC80, shirt: 0x607D8B, shirtDark: 0x455A64,
                pants: 0x37474F, pantsDark: 0x263238, shoes: 0x5D4037,
                hair: 0x4E342E, hairStyle: 'short',
                hatStyle: null, hatColor: null,
                eyeStyle: 'normal', mouthStyle: 'smile',
                accessory: null
            },
            estafador: {
                skin: 0xFFCC80, shirt: 0xF44336, shirtDark: 0xC62828,
                pants: 0x212121, pantsDark: 0x111111, shoes: 0x111111,
                hair: 0x212121, hairStyle: 'mohawk',
                hatStyle: 'bandana', hatColor: 0xC62828,
                eyeStyle: 'suspicious', mouthStyle: 'grin',
                accessory: 'chain'
            }
        };

        const hqMigratedTypes = ['turista', 'revendedor', 'coleccionista', 'cliente_normal', 'estafador'];
        for (const [type, design] of Object.entries(npcDesigns)) {
            const key = `npc_${type}`;
            if (hqMigratedTypes.includes(type)) {
                const neutralKey = `${key}_neutral`;
                this.anims.create({
                    key: `${key}_idle`,
                    frames: [{ key: neutralKey }],
                    frameRate: 1,
                    repeat: -1
                });
                this.anims.create({
                    key: `${key}_walk`,
                    frames: [{ key: neutralKey }],
                    frameRate: 1,
                    repeat: -1
                });
            } else {
                this.generateCharacterSheet(key, design);
            }
        }

        // === MARKET STALL (detailed, realistic) ===
        this.generateStallTexture('normal');
        this.generateStallTexture('ropa');
        this.generateStallTexture('electronica');
        this.generateStallTexture('fruta');
        this.generateStallTexture('antiguedades');

        // === PLAYER STALL (special, highlighted) ===
        this.generatePlayerStallTexture();

        // === COIN ===
        const coin = this.make.graphics({ x: 0, y: 0, add: false });
        coin.fillStyle(0xFFD700, 1); coin.fillCircle(12, 12, 12);
        coin.fillStyle(0xFFC107, 1); coin.fillCircle(12, 12, 9);
        coin.fillStyle(0xFFD700, 1); coin.fillCircle(12, 11, 7);
        coin.lineStyle(1, 0xFFB300, 0.5);
        coin.strokeCircle(12, 12, 10);
        // Dollar sign
        coin.fillStyle(0x8B6914, 0.6);
        coin.fillRect(11, 7, 2, 10);
        coin.generateTexture('coin', 24, 24);
        coin.destroy();

        // === INTERACT ICON (pulsating !) ===
        const indicator = this.make.graphics({ x: 0, y: 0, add: false });
        indicator.fillStyle(0xFFFFFF, 1);
        indicator.fillRoundedRect(0, 0, 32, 32, 8);
        indicator.fillStyle(0xFF6D00, 1);
        indicator.fillRoundedRect(2, 2, 28, 28, 7);
        indicator.fillStyle(0xFFFFFF, 1);
        indicator.fillRoundedRect(13, 6, 6, 14, 3);
        indicator.fillCircle(16, 24, 3);
        indicator.generateTexture('interact_icon', 32, 32);
        indicator.destroy();

        // === ITEM RARITY ICONS ===
        const rarityConfig = {
            comun: { color: 0x9E9E9E, glow: 0xBDBDBD },
            raro: { color: 0x2196F3, glow: 0x64B5F6 },
            epico: { color: 0x9C27B0, glow: 0xCE93D8 },
            legendario: { color: 0xFFD700, glow: 0xFFF176 }
        };
        for (const [rarity, cfg] of Object.entries(rarityConfig)) {
            const item = this.make.graphics({ x: 0, y: 0, add: false });
            // Glow
            item.fillStyle(cfg.glow, 0.3);
            item.fillRoundedRect(0, 0, 44, 44, 8);
            // Main
            item.fillStyle(cfg.color, 1);
            item.fillRoundedRect(2, 2, 40, 40, 7);
            // Highlight
            item.fillStyle(0xFFFFFF, 0.25);
            item.fillRoundedRect(4, 4, 36, 16, 5);
            // Star
            item.fillStyle(0xFFFFFF, 0.4);
            item.fillCircle(22, 28, 6);
            item.generateTexture(`item_${rarity}`, 44, 44);
            item.destroy();
        }

        // === EMOTION BUBBLES (more expressive) ===
        const emotions = {
            neutral: { color: 0xE0E0E0, emoji: '😐', bg: 0xFFFFFF },
            interesado: { color: 0x4CAF50, emoji: '😊', bg: 0xE8F5E9 },
            dudoso: { color: 0xFFC107, emoji: '🤔', bg: 0xFFF8E1 },
            molesto: { color: 0xFF9800, emoji: '😤', bg: 0xFFF3E0 },
            enojado: { color: 0xF44336, emoji: '😡', bg: 0xFFEBEE }
        };
        for (const [emotion, cfg] of Object.entries(emotions)) {
            const bubble = this.make.graphics({ x: 0, y: 0, add: false });
            // Speech bubble shape
            bubble.fillStyle(cfg.bg, 0.95);
            bubble.fillRoundedRect(0, 0, 32, 28, 8);
            // Triangle pointer
            bubble.fillTriangle(12, 28, 20, 28, 16, 34);
            // Colored dot
            bubble.fillStyle(cfg.color, 1);
            bubble.fillCircle(16, 12, 9);
            // Inner dot
            bubble.fillStyle(0xFFFFFF, 0.4);
            bubble.fillCircle(14, 10, 3);
            bubble.generateTexture(`emotion_${emotion}`, 32, 36);
            bubble.destroy();
        }

        // === DECORATIVE ELEMENTS ===
        // Tree
        const tree = this.make.graphics({ x: 0, y: 0, add: false });
        tree.fillStyle(0x5D4037, 1);
        tree.fillRect(22, 40, 8, 30);
        tree.fillStyle(0x388E3C, 1);
        tree.fillCircle(26, 30, 20);
        tree.fillCircle(16, 24, 14);
        tree.fillCircle(36, 28, 14);
        tree.fillStyle(0x4CAF50, 0.5);
        tree.fillCircle(22, 22, 10);
        tree.fillCircle(32, 26, 8);
        tree.generateTexture('tree', 52, 70);
        tree.destroy();

        // Crate / box
        const crate = this.make.graphics({ x: 0, y: 0, add: false });
        crate.fillStyle(0x8D6E63, 1);
        crate.fillRect(0, 0, 24, 24);
        crate.lineStyle(2, 0x5D4037, 0.8);
        crate.strokeRect(0, 0, 24, 24);
        crate.beginPath(); crate.moveTo(0, 12); crate.lineTo(24, 12); crate.strokePath();
        crate.beginPath(); crate.moveTo(12, 0); crate.lineTo(12, 24); crate.strokePath();
        crate.generateTexture('crate', 24, 24);
        crate.destroy();

        // Barrel
        const barrel = this.make.graphics({ x: 0, y: 0, add: false });
        barrel.fillStyle(0x795548, 1);
        barrel.fillRoundedRect(2, 4, 20, 28, 4);
        barrel.fillStyle(0x8D6E63, 1);
        barrel.fillRoundedRect(0, 0, 24, 6, 3);
        barrel.fillRoundedRect(0, 26, 24, 6, 3);
        barrel.lineStyle(2, 0x5D4037, 0.6);
        barrel.beginPath(); barrel.moveTo(4, 16); barrel.lineTo(20, 16); barrel.strokePath();
        barrel.generateTexture('barrel', 24, 32);
        barrel.destroy();
    }

    generateStallTexture(theme = 'normal') {
        const w = 140, h = 110;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // === AWNING / TARP (striped, curved) ===
        g.lineStyle(2, 0x8D6E63, 0.6);
        g.beginPath(); g.moveTo(10, 8); g.lineTo(w - 10, 8); g.strokePath();

        const stripeColors = [0xFF6F00, 0xFFB300, 0xFF8F00, 0xFFC107];
        const stripeW = w / stripeColors.length;
        for (let i = 0; i < stripeColors.length; i++) {
            g.fillStyle(stripeColors[i], 0.95);
            const sx = i * stripeW;
            g.beginPath();
            g.moveTo(sx, 4);
            g.lineTo(sx + stripeW, 4);
            g.lineTo(sx + stripeW, 22 + Math.sin((i + 1) * 0.8) * 3);
            g.lineTo(sx, 22 + Math.sin(i * 0.8) * 3);
            g.closePath();
            g.fillPath();
        }
        g.fillStyle(0xE65100, 0.7);
        for (let x = 5; x < w - 5; x += 14) {
            g.fillTriangle(x, 24, x + 7, 30, x + 14, 24);
        }

        // === POLES ===
        g.fillStyle(0x6D4C41, 1);
        g.fillRect(6, 18, 6, 65);
        g.fillRect(w - 12, 18, 6, 65);
        g.lineStyle(2, 0x5D4037, 0.5);
        g.beginPath(); g.moveTo(6, 40); g.lineTo(12, 40); g.strokePath();
        g.beginPath(); g.moveTo(w - 12, 40); g.lineTo(w - 6, 40); g.strokePath();

        // === TABLE ===
        g.fillStyle(0x8B4513, 1);
        g.fillRoundedRect(4, 56, w - 8, 10, 2);
        g.lineStyle(1, 0x6D3410, 0.35);
        for (let y = 58; y < 64; y += 3) {
            g.beginPath(); g.moveTo(8, y); g.lineTo(w - 8, y); g.strokePath();
        }
        g.fillStyle(0xA0522D, 0.4);
        g.fillRect(4, 56, w - 8, 2);
        g.fillStyle(0x6D3410, 1);
        g.fillRect(12, 66, 5, 28);
        g.fillRect(w - 17, 66, 5, 28);
        g.fillRect(12, 80, w - 24, 3);
        
        // Front cloth
        g.fillStyle(0xD84315, 0.15);
        g.fillRect(14, 66, w - 28, 18);

        // === ITEMS ON TABLE (BY THEME) ===
        if (theme === 'ropa') {
            // Folded clothes
            const colors = [0xFFCDD2, 0xBBDEFB, 0xC8E6C9, 0xFFE0B2];
            for (let i = 0; i < 4; i++) {
                g.fillStyle(colors[i], 0.9);
                g.fillRoundedRect(16 + i * 26, 45 + Math.random() * 5, 20, 12, 2);
                g.fillStyle(colors[(i+1)%4], 0.9);
                g.fillRoundedRect(16 + i * 26, 38 + Math.random() * 5, 20, 10, 2);
            }
            // Hanging shirts
            g.fillStyle(0xFFCDD2, 0.8);
            g.fillRoundedRect(20, 25, 20, 25, 3);
            g.fillStyle(0xBBDEFB, 0.8);
            g.fillRoundedRect(100, 25, 20, 25, 3);
            
        } else if (theme === 'electronica') {
            // Dark boxes (TVs/consoles/radios)
            g.fillStyle(0x212121, 0.95);
            g.fillRoundedRect(16, 35, 25, 20, 2);
            g.fillRoundedRect(45, 45, 30, 10, 1);
            g.fillRoundedRect(80, 30, 20, 25, 2);
            g.fillRoundedRect(105, 40, 18, 15, 1);
            
            // Glowing screens
            g.fillStyle(0x00E676, 0.7); // green glow
            g.fillRect(18, 37, 21, 15);
            g.fillStyle(0x29B6F6, 0.7); // blue glow
            g.fillRect(82, 32, 16, 12);
            
        } else if (theme === 'fruta') {
            const colors = [0xE53935, 0xFF9800, 0x43A047, 0xFDD835];
            for (let mound = 0; mound < 4; mound++) {
                const mx = 25 + mound * 30;
                const c = colors[mound % colors.length];
                g.fillStyle(c, 0.9);
                // Draw circles per mound
                for (let j = 0; j < 6; j++) {
                    g.fillCircle(mx + Math.random() * 14 - 7, 48 + Math.random() * 6 - 3, 4 + Math.random() * 2);
                }
            }
            
        } else if (theme === 'antiguedades') {
            // Vases, books, odd shapes
            g.fillStyle(0x5D4037, 1);
            g.fillEllipse(25, 45, 12, 18); // vase
            g.fillStyle(0x8D6E63, 1);
            g.fillRect(45, 48, 20, 5); // book stack
            g.fillStyle(0x4E342E, 1);
            g.fillRect(47, 43, 18, 5);
            g.fillStyle(0x6D4C41, 1);
            g.fillRect(44, 38, 22, 5);
            g.fillStyle(0xFFCC80, 1); 
            g.fillEllipse(85, 47, 24, 16); // terracotta pot
            g.fillStyle(0xFFB74D, 1);
            g.fillRect(78, 35, 14, 10);
            g.fillStyle(0xFFD700, 0.8);
            g.fillTriangle(115, 52, 110, 42, 120, 42); // trinket
            
        } else {
            // Normal fallback (boxes/circles)
            const tableItems = [
                { x: 16, y: 44, w: 18, h: 12, color: 0xE91E63, shape: 'box' },
                { x: 38, y: 46, w: 14, h: 10, color: 0x00BCD4, shape: 'round' },
                { x: 58, y: 43, w: 20, h: 13, color: 0x8BC34A, shape: 'box' },
                { x: 82, y: 45, w: 16, h: 11, color: 0xFF9800, shape: 'round' },
                { x: 102, y: 44, w: 18, h: 12, color: 0x9C27B0, shape: 'box' }
            ];
            for (const ti of tableItems) {
                g.fillStyle(ti.color, 0.9);
                if (ti.shape === 'box') {
                    g.fillRoundedRect(ti.x, ti.y, ti.w, ti.h, 2);
                    g.fillStyle(0xFFFFFF, 0.2);
                    g.fillRect(ti.x + 1, ti.y + 1, ti.w - 2, 3);
                } else {
                    g.fillRoundedRect(ti.x, ti.y, ti.w, ti.h, 5);
                    g.fillStyle(0xFFFFFF, 0.2);
                    g.fillEllipse(ti.x + ti.w / 2 - 2, ti.y + 3, 6, 4);
                }
            }
        }

        const textureKey = theme === 'normal' ? 'stall' : `stall_${theme}`;
        g.generateTexture(textureKey, w, h);
        g.destroy();
    }

    generatePlayerStallTexture() {
        const w = 160, h = 120;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // === PREMIUM AWNING (golden) ===
        const stripeColors = [0xFFD700, 0xFFC107, 0xFFB300, 0xFFD700, 0xFFC107];
        const stripeW = w / stripeColors.length;
        for (let i = 0; i < stripeColors.length; i++) {
            g.fillStyle(stripeColors[i], 0.95);
            const sx = i * stripeW;
            g.beginPath();
            g.moveTo(sx, 4);
            g.lineTo(sx + stripeW, 4);
            g.lineTo(sx + stripeW, 24 + Math.sin((i + 1) * 0.7) * 3);
            g.lineTo(sx, 24 + Math.sin(i * 0.7) * 3);
            g.closePath();
            g.fillPath();
        }
        // Gold scallops
        g.fillStyle(0xFF8F00, 0.8);
        for (let x = 5; x < w - 5; x += 16) {
            g.fillTriangle(x, 26, x + 8, 34, x + 16, 26);
        }

        // Poles
        g.fillStyle(0x8B4513, 1);
        g.fillRect(6, 20, 7, 70);
        g.fillRect(w - 13, 20, 7, 70);
        // Gold rings on poles
        g.fillStyle(0xFFD700, 0.6);
        g.fillRect(6, 40, 7, 3);
        g.fillRect(w - 13, 40, 7, 3);
        g.fillRect(6, 60, 7, 3);
        g.fillRect(w - 13, 60, 7, 3);

        // Base wooden table under everything
        g.fillStyle(0xA0522D, 1);
        g.fillRoundedRect(4, 62, w - 8, 12, 3);

        // Instead of plain brown table, draw the HQ stall texture on top if loaded
        if (this.textures.exists('stall_table_hq')) {
            // we can't directly use g.drawImage, so we just use plain rects and we'll overlay the actual sprite later in TianguisScene
            // Actually, we *can* but it's easier to just spawn the sprite over it. Let's make the procedural table nicer here just in case:
            g.fillStyle(0x00ACC1, 0.85); // Oilcloth typical color (cyan/teal)
            g.fillRoundedRect(4, 60, w - 8, 15, 3);
            g.fillStyle(0xFFFFFF, 0.15);
            for (let xx = 10; xx < w - 10; xx += 20) {
                g.fillCircle(xx, 67, 4); // simple pattern
            }
        }

        // Table legs
        g.fillStyle(0x7A3B10, 1);
        g.fillRect(14, 74, 6, 32);
        g.fillRect(w - 20, 74, 6, 32);
        g.fillRect(14, 88, w - 28, 3);

        // Items (Premium Stacks)
        const items = [
            { x: 16, y: 46, w: 22, h: 16, color: 0xFFD700 },
            { x: 44, y: 48, w: 18, h: 14, color: 0xE91E63 },
            { x: 68, y: 45, w: 24, h: 17, color: 0x2196F3 },
            { x: 98, y: 47, w: 20, h: 15, color: 0x4CAF50 },
            { x: 124, y: 46, w: 22, h: 16, color: 0x9C27B0 }
        ];
        for (const ti of items) {
            g.fillStyle(ti.color, 1);
            g.fillRoundedRect(ti.x, ti.y, ti.w, ti.h, 3);
            g.fillStyle(0xFFFFFF, 0.3); // High glossy reflection
            g.fillRect(ti.x + 2, ti.y + 1, ti.w - 4, 4);
            // Stack effect
            g.fillStyle(ti.color, 0.7);
            g.fillRoundedRect(ti.x + 2, ti.y - 4, ti.w - 4, 6, 2);
        }

        // Hanging Lightbulb (Functional, grounded)
        g.lineStyle(2, 0x000000, 0.8);
        g.beginPath(); g.moveTo(w / 2, 8); g.lineTo(w / 2, 35); g.strokePath(); // wire
        g.fillStyle(0x333333, 1);
        g.fillRect(w / 2 - 4, 35, 8, 6); // fixture
        g.fillStyle(0xFFF9C4, 1); // bright bulb
        g.fillCircle(w / 2, 45, 6);
        g.fillStyle(0xFFF59D, 0.4); // soft local glow
        g.fillCircle(w / 2, 45, 12);

        // Sign
        g.fillStyle(0x4E342E, 0.9);
        g.fillRoundedRect(w / 2 - 30, 28, 60, 16, 4);
        g.fillStyle(0xFFD700, 1);
        g.fillRoundedRect(w / 2 - 28, 30, 56, 12, 3);

        // Golden glow around edges
        g.lineStyle(2, 0xFFD700, 0.3);
        g.strokeRoundedRect(2, 2, w - 4, h - 4, 6);

        g.generateTexture('player_stall', w, h);
        g.destroy();
    }
}
