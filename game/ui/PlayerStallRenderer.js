// ============================================================
// PlayerStallRenderer — Now delegated to TianguisRenderer
// This module is kept for backward compatibility but delegates
// to drawPlayerCounter in TianguisRenderer.
// ============================================================

import { drawPlayerCounter } from './TianguisRenderer.js?v=6';

/**
 * Draw the player's stall (counter foreground).
 * Delegates to the unified TianguisRenderer.
 */
export function drawPlayerStall(scene, width, height, level) {
    drawPlayerCounter(scene, width, height, level);
}
