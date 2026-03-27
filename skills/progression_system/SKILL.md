---
name: Progression System
description: Sistema de progresión tipo tycoon con 5 niveles y mejoras desbloqueables
---

# Progression System — Skill

## Descripción
Sistema tycoon donde el jugador expande su negocio progresivamente desbloqueando mejoras.

## Niveles de Negocio
| Nivel | Nombre | Requisito ($) | Desbloqueos |
|-------|--------|--------------|------------|
| 1 | Puesto improvisado | Inicio | 10 slots, NPCs básicos |
| 2 | Puesto con lona | $1,000 | 20 slots, mejores NPCs |
| 3 | Puesto grande | $5,000 | 35 slots, NPCs con alto presupuesto, objetos raros |
| 4 | Tienda fija | $15,000 | 50 slots, empleados, detector de falsificaciones |
| 5 | Importador internacional | $50,000 | 100 slots, todo desbloqueado, publicidad, decoración |

## Mejoras Disponibles
- **Inventario extra** — Más espacio para objetos
- **Empleados** — Atienden clientes automáticamente
- **Detector de falsificaciones** — Identifica objetos falsos
- **Publicidad** — Atrae más clientes al puesto
- **Decoración** — Mejora la reputación del puesto

## Implementación
```javascript
const LEVELS = [
  { level: 1, name: 'Puesto improvisado', cost: 0, slots: 10, unlocks: [] },
  { level: 2, name: 'Puesto con lona', cost: 1000, slots: 20, unlocks: ['better_npcs'] },
  { level: 3, name: 'Puesto grande', cost: 5000, slots: 35, unlocks: ['high_budget_npcs', 'rare_items'] },
  { level: 4, name: 'Tienda fija', cost: 15000, slots: 50, unlocks: ['employees', 'fake_detector'] },
  { level: 5, name: 'Importador internacional', cost: 50000, slots: 100, unlocks: ['advertising', 'decoration', 'all'] }
];

class ProgressionSystem {
  constructor() {
    this.currentLevel = 1;
    this.totalEarnings = 0;
  }

  canUpgrade(playerMoney) {
    const next = LEVELS[this.currentLevel]; // next level (0-indexed offset)
    if (!next) return false;
    return playerMoney >= next.cost;
  }

  upgrade(player) {
    const next = LEVELS[this.currentLevel];
    if (!next || player.money < next.cost) return { success: false };
    player.money -= next.cost;
    this.currentLevel = next.level;
    return { success: true, newLevel: next, unlocks: next.unlocks };
  }

  getCurrentLevel() {
    return LEVELS[this.currentLevel - 1];
  }
}
```

## Archivos Relacionados
- `game/scenes/TianguisScene.js` (visual del puesto)
- `game/ui/HUD.js` (mostrar nivel)
