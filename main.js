// ============================================================
// Tianguis Tycoon — Main Game Entry Point
// Motor: Phaser 3 | Estilo: Pixel Art / Caricaturesco
// ============================================================

import { TianguisScene } from './scenes/TianguisScene.js?v=6';
import { NegotiationScene } from './scenes/NegotiationScene.js?v=6';
import { BootScene } from './scenes/BootScene.js?v=6';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#e8d5a3',
  pixelArt: false,
  antialias: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TianguisScene, NegotiationScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

// Expose game globally for debugging
window.tianguisGame = game;
