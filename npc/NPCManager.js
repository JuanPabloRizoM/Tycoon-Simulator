// ============================================================
// NPCManager — Gestiona NPCs activos en la escena
// VERSIÓN 2: Walking animations, roaming, rich interactions
// ============================================================

import { NPCFactory } from './NPCFactory.js?v=6';
import { STATE_KEYS, getState } from '../core/GameState.js';

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.activeNPCs = [];
        this.maxNPCs = 4;
        this.spawnTimer = null;
        this.spawnInterval = 7000;
    }

    init() {
        // Initialize destination slots (all vacant)
        this.slots = new Array(7).fill(false);

        this.spawnNPC();
        this.scene.time.delayedCall(2000, () => this.spawnNPC());

        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnInterval,
            callback: () => this.trySpawnNPC(),
            loop: true
        });
    }

    trySpawnNPC() {
        if (this.activeNPCs.length < this.maxNPCs) {
            this.spawnNPC();
        }
    }

    spawnNPC() {
        const visualLevel = getState(this.scene.registry, STATE_KEYS.UPG_VISUAL);
        const eventMods = getState(this.scene.registry, STATE_KEYS.EVENT_MODIFIERS);
        const npcData = NPCFactory.generateNPC(null, visualLevel, eventMods?.spawnWeightOverrides);

        // Spawn from edges and walk in
        const { width, height } = this.scene.cameras.main;
        const side = Math.random();
        let startX, startY;
        if (side < 0.25) { startX = -40; startY = 200 + Math.random() * 300; }
        else if (side < 0.5) { startX = width + 40; startY = 200 + Math.random() * 300; }
        else if (side < 0.75) { startX = 100 + Math.random() * (width - 200); startY = 140; }
        else { startX = 100 + Math.random() * (width - 200); startY = height - 60; }

        // Destination Slot Management - adjusted to sit IN FRONT of stall base Y
        const destinations = [
            { x: 160, y: 320 }, { x: 360, y: 300 },
            { x: 600, y: 320 }, { x: 820, y: 310 },
            { x: 240, y: 480 }, { x: 480, y: 500 },
            { x: 720, y: 480 }
        ];

        // Find an empty slot
        let slotIndex = -1;
        const indices = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
        for (const idx of indices) {
            if (!this.slots[idx]) {
                this.slots[idx] = true;
                slotIndex = idx;
                break;
            }
        }

        // If no slot, bail out (too crowded)
        if (slotIndex === -1) return null;

        const dest = destinations[slotIndex];

        // Configure base scale per NPC type (overrides for high-res assets)
        const NPC_SCALE = {
            turista: 0.28,
            cliente_normal: 0.28,
            revendedor: 0.28,
            coleccionista: 0.28,
            estafador: 0.28
        };
        const DEFAULT_NPC_SCALE = 0.28;
        const isHQ = NPC_SCALE[npcData.type] !== undefined;

        const sprite = this.scene.add.sprite(startX, startY, npcData.texture);
        sprite.setInteractive({ useHandCursor: true });

        // SCALE: Lookup from map, fallback to safe default, warn if missing
        if (!isHQ) {
            console.warn(`[NPCManager] Missing scale config for NPC type: "${npcData.type}". Falling back to ${DEFAULT_NPC_SCALE}`);
        }
        const baseScale = isHQ ? NPC_SCALE[npcData.type] : DEFAULT_NPC_SCALE;
        sprite.setScale(baseScale);
        sprite.setOrigin(0.5, 1); // Anchor from the feet
        sprite.setDepth(startY); 
        sprite.setAlpha(0);

        // Hover effects
        sprite.on('pointerover', () => {
            this.scene.tweens.add({
                targets: sprite, scaleX: npcEntry.baseScale * 1.15, scaleY: npcEntry.baseScale * 1.15, duration: 150, ease: 'Back.easeOut'
            });
            this.showNPCLabel(npcData, sprite);
        });
        sprite.on('pointerout', () => {
            this.scene.tweens.add({
                targets: sprite, scaleX: npcEntry.baseScale, scaleY: npcEntry.baseScale, duration: 150, ease: 'Sine.easeOut'
            });
            this.hideNPCLabel();
        });

        // Emotion bubble (speech-bubble style)
        // Adjust Y based on full height from feet
        const characterHeightOffset = 135; 
        const emotionBubble = this.scene.add.sprite(
            sprite.x + 24, sprite.y - characterHeightOffset, `emotion_${npcData.emotionalState}`
        );
        emotionBubble.setScale(0.9);
        emotionBubble.setDepth(startY + 1);
        emotionBubble.setAlpha(0);

        // Interaction indicator - sit above the head
        const interactY = sprite.y - characterHeightOffset - 40;
        const interactIcon = this.scene.add.sprite(sprite.x, interactY, 'interact_icon');
        interactIcon.setScale(0.7);
        interactIcon.setDepth(startY + 2);
        interactIcon.setAlpha(0);

        const npcEntry = {
            data: npcData,
            sprite,
            emotionBubble,
            interactIcon,
            slotIndex,
            timeAlive: 0,
            leaveAfter: 25000 + Math.random() * 20000,
            state: 'entering', // entering, idle, roaming, leaving
            destination: dest,
            roamTimer: 0,
            roamInterval: 3000 + Math.random() * 4000,
            idleAnimTimer: 0,
            idleAnimInterval: 2000 + Math.random() * 3000,
            facingLeft: dest.x < startX,
            baseScale: baseScale
        };

        this.activeNPCs.push(npcEntry);

        // Fade in
        this.scene.tweens.add({
            targets: [sprite],
            alpha: 1, duration: 300
        });

        // Walk to destination
        this.walkTo(npcEntry, dest.x, dest.y, () => {
            npcEntry.state = 'idle';
            // Show interact icon once arrived
            this.scene.tweens.add({
                targets: interactIcon,
                alpha: 1, scaleX: 0.8, scaleY: 0.8,
                duration: 300, ease: 'Back.easeOut'
            });
            // Bounce indicator
            this.scene.tweens.add({
                targets: interactIcon,
                y: interactIcon.y - 10,
                duration: 800, yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });
            // Start idle animation
            this.startIdleAnim(npcEntry);
        });

        return npcEntry;
    }

    walkTo(npcEntry, targetX, targetY, onComplete) {
        const sprite = npcEntry.sprite;
        const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);
        const duration = distance * 4; // Slower = more natural
        const direction = targetX < sprite.x ? -1 : 1;

        // Flip sprite based on direction
        sprite.setFlipX(direction < 0);
        npcEntry.facingLeft = direction < 0;

        // No walk animation for HQ (single image)
        npcEntry.walkAnim = this.scene.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: Math.max(duration, 800),
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                sprite.setDepth(sprite.y);
                // Update child positions
                npcEntry.emotionBubble.x = sprite.x + (npcEntry.facingLeft ? -24 : 24);
                npcEntry.emotionBubble.y = sprite.y - 135;
                npcEntry.interactIcon.x = sprite.x;
                
                // Recompute based on current Y using feet anchor
                npcEntry.interactIcon.y = sprite.y - 175;
            },
            onComplete: () => {
                npcEntry.walkAnim = null;
                if (onComplete) onComplete();
            }
        });
    }

    startIdleAnim(npcEntry) {
        const sprite = npcEntry.sprite;

        // Breathing / sway animation - RELATIVE to baseScale
        this.scene.tweens.add({
            targets: sprite,
            scaleY: { from: npcEntry.baseScale, to: npcEntry.baseScale * 1.02 },
            duration: 1200 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Occasional look around (flip)
        npcEntry.lookTimer = this.scene.time.addEvent({
            delay: 4000 + Math.random() * 5000,
            callback: () => {
                if (npcEntry.state === 'idle') {
                    sprite.setFlipX(!sprite.flipX);
                    // Head bob
                    this.scene.tweens.add({
                        targets: sprite,
                        y: sprite.y - 3,
                        duration: 200,
                        yoyo: true,
                        ease: 'Sine.easeOut'
                    });
                }
            },
            loop: true
        });
    }

    showNPCLabel(npcData, sprite) {
        this.hideNPCLabel();

        const x = sprite.x;
        const y = sprite.y - 80;

        const typeColors = {
            coleccionista: '#8E6BA5', turista: '#FF9800',
            revendedor: '#4CAF50', cliente_normal: '#8D7B6A',
            estafador: '#C0392B'
        };

        const typeEmoji = {
            coleccionista: '🏆', turista: '📸',
            revendedor: '💰', cliente_normal: '👤',
            estafador: '🦊'
        };

        const emoji = typeEmoji[npcData.type] || '👤';

        // Background panel
        const labelBg = this.scene.add.graphics().setDepth(9998);
        const labelW = 120, labelH = 42;
        labelBg.fillStyle(0x2C1E12, 0.85);
        labelBg.fillRoundedRect(x - labelW / 2, y - 5, labelW, labelH, 8);
        // Top color bar
        const barColor = parseInt((typeColors[npcData.type] || '#333').replace('#', '0x'));
        labelBg.fillStyle(barColor, 0.9);
        labelBg.fillRoundedRect(x - labelW / 2, y - 5, labelW, 4, { tl: 8, tr: 8, bl: 0, br: 0 });
        // Triangle pointer
        labelBg.fillStyle(0x2C1E12, 0.85);
        labelBg.fillTriangle(x - 6, y + labelH - 5, x + 6, y + labelH - 5, x, y + labelH + 4);
        this.labelBg = labelBg;

        this.labelText = this.scene.add.text(x, y + 6, `${emoji} ${npcData.name}`, {
            fontSize: '12px', fontFamily: 'Outfit', fontStyle: 'bold',
            color: '#F5F0E8', align: 'center'
        }).setOrigin(0.5, 0).setDepth(9999);

        this.labelSubText = this.scene.add.text(x, y + 22, npcData.type.replace('_', ' '), {
            fontSize: '10px', fontFamily: 'Outfit',
            color: typeColors[npcData.type] || '#A09080', align: 'center'
        }).setOrigin(0.5, 0).setDepth(9999);
    }

    hideNPCLabel() {
        if (this.labelText) { this.labelText.destroy(); this.labelText = null; }
        if (this.labelSubText) { this.labelSubText.destroy(); this.labelSubText = null; }
        if (this.labelBg) { this.labelBg.destroy(); this.labelBg = null; }
    }

    updateEmotionalState(npcEntry, newState) {
        npcEntry.data.emotionalState = newState;
        npcEntry.emotionBubble.setTexture(`emotion_${newState}`);
        npcEntry.emotionBubble.setAlpha(1);

        this.scene.tweens.add({
            targets: npcEntry.emotionBubble,
            scaleX: 1.4, scaleY: 1.4,
            duration: 200, yoyo: true,
            ease: 'Bounce.easeOut'
        });
    }

    removeNPC(npcEntry) {
        if (npcEntry.state === 'leaving') return;
        npcEntry.state = 'leaving';

        // Kill any existing walk tween
        if (npcEntry.walkAnim) npcEntry.walkAnim.stop();
        if (npcEntry.lookTimer) npcEntry.lookTimer.remove();

        // Hide interact icon
        this.scene.tweens.add({
            targets: npcEntry.interactIcon,
            alpha: 0, duration: 200
        });

        // Walk offscreen
        const { width } = this.scene.cameras.main;
        const exitX = npcEntry.sprite.x < width / 2 ? -60 : width + 60;

        this.walkTo(npcEntry, exitX, npcEntry.sprite.y, () => {
            // Fade out and destroy
            this.scene.tweens.add({
                targets: [npcEntry.sprite, npcEntry.emotionBubble, npcEntry.interactIcon],
                alpha: 0, duration: 200,
                onComplete: () => {
                    // Release slot
                    if (npcEntry.slotIndex !== -1) {
                        this.slots[npcEntry.slotIndex] = false;
                    }
                    npcEntry.sprite.destroy();
                    npcEntry.emotionBubble.destroy();
                    npcEntry.interactIcon.destroy();
                    const index = this.activeNPCs.indexOf(npcEntry);
                    if (index > -1) this.activeNPCs.splice(index, 1);
                }
            });
        });
    }

    update(time, delta) {
        for (const npc of [...this.activeNPCs]) {
            npc.timeAlive += delta;

            // NPC leaves after timeout
            if (npc.timeAlive > npc.leaveAfter && npc.state !== 'leaving') {
                this.removeNPC(npc);
                continue;
            }

            // Roaming behavior (idle NPCs occasionally walk to nearby spot)
            if (npc.state === 'idle') {
                npc.roamTimer += delta;
                if (npc.roamTimer > npc.roamInterval) {
                    npc.roamTimer = 0;
                    npc.roamInterval = 3000 + Math.random() * 5000;

                    // Small random walk nearby
                    const roamX = npc.sprite.x + (Math.random() - 0.5) * 80;
                    const roamY = npc.sprite.y + (Math.random() - 0.5) * 40;
                    // Clamp to scene bounds
                    const clampedX = Math.max(60, Math.min(this.scene.cameras.main.width - 60, roamX));
                    const clampedY = Math.max(180, Math.min(this.scene.cameras.main.height - 100, roamY));

                    npc.state = 'roaming';
                    npc.interactIcon.setAlpha(0.4);

                    this.walkTo(npc, clampedX, clampedY, () => {
                        npc.state = 'idle';
                        npc.interactIcon.setAlpha(1);
                    });
                }
            }

            // Update child positions (for non-tweening states)
            if (npc.sprite && npc.state === 'idle') {
                npc.emotionBubble.x = npc.sprite.x + (npc.facingLeft ? -24 : 24);
                npc.emotionBubble.y = npc.sprite.y - 55;
                npc.interactIcon.x = npc.sprite.x;
            }
        }
    }

    getNPCAtPosition(x, y, range = 60) {
        for (const npc of this.activeNPCs) {
            const dist = Phaser.Math.Distance.Between(x, y, npc.sprite.x, npc.sprite.y);
            if (dist < range) return npc;
        }
        return null;
    }

    destroy() {
        if (this.spawnTimer) this.spawnTimer.remove();
        for (const npc of this.activeNPCs) {
            if (npc.lookTimer) npc.lookTimer.remove();
            npc.sprite.destroy();
            npc.emotionBubble.destroy();
            npc.interactIcon.destroy();
        }
        this.activeNPCs = [];
    }
}
