// ============================================================
// Theme.js — Design System Visual (Tianguis Tycoon)
// ============================================================

export const THEME = {
    colors: {
        // Bright & energetic Mexican market colors
        rojoChile:      0xE63946,
        verdeNopal:     0x2A9D8F,
        ambarCemp:      0xF4A261,
        naranjaMango:   0xE76F51,
        rosaMexicano:   0xE91E63,
        azulTurquesa:   0x00BCD4,
        
        // Neutral & structural materials
        carton:         0xD4B886,
        cartonOscuro:   0xB09360,
        madera:         0x5D4037,
        maderaOscura:   0x3E2723,
        cremaLona:      0xF1E8D9,
        cuerito:        0xA1887F,
        
        // Semantic interactions
        success:        0x4CAF50,
        warning:        0xFFC107,
        error:          0xF44336,
        textDark:       0x212121,
        textLight:      0xFAFAFA,
        
        // Transparent overlays
        shadow:         0x000000,
        glass:          0xFFFFFF
    },
    
    fonts: {
        main: 'Outfit',
        pixel: '"Press Start 2P"'
    },
    
    textStyles: {
        h1: { fontSize: '24px', fontFamily: 'Outfit', fontStyle: '900', color: '#212121' },
        h2: { fontSize: '20px', fontFamily: 'Outfit', fontStyle: '800', color: '#212121' },
        body: { fontSize: '15px', fontFamily: 'Outfit', fontStyle: '500', color: '#333333' },
        bodyLight: { fontSize: '15px', fontFamily: 'Outfit', fontStyle: '500', color: '#FAFAFA' },
        price: { fontSize: '22px', fontFamily: 'Outfit', fontStyle: '900', color: '#2A9D8F' },
        priceTag: { fontSize: '18px', fontFamily: '"Press Start 2P"', color: '#212121' },
        button: { fontSize: '16px', fontFamily: 'Outfit', fontStyle: '800', color: '#FAFAFA' },
        small: { fontSize: '12px', fontFamily: 'Outfit', fontStyle: '600', color: '#757575' }
    }
};

/**
 * Helper to draw a rustic card (like cardboard with slight imperfections)
 */
export function drawRusticCard(gfx, x, y, w, h, color = THEME.colors.carton, borderColor = THEME.colors.cartonOscuro) {
    // Drop shadow
    gfx.fillStyle(THEME.colors.shadow, 0.15);
    gfx.fillRoundedRect(x + 4, y + 4, w, h, 8);
    
    // Main body
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(x, y, w, h, 8);
    
    // Border
    gfx.lineStyle(2, borderColor, 1);
    gfx.strokeRoundedRect(x, y, w, h, 8);
    
    // Small textural lines (fake cardboard texture)
    gfx.lineStyle(1, borderColor, 0.2);
    for (let i = 0; i < 5; i++) {
        let lx = x + Math.random() * w;
        let ly = y + Math.random() * h;
        let lw = Math.random() * 20 + 10;
        if (lx + lw < x + w) {
            gfx.beginPath();
            gfx.moveTo(lx, ly);
            gfx.lineTo(lx + lw, ly);
            gfx.strokePath();
        }
    }
}

/**
 * Helper to draw a classic bright neon price tag or "oferta" sign
 */
export function drawPriceTag(gfx, x, y, w, h, color = THEME.colors.ambarCemp) {
    // Drop shadow
    gfx.fillStyle(THEME.colors.shadow, 0.2);
    gfx.fillRect(x + 3, y + 3, w, h);
    
    // Main bright body
    gfx.fillStyle(color, 1);
    gfx.fillRect(x, y, w, h);
    
    // Inner dashed line
    gfx.lineStyle(2, THEME.colors.textLight, 0.5);
    gfx.strokeRect(x + 4, y + 4, w - 8, h - 8);
}

/**
 * Helper to draw a wooden board
 */
export function drawWoodPanel(gfx, x, y, w, h) {
    // Shadow
    gfx.fillStyle(THEME.colors.shadow, 0.3);
    gfx.fillRoundedRect(x + 5, y + 5, w, h, 4);
    
    // Wood base
    gfx.fillStyle(THEME.colors.madera, 1);
    gfx.fillRoundedRect(x, y, w, h, 4);
    
    // Wood planks horizontal lines
    gfx.lineStyle(2, THEME.colors.maderaOscura, 0.8);
    const planks = 4;
    const plankH = h / planks;
    for (let i = 1; i < planks; i++) {
        gfx.beginPath();
        gfx.moveTo(x, y + i * plankH);
        gfx.lineTo(x + w, y + i * plankH);
        gfx.strokePath();
    }
    
    // Border
    gfx.lineStyle(3, THEME.colors.maderaOscura, 1);
    gfx.strokeRoundedRect(x, y, w, h, 4);
}

/**
 * Helper to draw a fabric canopy background (lona)
 */
export function drawLonaBackground(gfx, width, height, color1 = THEME.colors.rosaMexicano, color2 = THEME.colors.cremaLona) {
    // Base color
    gfx.fillStyle(color2, 1);
    gfx.fillRect(0, 0, width, height);
    
    // Vertical stripes
    const stripeWidth = 60;
    const numStripes = Math.ceil(width / stripeWidth);
    
    gfx.fillStyle(color1, 1);
    for (let i = 0; i < numStripes; i++) {
        if (i % 2 === 0) {
            gfx.fillRect(i * stripeWidth, 0, stripeWidth, height);
        }
    }
    
    // Add a dark overlay gradient to make it look like a background, not flat UI
    gfx.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.6, 0.6, 0.1, 0.1);
    gfx.fillRect(0, 0, width, height);
}
