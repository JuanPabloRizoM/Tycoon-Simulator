// ============================================================
// Data: Item Catalog, Rarity Table, Condition Labels
// Pure data — no logic, no imports
// ============================================================

export const ITEM_CATALOG = {
    electronica: [
        { name: 'Radio vintage', baseValue: 80 },
        { name: 'Walkman Sony', baseValue: 120 },
        { name: 'Calculadora Casio', baseValue: 30 },
        { name: 'Game Boy', baseValue: 200 },
        { name: 'Reloj digital', baseValue: 50 },
        { name: 'Cámara Polaroid', baseValue: 150 },
        { name: 'Teléfono Nokia', baseValue: 40 },
        { name: 'Discman Sony', baseValue: 90 },
        { name: 'Radio de onda corta', baseValue: 110 },
        { name: 'Pager Motorola', baseValue: 35 }
    ],
    videojuegos_retro: [
        { name: 'Cartucho NES', baseValue: 150 },
        { name: 'Super Nintendo', baseValue: 300 },
        { name: 'Atari 2600', baseValue: 250 },
        { name: 'Sega Genesis', baseValue: 180 },
        { name: 'PS1 Original', baseValue: 200 },
        { name: 'Nintendo 64', baseValue: 280 },
        { name: 'Game Boy Color', baseValue: 160 },
        { name: 'Neo Geo Pocket', baseValue: 220 },
        { name: 'Virtual Boy', baseValue: 350 },
        { name: 'Sega Dreamcast', baseValue: 190 }
    ],
    antiguedades: [
        { name: 'Reloj de bolsillo', baseValue: 400 },
        { name: 'Moneda antigua', baseValue: 100 },
        { name: 'Figura de porcelana', baseValue: 250 },
        { name: 'Libro antiguo', baseValue: 150 },
        { name: 'Joyería vintage', baseValue: 350 },
        { name: 'Máquina de escribir', baseValue: 300 },
        { name: 'Brújula de bronce', baseValue: 180 },
        { name: 'Mapa antiguo', baseValue: 220 },
        { name: 'Sello postal raro', baseValue: 130 },
        { name: 'Llave antigua', baseValue: 80 }
    ],
    juguetes: [
        { name: 'Luchador de plástico', baseValue: 20 },
        { name: 'Hot Wheels', baseValue: 40 },
        { name: 'Muñeca Barbie 90s', baseValue: 80 },
        { name: 'Trompo de madera', baseValue: 15 },
        { name: 'Transformer original', baseValue: 200 },
        { name: 'Tazo de colección', baseValue: 10 },
        { name: 'Yo-yo profesional', baseValue: 25 },
        { name: 'Canica ojo de gato', baseValue: 5 },
        { name: 'Lego vintage', baseValue: 120 },
        { name: 'Máscara de luchador', baseValue: 60 }
    ],
    moda_urbana: [
        { name: 'Tenis Jordan retro', baseValue: 300 },
        { name: 'Playera band vintage', baseValue: 60 },
        { name: 'Chamarra de cuero', baseValue: 180 },
        { name: 'Gorra snapback', baseValue: 25 },
        { name: 'Lentes de sol retro', baseValue: 45 },
        { name: 'Reloj Casio dorado', baseValue: 55 },
        { name: 'Cadena dorada', baseValue: 70 },
        { name: 'Mochila vintage', baseValue: 90 },
        { name: 'Cinturón de cuero', baseValue: 35 },
        { name: 'Botas vaqueras', baseValue: 150 }
    ]
};

export const RARITY_TABLE = [
    { name: 'común', multiplier: 1.0, threshold: 0.60, color: '#9E9E9E', textureKey: 'item_comun' },
    { name: 'raro', multiplier: 2.0, threshold: 0.85, color: '#2196F3', textureKey: 'item_raro' },
    { name: 'épico', multiplier: 5.0, threshold: 0.95, color: '#9C27B0', textureKey: 'item_epico' },
    { name: 'legendario', multiplier: 15.0, threshold: 1.0, color: '#FFD700', textureKey: 'item_legendario' }
];

export const CONDITION_LABELS = [
    { min: 0.0, max: 0.3, label: 'Muy maltratado' },
    { min: 0.3, max: 0.5, label: 'Usado' },
    { min: 0.5, max: 0.7, label: 'Buen estado' },
    { min: 0.7, max: 0.9, label: 'Excelente' },
    { min: 0.9, max: 1.0, label: 'Como nuevo' }
];
