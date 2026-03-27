// ============================================================
// Theme.js — Design System Visual (Tianguis Tycoon)
// Palette: Casual Market Cartoon — warm, artisanal, matte
// ============================================================

export const THEME = {
    colors: {
        // === Primary market materials ===
        madera:         0x6B4F35,   // Warm medium brown (stall wood, panels)
        maderaOscura:   0x4A3525,   // Dark warm brown (borders, grain, shadows)
        carton:         0xD4B886,   // Warm beige-tan (price tags, cards)  [UNCHANGED]
        cartonOscuro:   0xB09360,   // Darker cardboard (borders)          [UNCHANGED]
        cremaLona:      0xF1E8D9,   // Warm cream canvas                   [UNCHANGED]
        cuerito:        0xA1887F,   // Leather-tan accent                  [UNCHANGED]
        fondoBase:      0x2C1E12,   // Deep warm brown (dark overlays, night sky)

        // === Fabric / Lona ===
        lonaPrincipal:  0xC0392B,   // Earthy red (market tarps)
        lonaSecundaria: 0x2E86AB,   // Organic teal-blue (market tarps)
        luzCalida:      0xFFD54F,   // Warm gold (lantern glow, highlights)

        // === Semantic interactions ===
        success:        0x4CAF50,   // Green — positive actions      [UNCHANGED]
        acentoPositivo: 0x4CAF50,   // Alias for success
        acentoAdvertencia: 0xF0C040, // Warm amber — warnings, mid-patience
        acentoError:    0xC0392B,   // Earthy red — errors, reject   (was neon #F44336)
        warning:        0xF0C040,   // Alias (was 0xFFC107)
        error:          0xC0392B,   // Alias (was 0xF44336)

        // === Text ===
        textDark:       0x2C1E12,   // Warm near-black for light backgrounds
        textLight:      0xF5F0E8,   // Warm cream for dark backgrounds

        // === Transparent overlays ===
        shadow:         0x000000,
        glass:          0xFFFFFF,

        // === Legacy (kept for backward compat, DO NOT use in new UI) ===
        rojoChile:      0xC0392B,   // Redirected → acentoError
        verdeNopal:     0x2A9D8F,   // Still valid for money/value highlights
        ambarCemp:      0xF0C040,   // Redirected → acentoAdvertencia
        naranjaMango:   0xE76F51,   // Keep for warm accent variety
        rosaMexicano:   0xE91E63,   // ⚠ DEPRECATED — avoid in UI, decorative only
        azulTurquesa:   0x2E86AB,   // Redirected → lonaSecundaria
    },

    fonts: {
        main: 'Outfit',
        pixel: '"Press Start 2P"'
    },

    textStyles: {
        h1:        { fontSize: '24px', fontFamily: 'Outfit', fontStyle: '900', color: '#2C1E12' },
        h2:        { fontSize: '20px', fontFamily: 'Outfit', fontStyle: '800', color: '#2C1E12' },
        body:      { fontSize: '15px', fontFamily: 'Outfit', fontStyle: '500', color: '#3E2A1A' },
        bodyLight: { fontSize: '15px', fontFamily: 'Outfit', fontStyle: '500', color: '#F5F0E8' },
        price:     { fontSize: '22px', fontFamily: 'Outfit', fontStyle: '900', color: '#2A9D8F' },
        priceTag:  { fontSize: '18px', fontFamily: '"Press Start 2P"', color: '#2C1E12' },
        button:    { fontSize: '16px', fontFamily: 'Outfit', fontStyle: '800', color: '#F5F0E8' },
        small:     { fontSize: '12px', fontFamily: 'Outfit', fontStyle: '600', color: '#7A6858' }
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
 * Now uses warm market tones instead of pink
 */
export function drawLonaBackground(gfx, width, height, color1 = THEME.colors.lonaPrincipal, color2 = THEME.colors.cremaLona) {
    // Base color
    gfx.fillStyle(color2, 1);
    gfx.fillRect(0, 0, width, height);

    // Vertical stripes
    const stripeWidth = 60;
    const numStripes = Math.ceil(width / stripeWidth);

    gfx.fillStyle(color1, 0.35);
    for (let i = 0; i < numStripes; i++) {
        if (i % 2 === 0) {
            gfx.fillRect(i * stripeWidth, 0, stripeWidth, height);
        }
    }

    // Warm dark overlay gradient to make it feel like a dim background
    gfx.fillGradientStyle(THEME.colors.fondoBase, THEME.colors.fondoBase, THEME.colors.fondoBase, THEME.colors.fondoBase, 0.7, 0.7, 0.3, 0.3);
    gfx.fillRect(0, 0, width, height);
}

/**
 * Helper to draw a pinned piece of paper/scrap
 */
export function drawPinnedPaper(gfx, x, y, w, h, color = THEME.colors.cremaLona) {
    // Shadow
    gfx.fillStyle(0x000000, 0.2);
    gfx.fillRect(x + 3, y + 3, w, h);

    // Paper body
    gfx.fillStyle(color, 1);
    gfx.fillRect(x, y, w, h);

    // Torn edges/lines
    gfx.lineStyle(1, 0x000000, 0.05);
    for(let i=0; i<w; i+=10) {
        gfx.beginPath();
        gfx.moveTo(x + i, y + h);
        gfx.lineTo(x + i + 2, y + h - 2);
        gfx.strokePath();
    }

    // The "Pin" — warm red
    gfx.fillStyle(THEME.colors.acentoError, 1);
    gfx.fillCircle(x + w/2, y + 5, 4);
    gfx.fillStyle(0xFFFFFF, 0.5);
    gfx.fillCircle(x + w/2 - 1, y + 4, 1.5); // Highlight
}

/**
 * Helper to draw a sign hanging by two strings (wood or cardboard)
 */
export function drawHangingSign(gfx, x, y, w, h, color = THEME.colors.carton, isWood = false) {
    if (isWood) {
        drawWoodPanel(gfx, x, y, w, h);
    } else {
        drawRusticCard(gfx, x, y, w, h, color);
    }

    // Strings
    gfx.lineStyle(2, THEME.colors.maderaOscura, 0.8);
    // Left string
    gfx.beginPath();
    gfx.moveTo(x + w * 0.2, y);
    gfx.lineTo(x + w * 0.2, y - 15);
    gfx.strokePath();
    // Right string
    gfx.beginPath();
    gfx.moveTo(x + w * 0.8, y);
    gfx.lineTo(x + w * 0.8, y - 15);
    gfx.strokePath();
}

/**
 * Helper to draw a warm dark panel for overlays (replaces digital dark blue panels)
 */
export function drawWarmOverlayPanel(gfx, x, y, w, h, borderColor = THEME.colors.cartonOscuro) {
    // Shadow
    gfx.fillStyle(THEME.colors.shadow, 0.3);
    gfx.fillRoundedRect(x + 4, y + 4, w, h, 12);

    // Main body — warm dark brown
    gfx.fillStyle(THEME.colors.fondoBase, 0.95);
    gfx.fillRoundedRect(x, y, w, h, 12);

    // Border — warm tone
    gfx.lineStyle(2, borderColor, 0.8);
    gfx.strokeRoundedRect(x, y, w, h, 12);

    // Subtle horizontal grain lines
    gfx.lineStyle(1, THEME.colors.madera, 0.08);
    for (let ly = y + 20; ly < y + h - 10; ly += 30) {
        gfx.beginPath();
        gfx.moveTo(x + 10, ly);
        gfx.lineTo(x + w - 10, ly);
        gfx.strokePath();
    }
}
