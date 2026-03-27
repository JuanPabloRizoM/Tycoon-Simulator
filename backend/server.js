// ============================================================
// Tianguis Tycoon — Backend Server (Express.js)
// API para NPC, economía, inventario y negociación
// ============================================================

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- In-memory game state (PostgreSQL integration ready) ---
let gameState = {
    player: {
        id: 1,
        name: 'Jugador',
        money: 500,
        level: 1,
        reputation: 50,
        currentDay: 1,
        totalEarnings: 0
    },
    inventory: [],
    transactions: [],
    activeNPCs: [],
    marketState: {
        electronica: { demand: 1.0, supply: 1.0 },
        videojuegos_retro: { demand: 1.2, supply: 0.8 },
        antiguedades: { demand: 0.8, supply: 0.6 },
        juguetes: { demand: 1.0, supply: 1.0 },
        moda_urbana: { demand: 1.1, supply: 0.9 }
    },
    activeEvents: []
};

// === NPC Routes ===
app.post('/api/npc/generate', (req, res) => {
    const types = ['coleccionista', 'turista', 'revendedor', 'cliente_normal', 'estafador'];
    const type = req.body.type || types[Math.floor(Math.random() * types.length)];

    const npc = {
        id: Date.now(),
        type,
        name: `NPC_${type}_${Math.floor(Math.random() * 100)}`,
        patience: Math.random(),
        greed: Math.random(),
        knowledge: Math.random(),
        ego: Math.random(),
        risk: Math.random(),
        budget: 100 + Math.floor(Math.random() * 900),
        mood: 'neutral'
    };

    gameState.activeNPCs.push(npc);
    res.json({ success: true, npc });
});

app.get('/api/npc/:id', (req, res) => {
    const npc = gameState.activeNPCs.find(n => n.id === parseInt(req.params.id));
    if (!npc) return res.status(404).json({ error: 'NPC not found' });
    res.json(npc);
});

// === Economy Routes ===
app.get('/api/economy/prices', (req, res) => {
    res.json(gameState.marketState);
});

app.get('/api/economy/events', (req, res) => {
    res.json(gameState.activeEvents);
});

app.post('/api/economy/advance-day', (req, res) => {
    gameState.player.currentDay++;

    // Fluctuate market
    for (const [key, cat] of Object.entries(gameState.marketState)) {
        cat.demand += (Math.random() - 0.5) * 0.2;
        cat.demand = Math.max(0.3, Math.min(2.0, cat.demand));
        cat.supply += (Math.random() - 0.5) * 0.1;
        cat.supply = Math.max(0.3, Math.min(2.0, cat.supply));
    }

    // Random event (30% chance)
    if (Math.random() < 0.3) {
        const events = [
            { name: 'Feria de coleccionistas', category: 'videojuegos_retro', modifier: 1.5 },
            { name: 'Moda retro', category: 'moda_urbana', modifier: 1.4 },
            { name: 'Escasez electrónica', category: 'electronica', modifier: 1.6 }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        event.day = gameState.player.currentDay;
        gameState.activeEvents.push(event);
    }

    // Clean old events
    gameState.activeEvents = gameState.activeEvents.filter(
        e => gameState.player.currentDay - e.day < 3
    );

    res.json({
        day: gameState.player.currentDay,
        market: gameState.marketState,
        events: gameState.activeEvents
    });
});

// === Inventory Routes ===
app.get('/api/inventory', (req, res) => {
    res.json({
        items: gameState.inventory,
        count: gameState.inventory.length,
        capacity: [10, 20, 35, 50, 100][gameState.player.level - 1]
    });
});

app.post('/api/inventory/add', (req, res) => {
    const capacity = [10, 20, 35, 50, 100][gameState.player.level - 1];
    if (gameState.inventory.length >= capacity) {
        return res.status(400).json({ error: 'Inventory full' });
    }

    const item = { ...req.body, id: Date.now(), addedAt: new Date() };
    gameState.inventory.push(item);
    res.json({ success: true, item });
});

app.delete('/api/inventory/:id', (req, res) => {
    const index = gameState.inventory.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    const removed = gameState.inventory.splice(index, 1)[0];
    res.json({ success: true, item: removed });
});

// === Player Routes ===
app.get('/api/player/stats', (req, res) => {
    res.json(gameState.player);
});

app.post('/api/player/upgrade', (req, res) => {
    const costs = [0, 1000, 5000, 15000, 50000];
    const nextLevel = gameState.player.level + 1;

    if (nextLevel > 5) return res.status(400).json({ error: 'Max level reached' });
    if (gameState.player.money < costs[nextLevel - 1]) {
        return res.status(400).json({ error: 'Not enough money' });
    }

    gameState.player.money -= costs[nextLevel - 1];
    gameState.player.level = nextLevel;

    res.json({ success: true, player: gameState.player });
});

// === Negotiate Routes ===
app.post('/api/negotiate/offer', (req, res) => {
    const { npcId, offer, itemValue } = req.body;
    const npc = gameState.activeNPCs.find(n => n.id === npcId);

    if (!npc) return res.status(404).json({ error: 'NPC not found' });

    const perceivedValue = itemValue * npc.knowledge;
    const minimumPrice = perceivedValue * (1 + npc.greed - npc.patience);

    let result;
    if (offer >= minimumPrice) {
        result = { result: 'accept', price: offer };
    } else if (offer >= minimumPrice * 0.8) {
        const counter = Math.round((minimumPrice + offer) / 2);
        result = { result: 'counter', counterOffer: counter };
    } else {
        result = { result: 'reject' };
    }

    res.json(result);
});

// === Health check ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏪 Tianguis Tycoon API running on http://localhost:${PORT}`);
    console.log(`📊 Endpoints available:`);
    console.log(`   POST /api/npc/generate`);
    console.log(`   GET  /api/economy/prices`);
    console.log(`   GET  /api/inventory`);
    console.log(`   GET  /api/player/stats`);
    console.log(`   POST /api/negotiate/offer`);
});

module.exports = app;
