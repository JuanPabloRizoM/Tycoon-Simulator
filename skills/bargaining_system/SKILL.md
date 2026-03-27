---
name: Bargaining System
description: Sistema completo de regateo/negociación entre jugador y NPCs
---

# Bargaining System — Skill

## Descripción
Sistema central del juego que maneja toda la lógica de negociación entre el jugador y los NPCs del tianguis.

## Fórmulas Principales

### Valor Percibido por el NPC
```javascript
perceived_value = item_value * npc.knowledge
```

### Precio Mínimo del NPC
```javascript
minimum_price = perceived_value * (1 + npc.greed - npc.patience)
// Alternativa del documento PDF:
// precio_minimo = valor_real * (1 - paciencia + avaricia)
```

## Reglas de Decisión del NPC
| Condición | Resultado |
|-----------|-----------|
| `oferta >= precio_minimo` | **Acepta** la oferta |
| `oferta >= 80% de precio_minimo` | **Contraoferta** |
| `oferta < 80% de precio_minimo` | **Rechazo** |

## Estados Emocionales del NPC Durante Regateo
```
neutral → interesado → dudoso → molesto → enojado
```

Cada estado afecta:
- La probabilidad de aceptar ofertas
- El tamaño de las contraofertas
- Si el NPC abandona la negociación

## Flujo de Negociación
1. NPC llega con un objeto o busca comprar
2. Se muestra el objeto y el NPC da su precio inicial
3. Jugador puede: aceptar, contraoferta, o rechazar
4. Si contraoferta: NPC evalúa según fórmulas
5. NPC responde: acepta, contraoferta, o rechaza
6. Ciclo continúa hasta acuerdo o ruptura
7. Si acuerdo: transacción se registra, inventario se actualiza

## Implementación
```javascript
class BargainEngine {
  evaluateOffer(offer, item, npc) {
    const perceivedValue = item.baseValue * npc.knowledge;
    const minimumPrice = perceivedValue * (1 + npc.greed - npc.patience);
    
    if (offer >= minimumPrice) return { result: 'accept', price: offer };
    if (offer >= minimumPrice * 0.8) {
      const counter = (minimumPrice + offer) / 2;
      return { result: 'counter', price: counter };
    }
    return { result: 'reject' };
  }
}
```

## Archivos Relacionados
- `game/negotiation/BargainEngine.js`
- `game/scenes/NegotiationScene.js`
- `game/ui/NegotiationUI.js`
