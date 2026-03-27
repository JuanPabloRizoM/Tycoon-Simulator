---
name: Inventory System
description: Sistema de gestión de inventario del jugador con límites por nivel
---

# Inventory System — Skill

## Descripción
Gestiona el inventario del jugador: agregar, remover objetos y respetar límites según nivel de progresión.

## Límites por Nivel
| Nivel | Nombre | Capacidad |
|-------|--------|-----------|
| 1 | Puesto improvisado | 10 objetos |
| 2 | Puesto con lona | 20 objetos |
| 3 | Puesto grande | 35 objetos |
| 4 | Tienda fija | 50 objetos |
| 5 | Importador internacional | 100 objetos |

## Implementación
```javascript
class InventoryManager {
  constructor(playerLevel = 1) {
    this.items = [];
    this.playerLevel = playerLevel;
  }

  getCapacity() {
    const CAPACITY = { 1: 10, 2: 20, 3: 35, 4: 50, 5: 100 };
    return CAPACITY[this.playerLevel] || 10;
  }

  canAddItem() {
    return this.items.length < this.getCapacity();
  }

  addItem(item, purchasePrice) {
    if (!this.canAddItem()) return { success: false, reason: 'inventory_full' };
    this.items.push({ ...item, purchasePrice, acquiredAt: Date.now() });
    return { success: true };
  }

  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) return { success: false, reason: 'not_found' };
    return { success: true, item: this.items.splice(index, 1)[0] };
  }

  getProfit(item, sellPrice) {
    return sellPrice - item.purchasePrice;
  }

  getTotalValue(economySystem) {
    return this.items.reduce((sum, item) => sum + economySystem.calculatePrice(item), 0);
  }
}
```

## Archivos Relacionados
- `game/inventory/InventoryManager.js`
- `game/ui/InventoryUI.js`
