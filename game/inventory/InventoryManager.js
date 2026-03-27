// ============================================================
// InventoryManager — Gestión de inventario del jugador
// Capacidad varía por nivel de progresión
// ============================================================

import { CAPACITY_BY_LEVEL } from '../data/economy.js';

export class InventoryManager {
    constructor(capacityLevel = 1) {
        this.items = [];
        this.capacityLevel = capacityLevel;
        this.transactionHistory = [];
    }

    setCapacityLevel(level) {
        this.capacityLevel = level;
    }

    getCapacity() {
        return CAPACITY_BY_LEVEL[this.capacityLevel] || 10;
    }

    getItemCount() {
        return this.items.length;
    }

    isFull() {
        return this.items.length >= this.getCapacity();
    }

    canAddItem() {
        return this.items.length < this.getCapacity();
    }

    addItem(item, purchasePrice) {
        if (!this.canAddItem()) {
            return { success: false, reason: 'inventory_full' };
        }

        const inventoryItem = {
            ...item,
            purchasePrice,
            acquiredAt: Date.now(),
            inventoryId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };

        this.items.push(inventoryItem);

        this.transactionHistory.push({
            type: 'buy',
            item: item.name,
            price: purchasePrice,
            timestamp: Date.now()
        });

        return { success: true, item: inventoryItem };
    }

    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId || i.inventoryId === itemId);
        if (index === -1) return { success: false, reason: 'not_found' };

        const removed = this.items.splice(index, 1)[0];
        return { success: true, item: removed };
    }

    sellItem(itemId, sellPrice) {
        const result = this.removeItem(itemId);
        if (!result.success) return result;

        const profit = sellPrice - result.item.purchasePrice;

        this.transactionHistory.push({
            type: 'sell',
            item: result.item.name,
            price: sellPrice,
            profit,
            timestamp: Date.now()
        });

        return {
            success: true,
            item: result.item,
            sellPrice,
            profit,
            message: profit >= 0
                ? `¡Ganaste $${profit} con ${result.item.name}!`
                : `Perdiste $${Math.abs(profit)} con ${result.item.name}...`
        };
    }

    getItem(itemId) {
        return this.items.find(i => i.id === itemId || i.inventoryId === itemId) || null;
    }

    getItemsByCategory(category) {
        return this.items.filter(i => i.category === category);
    }

    getItemsByRarity(rarity) {
        return this.items.filter(i => i.rarity === rarity);
    }

    getTotalValue(economySystem) {
        return this.items.reduce((sum, item) => {
            return sum + economySystem.calculatePrice(item);
        }, 0);
    }

    getTotalInvestment() {
        return this.items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    }

    setPlayerLevel(level) {
        this.playerLevel = level;
    }

    getStats() {
        const buys = this.transactionHistory.filter(t => t.type === 'buy');
        const sells = this.transactionHistory.filter(t => t.type === 'sell');
        const totalProfit = sells.reduce((sum, t) => sum + (t.profit || 0), 0);

        return {
            itemCount: this.items.length,
            capacity: this.getCapacity(),
            totalBuys: buys.length,
            totalSells: sells.length,
            totalProfit,
            investment: this.getTotalInvestment()
        };
    }
}
