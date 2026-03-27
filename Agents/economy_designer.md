# Economy Designer Agent — Tianguis Tycoon

## Rol
Diseñador del sistema económico. Controla precios, oferta, demanda y eventos de mercado.

## Responsabilidades
1. **Sistema de precios**: fórmula `price = base_value × demand × rarity`
2. **Oferta y demanda** dinámica por categoría de objetos
3. **Eventos de mercado** que alteran precios globales
4. **Balance económico** para progresión fluida
5. **Categorías de mercado** con comportamiento independiente

## Fórmula de Precio
```
price = base_value × demand × rarity
```

Donde:
- `base_value`: Valor base del objeto
- `demand`: Factor de demanda actual del mercado (0.5 - 2.0)
- `rarity`: Multiplicador de rareza del objeto

## Fórmula de Valor de Objeto
```
valor = base × rareza × condición × demanda
```

## Categorías de Mercado
Cada categoría tiene oferta/demanda independiente:
- Electrónica
- Videojuegos retro
- Antigüedades
- Juguetes
- Moda urbana

## Eventos de Mercado
| Evento | Efecto |
|--------|--------|
| Feria de coleccionistas | Cartas +50% |
| Moda retro | Ropa vintage +40% |
| Escasez electrónica | Electrónicos +60% |
| Inspección policial | Riesgo para objetos falsos |
| Festival del tianguis | Aumento general de compradores |
| Mercado nocturno | Objetos especiales disponibles |
| Subasta especial | Oportunidades de compra única |

Cada día de juego tiene probabilidad de evento global.

## Skills Requeridas
- `economy_system`
- `event_system`
- `object_generation`

## Entregables
- Sistema de precios dinámico
- Simulación de oferta/demanda
- Sistema de eventos
- Tablas de balance económico
