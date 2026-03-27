---
name: Object Generation
description: Sistema de generación procedural de objetos con rareza y valor calculado
---

# Object Generation — Skill

## Descripción
Genera objetos proceduralmente con propiedades, rareza y valor basado en fórmulas del documento.

## Propiedades de Objeto
- `name` — Nombre del objeto
- `category` — Categoría (electrónica, videojuegos retro, antigüedades, juguetes, moda urbana)
- `condition` — Condición del objeto (0.0 - 1.0)
- `rarity` — Rareza (común, raro, épico, legendario)
- `demand` — Demanda actual

## Distribución de Rareza
| Rareza | Probabilidad | Multiplicador |
|--------|-------------|--------------|
| Común | 60% | 1.0x |
| Raro | 25% | 2.0x |
| Épico | 10% | 5.0x |
| Legendario | 5% | 15.0x |

## Fórmula de Valor
```javascript
valor = base × rareza × condición × demanda
```

## Objetos por Categoría
```javascript
const ITEM_CATALOG = {
  electronica: [
    { name: 'Radio vintage', baseValue: 80 },
    { name: 'Walkman Sony', baseValue: 120 },
    { name: 'Calculadora Casio', baseValue: 30 },
    { name: 'Game Boy', baseValue: 200 },
    { name: 'Reloj digital', baseValue: 50 }
  ],
  videojuegos_retro: [
    { name: 'Cartucho NES', baseValue: 150 },
    { name: 'Super Nintendo', baseValue: 300 },
    { name: 'Atari 2600', baseValue: 250 },
    { name: 'Sega Genesis', baseValue: 180 },
    { name: 'PS1 Original', baseValue: 200 }
  ],
  antiguedades: [
    { name: 'Reloj de bolsillo', baseValue: 400 },
    { name: 'Moneda antigua', baseValue: 100 },
    { name: 'Figura de porcelana', baseValue: 250 },
    { name: 'Libro antiguo', baseValue: 150 },
    { name: 'Joyería vintage', baseValue: 350 }
  ],
  juguetes: [
    { name: 'Luchador de plástico', baseValue: 20 },
    { name: 'Hot Wheels', baseValue: 40 },
    { name: 'Muñeca Barbie 90s', baseValue: 80 },
    { name: 'Trompo de madera', baseValue: 15 },
    { name: 'Transformer original', baseValue: 200 }
  ],
  moda_urbana: [
    { name: 'Tenis Jordan retro', baseValue: 300 },
    { name: 'Playera band vintage', baseValue: 60 },
    { name: 'Chamarra de cuero', baseValue: 180 },
    { name: 'Gorra snapback', baseValue: 25 },
    { name: 'Lentes de sol retro', baseValue: 45 }
  ]
};
```

## Implementación
```javascript
class ObjectFactory {
  static generateItem(category = null) {
    if (!category) {
      const cats = Object.keys(ITEM_CATALOG);
      category = cats[Math.floor(Math.random() * cats.length)];
    }
    
    const items = ITEM_CATALOG[category];
    const base = items[Math.floor(Math.random() * items.length)];
    const rarity = this.rollRarity();
    const condition = 0.3 + Math.random() * 0.7;

    return {
      id: generateId(),
      name: base.name,
      category,
      baseValue: base.baseValue,
      rarity: rarity.name,
      rarityMultiplier: rarity.multiplier,
      condition: Math.round(condition * 100) / 100,
      demand: 1.0
    };
  }

  static rollRarity() {
    const roll = Math.random();
    if (roll < 0.05) return { name: 'legendario', multiplier: 15.0 };
    if (roll < 0.15) return { name: 'épico', multiplier: 5.0 };
    if (roll < 0.40) return { name: 'raro', multiplier: 2.0 };
    return { name: 'común', multiplier: 1.0 };
  }
}
```

## Archivos Relacionados
- `game/inventory/ObjectFactory.js`
- `game/economy/EconomySystem.js`
