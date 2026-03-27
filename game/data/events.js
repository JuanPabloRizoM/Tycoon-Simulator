// ============================================================
// Data: Market Event Definitions, Weights, Probability
// Pure data — no logic, no imports
// ============================================================

export const EVENT_PROBABILITY = 0.3;

export const EVENT_DEFINITIONS = {
    feria_coleccionistas: {
        name: 'Feria de Coleccionistas',
        description: '¡Coleccionistas de todo el país visitan el tianguis!',
        icon: '🏆',
        category: 'videojuegos_retro',
        demandModifier: 0.5,
        duration: [2, 3],
        effects: ['Cartas y coleccionables +50% demanda', 'Más coleccionistas aparecen']
    },
    moda_retro: {
        name: 'Moda Retro',
        description: '¡La moda retro está de vuelta! Todos quieren ropa vintage.',
        icon: '👗',
        category: 'moda_urbana',
        demandModifier: 0.4,
        duration: [2, 3],
        effects: ['Ropa vintage +40% demanda', 'Turistas interesados en moda']
    },
    escasez_electronica: {
        name: 'Escasez Electrónica',
        description: 'Hay escasez de electrónicos en las tiendas formales.',
        icon: '📱',
        category: 'electronica',
        demandModifier: 0.6,
        duration: [1, 2],
        effects: ['Electrónicos +60% demanda', 'Precios suben considerablemente']
    },
    inspeccion_policial: {
        name: 'Inspección Policial',
        description: '¡Cuidado! La policía está haciendo inspecciones...',
        icon: '🚔',
        category: null,
        demandModifier: -0.3,
        duration: [1, 1],
        effects: ['Riesgo para objetos falsos', 'Menos compradores por miedo']
    },
    festival_tianguis: {
        name: 'Festival del Tianguis',
        description: '¡Gran festival! Todo el barrio viene a comprar.',
        icon: '🎉',
        category: null,
        demandModifier: 0.2,
        duration: [1, 1],
        effects: ['Aumento general de compradores', '+20% clientes']
    },
    coleccionista_raro: {
        name: 'Coleccionista Raro',
        description: 'Un coleccionista millonario busca algo especial...',
        icon: '🎩',
        category: 'antiguedades',
        demandModifier: 0.4,
        duration: [1, 1],
        effects: ['NPC especial con alto presupuesto', 'Busca objetos épicos/legendarios']
    },
    mercado_nocturno: {
        name: 'Mercado Nocturno',
        description: 'Se abre el mercado nocturno con objetos especiales.',
        icon: '🌙',
        category: null,
        demandModifier: 0.15,
        duration: [1, 1],
        effects: ['Objetos únicos disponibles', 'Ambiente diferente']
    },
    subasta_especial: {
        name: 'Subasta Especial',
        description: '¡Subasta de objetos raros en la plaza!',
        icon: '🔨',
        category: 'antiguedades',
        demandModifier: 0.3,
        duration: [1, 1],
        effects: ['Oportunidades de compra únicas', 'Precios pueden subir o bajar']
    },
    tourist_day: {
        name: 'Día de Turistas',
        description: 'Un autobús de turistas llegó al tianguis.',
        icon: '🚌',
        category: null,
        demandModifier: 0.15,
        duration: [1, 1],
        effects: ['Más turistas', 'Clientes más pacientes'],
        spawnWeightOverrides: { turista: 0.25 },
        patienceMod: 10,
        flexMod: 0.05
    },
    rare_lot: {
        name: 'Lote Raro',
        description: 'Alguien trajo mercancía especial al mercado.',
        icon: '📦',
        category: null,
        demandModifier: 0.1,
        duration: [1, 1],
        effects: ['Objetos de mejor calidad', 'Coleccionistas interesados'],
        rarityShift: 0.15,
        spawnWeightOverrides: { coleccionista: 0.10 }
    },
    slow_market: {
        name: 'Día Flojo',
        description: 'Poca gente en el tianguis hoy.',
        icon: '😴',
        category: null,
        demandModifier: -0.15,
        duration: [1, 1],
        effects: ['Menos compradores', 'Los que vienen regatean más'],
        flexMod: -0.03
    },
    collector_hunt: {
        name: 'Cacería de Coleccionistas',
        description: '¡Coleccionistas buscan tesoros escondidos!',
        icon: '🔍',
        category: null,
        demandModifier: 0.2,
        duration: [1, 1],
        effects: ['Más coleccionistas', 'Mejores oportunidades de venta'],
        spawnWeightOverrides: { coleccionista: 0.20 },
        patienceMod: 5,
        rarityShift: 0.05
    },
    rain_day: {
        name: 'Día de Lluvia',
        description: 'La lluvia espantó a muchos, pero los que quedaron quieren comprar.',
        icon: '🌧️',
        category: null,
        demandModifier: -0.1,
        duration: [1, 1],
        effects: ['Menos gente', 'Compradores más dispuestos a negociar'],
        spawnWeightOverrides: { cliente_normal: -0.10 },
        patienceMod: 5,
        flexMod: 0.08
    }
};

export const EVENT_WEIGHTS = {
    feria_coleccionistas: 0.10,
    moda_retro: 0.10,
    escasez_electronica: 0.08,
    inspeccion_policial: 0.08,
    festival_tianguis: 0.10,
    coleccionista_raro: 0.06,
    mercado_nocturno: 0.08,
    subasta_especial: 0.06,
    tourist_day: 0.10,
    rare_lot: 0.08,
    slow_market: 0.06,
    collector_hunt: 0.06,
    rain_day: 0.04
};
