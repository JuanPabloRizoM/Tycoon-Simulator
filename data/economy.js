// ============================================================
// Data: Economy Categories, Inventory Capacity
// Pure data — no logic, no imports
// ============================================================

export const CATEGORIES = {
    electronica: { demand: 1.0, supply: 1.0, volatility: 0.15, label: 'Electrónica' },
    videojuegos_retro: { demand: 1.2, supply: 0.8, volatility: 0.10, label: 'Videojuegos Retro' },
    antiguedades: { demand: 0.8, supply: 0.6, volatility: 0.05, label: 'Antigüedades' },
    juguetes: { demand: 1.0, supply: 1.0, volatility: 0.10, label: 'Juguetes' },
    moda_urbana: { demand: 1.1, supply: 0.9, volatility: 0.15, label: 'Moda Urbana' }
};

export const CAPACITY_BY_LEVEL = {
    1: 8,   // Puesto improvisado
    2: 12,  // Puesto con lona
    3: 16,  // Puesto grande
    4: 20,  // Tienda fija
    5: 30   // Importador internacional
};
