---
name: Reputation System
description: Sistema avanzado de reputación donde los NPCs recuerdan al jugador
---

# Reputation System — Skill

## Descripción
Los NPCs recuerdan interacciones pasadas con el jugador. La reputación afecta precios, disponibilidad de clientes y oportunidades.

## Variables
- `reputation_score` — Puntuación general (0 - 100)
- `trust_level` — Nivel de confianza (low, medium, high, elite)

## Efectos de Reputación

### Alta Reputación (score > 70)
- Mejores precios de compra (NPCs venden más barato)
- Clientes exclusivos con alto presupuesto
- Acceso a objetos raros
- Contraofertas más favorables

### Reputación Media (score 40-70)
- Precios estándar
- Clientes normales
- Comportamiento neutral

### Baja Reputación (score < 40)
- NPCs desconfiados
- Ofertas peores
- Menos clientes visitan el puesto
- NPCs se van más rápido

## Cómo Cambia la Reputación
| Acción | Efecto |
|--------|--------|
| Venta exitosa a precio justo | +2 rep |
| Venta a precio muy alto | +1 rep pero -1 trust |
| Compra a precio justo | +1 rep |
| Rechazar muchas ofertas seguidas | -1 rep |
| Vender objeto falso | -10 rep |
| Completar colección de NPC | +5 rep |
| Ser honesto sobre condición | +3 rep |

## Implementación
```javascript
class ReputationSystem {
  constructor() {
    this.score = 50; // Start neutral
    this.trustLevel = 'medium';
  }

  modifyReputation(amount) {
    this.score = Math.max(0, Math.min(100, this.score + amount));
    this.updateTrustLevel();
  }

  updateTrustLevel() {
    if (this.score >= 85) this.trustLevel = 'elite';
    else if (this.score >= 70) this.trustLevel = 'high';
    else if (this.score >= 40) this.trustLevel = 'medium';
    else this.trustLevel = 'low';
  }

  getPriceModifier() {
    const modifiers = { elite: 0.85, high: 0.92, medium: 1.0, low: 1.15 };
    return modifiers[this.trustLevel];
  }

  getNPCPatience modifier() {
    const modifiers = { elite: 1.3, high: 1.1, medium: 1.0, low: 0.7 };
    return modifiers[this.trustLevel];
  }
}
```

## Archivos Relacionados
- `game/npc/NPCManager.js` (aplicar modificadores)
- `game/ui/HUD.js` (mostrar reputación)
