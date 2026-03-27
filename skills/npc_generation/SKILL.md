---
name: NPC Generation
description: Sistema de generación procedural de NPCs con personalidades únicas
---

# NPC Generation — Skill

## Descripción
Genera NPCs proceduralmente con tipos, atributos psicológicos y estados emocionales únicos.

## Tipos de NPC
| Tipo | Personalidad | Budget |
|------|-------------|--------|
| `coleccionista` | Alto knowledge, alto budget, baja greed | Alto |
| `turista` | Bajo knowledge, baja greed, alta paciencia | Medio |
| `revendedor` | Alto knowledge, alta greed, bajo ego | Variable |
| `cliente_normal` | Valores equilibrados | Medio |
| `estafador` | Alto ego, alto risk, bajo knowledge aparente | Bajo |

## Atributos Psicológicos
Todos los valores son entre 0.0 y 1.0:
- `patience` — Tolerancia a ofertas bajas
- `greed` — Deseo de mejor precio
- `knowledge` — Conocimiento del valor real del objeto
- `ego` — Orgullo/resistencia a ceder
- `risk` — Tolerancia al riesgo en la negociación
- `budget` — Presupuesto disponible (valor numérico)
- `mood` — Estado emocional actual

## Rangos por Tipo
```javascript
const NPC_PROFILES = {
  coleccionista: {
    patience: [0.4, 0.7], greed: [0.2, 0.4],
    knowledge: [0.7, 1.0], ego: [0.5, 0.8],
    risk: [0.2, 0.5], budget: [500, 2000]
  },
  turista: {
    patience: [0.6, 0.9], greed: [0.1, 0.3],
    knowledge: [0.1, 0.4], ego: [0.2, 0.5],
    risk: [0.3, 0.6], budget: [200, 800]
  },
  revendedor: {
    patience: [0.3, 0.6], greed: [0.7, 1.0],
    knowledge: [0.6, 0.9], ego: [0.3, 0.6],
    risk: [0.4, 0.7], budget: [300, 1500]
  },
  cliente_normal: {
    patience: [0.4, 0.7], greed: [0.3, 0.6],
    knowledge: [0.3, 0.6], ego: [0.3, 0.6],
    risk: [0.3, 0.6], budget: [100, 500]
  },
  estafador: {
    patience: [0.2, 0.5], greed: [0.8, 1.0],
    knowledge: [0.5, 0.8], ego: [0.7, 1.0],
    risk: [0.7, 1.0], budget: [50, 300]
  }
};
```

## Implementación
```javascript
class NPCFactory {
  static generateNPC(type = null) {
    if (!type) {
      const types = ['coleccionista', 'turista', 'revendedor', 'cliente_normal', 'estafador'];
      const weights = [0.15, 0.25, 0.20, 0.30, 0.10];
      type = weightedRandom(types, weights);
    }
    const profile = NPC_PROFILES[type];
    return {
      id: generateId(),
      type,
      patience: randomRange(...profile.patience),
      greed: randomRange(...profile.greed),
      knowledge: randomRange(...profile.knowledge),
      ego: randomRange(...profile.ego),
      risk: randomRange(...profile.risk),
      budget: randomRange(...profile.budget),
      mood: 'neutral',
      emotionalState: 'neutral'
    };
  }
}
```

## Archivos Relacionados
- `game/npc/NPCFactory.js`
- `game/npc/NPCManager.js`
