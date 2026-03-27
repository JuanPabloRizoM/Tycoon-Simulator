---
name: Event System
description: Sistema de eventos aleatorios del mercado que alteran la economía del juego
---

# Event System — Skill

## Descripción
Eventos aleatorios que mantienen el juego dinámico modificando precios, disponibilidad y comportamiento de NPCs.

## Eventos del Mercado

| Evento | Categoría Afectada | Modificador | Duración |
|--------|-------------------|-------------|----------|
| Feria de coleccionistas | Cartas/Coleccionables | +50% demanda | 2-3 días |
| Moda retro | Ropa vintage | +40% demanda | 2-3 días |
| Escasez electrónica | Electrónicos | +60% demanda | 1-2 días |
| Inspección policial | Objetos falsos | Riesgo de confiscación | 1 día |
| Festival del tianguis | Todas | +20% compradores | 1 día |
| Coleccionista raro | Específica | NPC especial con alto budget | 1 día |
| Mercado nocturno | Especiales | Objetos únicos disponibles | 1 noche |
| Subasta especial | Variable | Oportunidades de compra únicas | 1 día |

## Probabilidad de Eventos
Cada día de juego tiene probabilidad de evento global:
```javascript
const EVENT_PROBABILITY = 0.3; // 30% chance per day

const EVENT_WEIGHTS = {
  feria_coleccionistas: 0.15,
  moda_retro: 0.15,
  escasez_electronica: 0.10,
  inspeccion_policial: 0.10,
  festival_tianguis: 0.15,
  coleccionista_raro: 0.10,
  mercado_nocturno: 0.15,
  subasta_especial: 0.10
};
```

## Implementación
```javascript
class MarketEvents {
  constructor(economySystem) {
    this.economy = economySystem;
    this.activeEvents = [];
  }

  checkForNewEvent(currentDay) {
    if (Math.random() < EVENT_PROBABILITY) {
      const event = this.generateEvent(currentDay);
      this.activeEvents.push(event);
      this.applyEventEffects(event);
      return event;
    }
    return null;
  }

  generateEvent(currentDay) {
    const type = weightedRandom(Object.keys(EVENT_WEIGHTS), Object.values(EVENT_WEIGHTS));
    return {
      type,
      dayStart: currentDay,
      dayEnd: currentDay + Math.floor(Math.random() * 3) + 1,
      ...EVENT_DEFINITIONS[type]
    };
  }

  advanceDay(currentDay) {
    // Remove expired events
    this.activeEvents = this.activeEvents.filter(e => e.dayEnd > currentDay);
    // Check for new events
    return this.checkForNewEvent(currentDay);
  }
}
```

## Archivos Relacionados
- `game/economy/MarketEvents.js`
- `game/economy/EconomySystem.js`
