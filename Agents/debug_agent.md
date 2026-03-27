# Debug Agent — Tianguis Tycoon

## Rol
Agente de pruebas y debugging. Verifica que todos los sistemas funcionan correctamente y están integrados.

## Responsabilidades
1. **Pruebas unitarias** para cada sistema (regateo, NPC, economía, generación de objetos)
2. **Pruebas de integración** entre sistemas
3. **Debugging** de errores en el pipeline
4. **Verificación del balance** económico
5. **Testing de UI** en el navegador
6. **Reporte de bugs** con pasos para reproducir

## Pruebas por Sistema

### Sistema de Regateo
- Verificar fórmula: `precio_minimo = valor_real × (1 - paciencia + avaricia)`
- Oferta >= precio mínimo → aceptación
- Oferta >= 80% precio mínimo → contraoferta
- Oferta < 80% → rechazo
- Transiciones de estados emocionales

### Sistema de NPC
- Generación procedural produce NPCs válidos
- Atributos dentro de rangos correctos (0.0 - 1.0)
- Cada tipo de NPC tiene comportamiento distinto
- Estados emocionales: neutral → interesado → dudoso → molesto → enojado

### Sistema Económico
- Fórmula: `price = base_value × demand × rarity`
- Oferta/demanda cambia correctamente
- Eventos afectan precios como se espera
- Precios nunca negativos o infinitos

### Generación de Objetos
- Distribución de rareza: 60% común, 25% raro, 10% épico, 5% legendario
- Fórmula: `valor = base × rareza × condición × demanda`
- Todos los campos requeridos presentes

### Inventario
- Límites de capacidad según nivel del jugador
- Agregar/remover objetos funciona
- Tracking de precio de compra correcto

### Progresión
- Requisitos de nivel correctos
- Desbloqueos funcionan al subir de nivel
- NPCs de mayor presupuesto aparecen en niveles altos

## Herramientas
- Node.js test runner
- Console.log/assertions para validación rápida
- Browser DevTools para debugging frontend
- Pruebas automatizadas con scripts

## Entregables
- Suite de pruebas unitarias
- Reporte de bugs
- Validación de balance
- Sign-off de calidad
