// ============================================================
// Data: Upgrades Config
// Defines the 4 branching paths for the Tycoon Player Stall
// ============================================================

export const UPGRADE_TREES = {
    capacidad: {
        id: 'UPG_CAPACITY',
        name: 'Capacidad de Carga',
        description: 'Añade espacio para guardar más objetos.',
        maxLevel: 5,
        costs: { 1: 40, 2: 150, 3: 600, 4: 2500, 5: 8000 }
    },
    atractivo: {
        id: 'UPG_VISUAL',
        name: 'Atractivo del Puesto',
        description: 'Mejora visual que atrae más clientes diariamente.',
        maxLevel: 5,
        costs: { 1: 75, 2: 300, 3: 1200, 4: 5000, 5: 15000 }
    },
    confianza: {
        id: 'UPG_TRUST',
        name: 'Confianza Letrada',
        description: 'Da +5 de paciencia base a todos tus clientes.',
        maxLevel: 5,
        costs: { 1: 100, 2: 450, 3: 1800, 4: 7000, 5: 20000 }
    },
    contactos: {
        id: 'UPG_NETWORK',
        name: 'Red de Contactos',
        description: 'Aumenta un 10% la posibilidad de rarezas.',
        maxLevel: 5,
        costs: { 1: 150, 2: 600, 3: 2500, 4: 10000, 5: 35000 }
    }
};
