// ============================================================
// Data: NPC Profiles, Names, Type Weights
// Pure data — no logic, no imports
// ============================================================

export const NPC_PROFILES = {
    coleccionista: {
        patience: [0.4, 0.7], greed: [0.2, 0.4],
        knowledge: [0.7, 1.0], ego: [0.5, 0.8],
        risk: [0.2, 0.5], budget: [500, 2000],
        offerRange: [0.7, 0.95],
        description: 'Busca piezas raras para su colección'
    },
    turista: {
        patience: [0.6, 0.9], greed: [0.1, 0.3],
        knowledge: [0.1, 0.4], ego: [0.2, 0.5],
        risk: [0.3, 0.6], budget: [200, 800],
        offerRange: [0.5, 0.85],
        description: 'Quiere un recuerdo del tianguis'
    },
    revendedor: {
        patience: [0.3, 0.6], greed: [0.7, 1.0],
        knowledge: [0.6, 0.9], ego: [0.3, 0.6],
        risk: [0.4, 0.7], budget: [300, 1500],
        offerRange: [0.4, 0.70],
        description: 'Busca gangas para revender'
    },
    cliente_normal: {
        patience: [0.4, 0.7], greed: [0.3, 0.6],
        knowledge: [0.3, 0.6], ego: [0.3, 0.6],
        risk: [0.3, 0.6], budget: [100, 500],
        offerRange: [0.6, 0.90],
        description: 'Solo busca algo que le guste'
    },
    regateador: {
        patience: [0.5, 0.8], greed: [0.5, 0.8],
        knowledge: [0.5, 0.8], ego: [0.4, 0.7],
        risk: [0.4, 0.7], budget: [200, 600],
        offerRange: [0.5, 0.80],
        description: 'Viene preparado para pedir buen precio'
    },
    estafador: {
        patience: [0.2, 0.5], greed: [0.8, 1.0],
        knowledge: [0.5, 0.8], ego: [0.7, 1.0],
        risk: [0.7, 1.0], budget: [50, 300],
        offerRange: [0.2, 0.55],
        description: 'Intentará engañarte con el precio'
    }
};

export const NPC_NAMES = {
    coleccionista: ['Don Arturo', 'Doña Martha', 'Profesor Luna', 'Sra. Catalina', 'Don Emilio'],
    turista: ['Gringo Mike', 'Tourist Karen', 'Mochilero Pedro', 'Backpacker Lisa', 'Viajero Tomás'],
    revendedor: ['El Chino', 'La Güera', 'Don Beto', 'El Rata', 'La Doña'],
    cliente_normal: ['María', 'Juan', 'Carlos', 'Ana', 'Roberto', 'Lupita', 'Paco', 'Rosa'],
    regateador: ['Don Luis', 'Doña Carmen', 'El Compadre', 'Señora Lety', 'Don Chete'],
    estafador: ['El Coyote', 'El Mañoso', 'La Zorra', 'El Trampas', 'Don Turbio']
};

export const TYPE_WEIGHTS = {
    coleccionista: 0.15,
    turista: 0.25,
    revendedor: 0.20,
    cliente_normal: 0.15,
    regateador: 0.15,
    estafador: 0.10
};

// Required fields for every generated NPC (used by tests)
export const NPC_REQUIRED_FIELDS = [
    'id', 'name', 'type', 'description',
    'patience', 'greed', 'knowledge', 'ego', 'risk',
    'budget', 'offerRange',
    'mood', 'emotionalState', 'interactionCount', 'texture'
];
