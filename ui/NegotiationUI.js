// ============================================================
// NegotiationUI — UI helpers for the Negotiation Scene
// ALL functions receive explicit context objects — no implicit
// scene.* access. This makes the module safe to use from any
// caller without depending on NegotiationScene's internal shape.
//
// Context shapes expected by each function:
//
//   chatCtx     = { x, y, w, h, bottom, texts, add, tweens }
//   emotionCtx  = { emotionEmoji, emotionLabel, npcSprite,
//                   npcHasEmotions, npcType, textures, tweens }
//   patienceCtx = { indicator, tweens, barBg, barFill, barWidth, warningOverlay }
//   uiCtx       = { uiElements, domInput }
// ============================================================
import { THEME, drawRusticCard, drawWoodPanel, drawPriceTag } from './Theme.js?v=6';

const CHAT_COLORS = {
    player: THEME.colors.textLight,
    npc: THEME.colors.textDark,
    system: THEME.colors.cuerito,
    success: THEME.colors.success,
    error: THEME.colors.error
};

const SPEAKER_COLORS = {
    player: THEME.colors.lonaSecundaria,
    npc: THEME.colors.verdeNopal,
    system: THEME.colors.cartonOscuro,
    success: THEME.colors.success,
    error: THEME.colors.acentoError
};

export const EMOTION_MAP = {
    neutral:    { emoji: '😐', label: 'Neutral',    color: '#BDBDBD', tex: 'neutral'  },
    interesado: { emoji: '😊', label: 'Interesado', color: '#66BB6A', tex: 'happy'    },
    dudoso:     { emoji: '🤔', label: 'Dudoso',     color: '#FFC107', tex: 'thinking' },
    molesto:    { emoji: '😤', label: 'Molesto',    color: '#FF9800', tex: 'annoyed'  },
    enojado:    { emoji: '😡', label: 'Enojado',    color: '#EF5350', tex: 'annoyed'  }
};

// ============================================================
//  Chat
// ============================================================

/**
 * Add a message to the negotiation chat history.
 *
 * @param {object} chatCtx - { x, y, w, h, bottom, texts, add, tweens }
 * @param {string} speaker
 * @param {string} text
 * @param {string} type - 'player'|'npc'|'system'|'success'|'error'
 */
export function addChatMessage(chatCtx, speaker, text, type = 'system') {
    const { x, y, w, h, bottom, texts, add, tweens } = chatCtx;
    const msgHeight = 34;
    const maxVisible = Math.floor(h / msgHeight);

    // Shift existing messages up
    for (const ht of texts) {
        ht.container.y -= msgHeight;
        const relY = ht.container.y - y;
        if (relY < 0) {
            ht.container.setAlpha(Math.max(0, ht.container.alpha - 0.5));
        }
    }

    // Remove overflow
    while (texts.length >= maxVisible) {
        const old = texts.shift();
        old.container.destroy();
    }

    const newY = bottom - msgHeight;
    const container = add.container(x, newY).setDepth(15);

    const speakerText = add.text(0, 5, `${speaker}:`, {
        fontSize: '13px', fontFamily: 'Outfit', fontStyle: 'bold',
        color: SPEAKER_COLORS[type] || '#ccc',
        stroke: '#000', strokeThickness: 1
    });

    const msgText = add.text(speakerText.width + 8, 5, text, {
        fontSize: '13px', fontFamily: 'Outfit',
        color: CHAT_COLORS[type] || '#ddd',
        wordWrap: { width: w - speakerText.width - 14 }
    });

    const lineBg = add.graphics();
    const lineColor = type === 'player' ? THEME.colors.lonaSecundaria : type === 'npc' ? THEME.colors.acentoAdvertencia :
        type === 'success' ? THEME.colors.success : type === 'error' ? THEME.colors.acentoError : THEME.colors.cuerito;
    
    // Bubble background
    lineBg.fillStyle(type === 'npc' ? THEME.colors.cremaLona : THEME.colors.carton, 0.9);
    lineBg.fillRoundedRect(-4, 0, w + 4, msgHeight - 4, 8);
    
    // Left border accent
    lineBg.fillStyle(lineColor, 1);
    lineBg.fillRoundedRect(-4, 0, 6, msgHeight - 4, { tl: 8, bl: 8, tr: 0, br: 0 });

    container.add([lineBg, speakerText, msgText]);

    container.setAlpha(0);
    container.x += 15;
    tweens.add({
        targets: container,
        alpha: 1, x,
        duration: 250, ease: 'Sine.easeOut'
    });

    texts.push({ container });
}

// ============================================================
//  Emotion Display
// ============================================================

/**
 * Update the NPC emotion display (emoji + label + optional sprite texture).
 *
 * @param {object} emotionCtx - { emotionEmoji, emotionLabel, npcSprite,
 *                               npcHasEmotions, npcType, textures, tweens }
 * @param {string} emotion
 */
export function updateEmotionDisplay(emotionCtx, emotion) {
    const { emotionEmoji, emotionLabel, npcSprite, npcHasEmotions, npcType, textures, tweens } = emotionCtx;
    const cfg = EMOTION_MAP[emotion] || EMOTION_MAP.neutral;

    // Texture swap for NPCs with emotion assets
    if (npcSprite && npcHasEmotions) {
        const texKey = `npc_${npcType}_${cfg.tex}`;
        if (textures.exists(texKey)) {
            npcSprite.setTexture(texKey);
        }
    }

    if (emotionEmoji) {
        emotionEmoji.setText(cfg.emoji);
        tweens.add({
            targets: emotionEmoji,
            scaleX: 1.4, scaleY: 1.4, duration: 200, yoyo: true,
            ease: 'Back.easeOut'
        });
    }
    if (emotionLabel) {
        emotionLabel.setText(cfg.label);
        emotionLabel.setColor(cfg.color);
    }
}

