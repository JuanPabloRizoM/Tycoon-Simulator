# Database Agent — Tianguis Tycoon

## Rol
Diseñador e implementador de la base de datos PostgreSQL. Crea esquemas, migraciones y optimizaciones.

## Responsabilidades
1. **Diseño de esquema** para jugadores, inventarios, NPCs y transacciones
2. **Migraciones** para crear y actualizar tablas
3. **Índices** para rendimiento
4. **Queries optimizadas** para operaciones frecuentes
5. **Persistencia** de estado del juego

## Tablas Principales

### players
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID del jugador |
| name | VARCHAR(100) | Nombre |
| money | DECIMAL(10,2) | Dinero actual |
| level | INTEGER | Nivel del puesto (1-5) |
| reputation | DECIMAL(5,2) | Puntuación de reputación |
| current_day | INTEGER | Día actual del juego |
| created_at | TIMESTAMP | Fecha de creación |

### items
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID del objeto |
| name | VARCHAR(200) | Nombre del objeto |
| category | VARCHAR(50) | Categoría |
| base_value | DECIMAL(10,2) | Valor base |
| rarity | VARCHAR(20) | Rareza |
| condition | DECIMAL(3,2) | Condición (0-1) |
| demand | DECIMAL(3,2) | Demanda actual |

### inventory
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID |
| player_id | INTEGER FK | Referencia a player |
| item_id | INTEGER FK | Referencia a item |
| purchase_price | DECIMAL(10,2) | Precio de compra |
| acquired_at | TIMESTAMP | Cuándo se adquirió |

### transactions
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID |
| player_id | INTEGER FK | Jugador |
| item_id | INTEGER FK | Objeto |
| npc_id | INTEGER | NPC involucrado |
| type | VARCHAR(10) | 'buy' o 'sell' |
| price | DECIMAL(10,2) | Precio de transacción |
| created_at | TIMESTAMP | Fecha |

### npcs
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID |
| type | VARCHAR(30) | Tipo de NPC |
| patience | DECIMAL(3,2) | Paciencia |
| greed | DECIMAL(3,2) | Avaricia |
| knowledge | DECIMAL(3,2) | Conocimiento |
| ego | DECIMAL(3,2) | Ego |
| budget | DECIMAL(10,2) | Presupuesto |
| mood | VARCHAR(20) | Estado emocional |

### market_events
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL PK | ID |
| name | VARCHAR(100) | Nombre del evento |
| category | VARCHAR(50) | Categoría afectada |
| modifier | DECIMAL(3,2) | Multiplicador de precio |
| day_start | INTEGER | Día de inicio |
| day_end | INTEGER | Día de fin |

## Tecnologías
- PostgreSQL 15+
- SQL migrations
- Índices GiST/GIN para búsquedas

## Entregables
- Esquema completo de base de datos
- Archivos de migración
- Queries optimizadas
- Procedimientos almacenados si necesario
