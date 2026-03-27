---
name: Economy System
description: Sistema económico con precios dinámicos, oferta/demanda y categorías de mercado
---

# Economy System — Skill

## Descripción
Sistema que controla los precios del mercado basándose en oferta, demanda, rareza y eventos.

## Fórmula de Precio
```javascript
price = base_value * demand * rarity_multiplier
```

## Fórmula de Valor de Objeto
```javascript
valor = base * rareza * condicion * demanda
```

## Categorías de Mercado
Cada categoría tiene oferta/demanda independiente:

| Categoría | Demanda Base | Volatilidad |
|-----------|-------------|-------------|
| Electrónica | 1.0 | Alta |
| Videojuegos retro | 1.2 | Media |
| Antigüedades | 0.8 | Baja |
| Juguetes | 1.0 | Media |
| Moda urbana | 1.1 | Alta |

## Dinámica de Oferta/Demanda
```javascript
class EconomySystem {
  constructor() {
    this.categories = {
      electronica: { demand: 1.0, supply: 1.0, volatility: 0.15 },
      videojuegos_retro: { demand: 1.2, supply: 0.8, volatility: 0.10 },
      antiguedades: { demand: 0.8, supply: 0.6, volatility: 0.05 },
      juguetes: { demand: 1.0, supply: 1.0, volatility: 0.10 },
      moda_urbana: { demand: 1.1, supply: 0.9, volatility: 0.15 }
    };
  }

  calculatePrice(item) {
    const cat = this.categories[item.category];
    const demandFactor = cat.demand / cat.supply;
    return item.baseValue * demandFactor * item.rarityMultiplier * item.condition;
  }

  advanceDay() {
    // Fluctuar demanda/oferta por categoría
    for (const [key, cat] of Object.entries(this.categories)) {
      cat.demand += (Math.random() - 0.5) * cat.volatility * 2;
      cat.demand = Math.max(0.3, Math.min(2.0, cat.demand));
    }
  }
}
```

## Archivos Relacionados
- `game/economy/EconomySystem.js`
- `game/economy/MarketEvents.js`
