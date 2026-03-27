// ============================================================
// NpcPortraitSection — NPC portrait layout, portrait scale,
// breathing animation and expression/reaction updates.
//
// Extracted from NegotiationScene.drawNPCSection() (~125 lines).
// No business logic. All rendering. Stateless draw function that
// returns refs for the caller to persist.
//
// Public API:
//   drawNpcPortrait(scene, x, y, w, h, npcData) → portraitRefs
//   updateNpcExpression(portraitRefs, emotion, scene)
//   setNpcTrait(portraitRefs, traitText)
// ============================================================

import { EMOTION_MAP } from './NegotiationUI.js?v=6';
import { THEME, drawRusticCard } from './Theme.js?v=6';

// ============================================================
//  Portrait scale config (centralised, was scattered in scene)
// ============================================================
const PORTRAIT_SCALE = {
    turista:       0.22,
    cliente_normal: 0.22,
    revendedor:    0.22,
    coleccionista: 0.22,
    estafador:     0.22
};
const BREATHE_SCALE_DELTA = 0.01; // breathing reduces scale by this amount

// NPC type badge config (visual only, no logic)
const TYPE_BADGE = {
    coleccionista: { color: 0x8E6BA5, label: 'COLECCIONISTA', emoji: '🏆' },
    turista:       { color: 0xFF9800, label: 'TURISTA',       emoji: '📸' },
    revendedor:    { color: 0x4CAF50, label: 'REVENDEDOR',    emoji: '💰' },
    cliente_normal:{ color: 0x8D7B6A, label: 'CLIENTE',       emoji: '👤' },
    estafador:     { color: 0x795548, label: 'VISITANTE',     emoji: '🧑' }
};

/**
 * Draw the full NPC portrait column and return all visual refs.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x  - panel left edge
 * @param {number} y  - panel top edge
 * @param {number} w  - panel width
 * @param {number} h  - panel height
 * @param {object} npcData - { type, name, description, texture, emotionalState }
 * @returns {object} portraitRefs = {
 *   sprite, baseScale, npcHasEmotions, npcType,
 *   emotionEmoji, emotionLabel, patienceIndicator, npcTraitText
 * }
 */
export function drawNpcPortrait(scene, x, y, w, h, npcData) {
    // --- Panel background ---
    const panel = scene.add.graphics();
    drawRusticCard(panel, x, y, w, h, THEME.colors.cremaLona);

    // --- Type badge ---
    const cfg = TYPE_BADGE[npcData.type] || TYPE_BADGE.cliente_normal;
    panel.fillStyle(cfg.color, 0.2);
    panel.fillRoundedRect(x + 8, y + 8, w - 16, 30, 6);
    panel.fillStyle(cfg.color, 0.85);
    panel.fillRoundedRect(x + 10, y + 10, w - 20, 26, 5);
    scene.add.text(x + w / 2, y + 23, `${cfg.emoji} ${cfg.label}`, {
        fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textLight
    }).setOrigin(0.5).setDepth(10);

    // --- Portrait scale ---
    const DEFAULT_SCALE = 0.22;
    const baseScale = PORTRAIT_SCALE[npcData.type] ?? DEFAULT_SCALE;
    const breatheScale = baseScale - BREATHE_SCALE_DELTA;
    const npcHasEmotions = PORTRAIT_SCALE[npcData.type] !== undefined;

    if (!npcHasEmotions) {
        console.warn(`[NpcPortraitSection] Missing scale config for NPC type: "${npcData.type}". Using default.`);
    }

    // --- NPC sprite ---
    const sprite = scene.add.sprite(x + w / 2 - 20, y + 265, npcData.texture);
    sprite.setOrigin(0.5, 1);
    sprite.setScale(baseScale);
    sprite.setDepth(5);

    // Breathing tween
    scene.tweens.add({
        targets: sprite,
        scaleY: { from: baseScale, to: breatheScale },
        duration: 1400, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // --- Name & description (right of sprite) ---
    scene.add.text(x + w / 2 + 30, y + 80, npcData.name, {
        fontSize: '16px', fontFamily: THEME.fonts.main, fontStyle: 'bold',
        color: THEME.colors.textDark, stroke: THEME.colors.cremaLona, strokeThickness: 3
    }).setOrigin(0.5);

    scene.add.text(x + w / 2 + 30, y + 105, `"${npcData.description}"`, {
        fontSize: '11px', fontFamily: THEME.fonts.main, fontStyle: 'italic', color: THEME.colors.textDark,
        wordWrap: { width: w / 2 - 10 }, align: 'center'
    }).setOrigin(0.5, 0);

    // --- Emotion container (emoji + label + patience) ---
    const headTopOffset = 85;
    const interactY = -sprite.displayHeight - headTopOffset;
    const emotionContainer = scene.add.container(x + w / 2, y + 265 + interactY);

    const emotionEmoji = scene.add.text(0, -6, '😐', { fontSize: '32px' }).setOrigin(0.5);
    const emotionLabel = scene.add.text(0, 20, 'Neutral', {
        fontSize: '14px', fontFamily: THEME.fonts.main, fontStyle: 'bold', color: THEME.colors.textDark,
        stroke: THEME.colors.cremaLona, strokeThickness: 3
    }).setOrigin(0.5);

    emotionContainer.add([emotionEmoji, emotionLabel]);
    emotionContainer.setDepth(10);

    // Pulse animation on emoji
    scene.tweens.add({
        targets: emotionEmoji,
        scaleX: { from: 1, to: 1.15 },
        scaleY: { from: 1, to: 1.15 },
        duration: 1200, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // --- NPC trait text (bottom of panel) ---
    const npcTraitText = scene.add.text(x + w / 2, y + h - 22, '', {
        fontSize: '11px', fontFamily: THEME.fonts.main, color: THEME.colors.textDark, fontStyle: 'bold',
        wordWrap: { width: w - 20 }, align: 'center'
    }).setOrigin(0.5).setDepth(10);

    return {
        sprite,
        baseScale,
        npcHasEmotions,
        npcType: npcData.type,
        emotionEmoji,
        emotionLabel,
        patienceIndicator: null, // Removed for cleaner UI
        npcTraitText
    };
}

/**
 * Update the NPC sprite expression (frame swap + scale pulse).
 * Replaces NegotiationScene.updateCharacterExpression().
 * No-op if the sprite has no emotion frames.
 *
 * @param {object} portraitRefs - returned from drawNpcPortrait()
 * @param {string} emotion - key from EMOTION_MAP
 * @param {Phaser.Scene} scene
 */
export function updateNpcExpression(portraitRefs, emotion, scene) {
    const { sprite, baseScale } = portraitRefs;
    if (!sprite) return;

    const frameMap = {
        neutral: 0,
        interesado: 1, feliz: 1,
        dudoso: 2,
        molesto: 3, enojado: 3
    };
    const targetFrame = frameMap[emotion] ?? 0;

    scene.tweens.add({
        targets: sprite,
        scaleX: baseScale * 1.08,
        scaleY: baseScale * 1.08,
        duration: 120,
        yoyo: true,
        onYoyo: () => {
            // Only set frame if sprite sheet has multiple frames
            if (sprite.texture.frameTotal > 1) {
                sprite.setFrame(targetFrame);
            }
        }
    });
}

/**
 * Set the NPC trait hint text at the bottom of the portrait panel.
 *
 * @param {object} portraitRefs
 * @param {string} traitText
 */
export function setNpcTrait(portraitRefs, traitText) {
    if (portraitRefs.npcTraitText) {
        portraitRefs.npcTraitText.setText(`💡 ${traitText}`);
    }
}