// ============================================================
//  Patience Display and Bar
// ============================================================

/**
 * Create a visual patience bar and return its graphics refs.
 *
 * @param {Phaser.Scene} scene - The scene to add the graphics to.
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} w - maximum width
 * @returns {object} { barBg, barFill, barWidth }
 */
export function createPatienceBar(scene, x, y, w) {
    const barBg = scene.add.graphics();
    barBg.fillStyle(THEME.colors.maderaOscura, 1);
    barBg.fillRoundedRect(x, y, w, 14, 7);
    barBg.lineStyle(2, THEME.colors.cuerito, 0.5);
    barBg.strokeRoundedRect(x, y, w, 14, 7);

    const barFill = scene.add.graphics();
    // initially filling nothing, will be updated immediately
    
    return { barBg, barFill, barWidth: w, x, y };
}

/**
 * Update the patience indicator text.
 *
 * @param {object} patienceCtx - { indicator, tweens, barFill, barWidth, x, y }
 * @param {number} patienceRatio - 0..1
 */
export function updatePatienceDisplay(patienceCtx, patienceRatio) {
    const { indicator, barFill, barWidth, x, y } = patienceCtx;
    
    let colorHex = '#F5F0E8';
    let colorVal = THEME.colors.verdeNopal;
    let text = 'Paciencia: 🟢🟢🟢';

    if (patienceRatio > 0.65) {
        text = 'Paciencia: 🟢🟢🟢';
        colorHex = '#2A9D8F';
        colorVal = THEME.colors.verdeNopal;
    } else if (patienceRatio > 0.30) {
        text = 'Paciencia: 🟡🟡⚫';
        colorHex = '#F0C040';
        colorVal = THEME.colors.acentoAdvertencia;
    } else {
        text = 'Paciencia: 🔴⚫⚫';
        colorHex = '#C0392B';
        colorVal = THEME.colors.acentoError;
    }

    if (indicator) {
        indicator.setText(text);
        indicator.setColor(colorHex);
    }

    if (barFill && barWidth && x !== undefined && y !== undefined) {
        // Redraw bar
        barFill.clear();
        barFill.fillStyle(colorVal, 1);
        const fillW = Math.max(0, barWidth * patienceRatio);
        barFill.fillRoundedRect(x + 2, y + 2, fillW - 4, 10, 5);
    }
}

// ============================================================
//  Disable UI
// ============================================================

/**
 * Disable all interactive UI elements (end of negotiation).
 *
 * @param {object} uiCtx - { uiElements, domInput }
 */
export function disableNegotiationUI(uiCtx) {
    const { uiElements, domInput } = uiCtx;
    for (const el of uiElements) {
        if (el.setAlpha) el.setAlpha(0.4);
        if (el.disableInteractive) el.disableInteractive();
    }
    if (domInput) {
        domInput.disabled = true;
        domInput.style.opacity = '0.4';
    }
}

// ============================================================
//  UX Hook Stubs — ready for Phase 5 patience/emotion UX
// ============================================================

/**
 * Flash a red warning on the patience indicator when patience is critically low.
 * Called when patienceRatio < 0.20.
 *
 * @param {object} patienceCtx - { indicator, tweens, warningOverlay }
 */
export function showPatienceWarning(patienceCtx) {
    const { indicator, tweens, warningOverlay } = patienceCtx;
    
    if (indicator && tweens) {
        tweens.add({
            targets: indicator,
            scaleX: 1.3, scaleY: 1.3,
            duration: 120, yoyo: true, repeat: 2,
            ease: 'Sine.easeOut'
        });
    }

    if (warningOverlay && tweens) {
        warningOverlay.setAlpha(0.3);
        tweens.add({
            targets: warningOverlay,
            alpha: 0,
            duration: 600,
            ease: 'Sine.easeOut'
        });
    }
}

/**
 * Play a portrait reaction animation (scale pulse).
 * Types: 'accept' | 'reject' | 'counter' | 'walk_away'
 *
 * @param {object} emotionCtx - { npcSprite, tweens, baseScale }
 * @param {string} reactionType
 */
export function flashPortraitReaction(emotionCtx, reactionType) {
    const { npcSprite, tweens, baseScale } = emotionCtx;
    if (!npcSprite || !tweens) return;

    const pulseMap = {
        accept:    { scale: 1.12, duration: 200, ease: 'Back.easeOut', tint: 0x90EE90 },
        reject:    { scale: 0.93, duration: 150, ease: 'Sine.easeIn', tint: 0xFF9999 },
        counter:   { scale: 1.07, duration: 180, ease: 'Sine.easeOut', tint: 0xFFFF99 },
        walk_away: { scale: 0.90, duration: 300, ease: 'Sine.easeIn', tint: 0xFF4444 }
    };

    const pulse = pulseMap[reactionType] || pulseMap.counter;
    const base = baseScale ?? npcSprite.scaleX;

    if (pulse.tint) {
        npcSprite.setTint(pulse.tint);
        // Clear tint after animation
        tweens.add({
            targets: npcSprite,
            duration: pulse.duration * 2,
            onComplete: () => {
                npcSprite.clearTint();
            }
        });
    }

    tweens.add({
        targets: npcSprite,
        scaleX: base * pulse.scale,
        scaleY: base * pulse.scale,
        duration: pulse.duration,
        yoyo: true,
        ease: pulse.ease
    });
}
