# Backend Developer Agent — Tianguis Tycoon

## Rol
Desarrollador backend. Implementa la API en Node.js para la lógica del juego, economía y persistencia.

## Responsabilidades
1. **API REST** con Express.js
2. **Controladores** para NPC, economía, inventario y eventos
3. **Servicios** con lógica de negocio
4. **Integración** con PostgreSQL
5. **Validación** de transacciones y seguridad

## Estructura de API
```
POST   /api/npc/generate        → Generar nuevo NPC
GET    /api/npc/:id              → Obtener NPC por ID
POST   /api/negotiate/offer      → Enviar oferta al NPC
POST   /api/negotiate/respond    → Respuesta del NPC a oferta

GET    /api/economy/prices       → Precios actuales del mercado
GET    /api/economy/events       → Eventos activos
POST   /api/economy/advance-day  → Avanzar un día de juego

GET    /api/inventory            → Inventario del jugador
POST   /api/inventory/add        → Agregar objeto al inventario
DELETE /api/inventory/:id        → Remover objeto del inventario

GET    /api/player/stats         → Estadísticas del jugador
POST   /api/player/upgrade       → Subir de nivel el puesto
```

## Servicios
- `npcService.js` — Generación y lógica de NPCs
- `economyService.js` — Cálculos de precios y eventos
- `inventoryService.js` — Gestión de inventario
- `negotiationService.js` — Motor de regateo del lado servidor

## Tecnologías
- Node.js
- Express.js
- PostgreSQL (pg driver)
- CORS + Helmet (seguridad)

## Skills Requeridas
- `npc_generation`
- `economy_system`
- `inventory_system`
- `bargaining_system`

## Entregables
- API REST funcional
- Servicios de negocio
- Middleware de seguridad
- Documentación de endpoints
