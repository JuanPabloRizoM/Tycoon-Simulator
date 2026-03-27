// ============================================================
// Data: NPC Dialogue Pools and Bargain Type Configuration
// Pure data — no logic, no imports
// ============================================================

export const EMOTIONAL_STATES = ['neutral', 'interesado', 'dudoso', 'molesto', 'enojado'];

// Profile mechanical configuration for BargainEngine
export const BARGAIN_TYPE_CONFIG = {
    turista: {
        patience: [80, 100],          
        flex: [0.30, 0.45],           
        insultTolerance: 0.70,        // Very tolerant (gringo tax)
        patienceDamageMult: 0.5,      // Takes 50% less patience damage
        offerRange: { buy: [0.8, 1.1], sell: [1.1, 1.3] }, // Willing to overpay slightly
        raritySensitivity: 0.8        // Doesn't care much about rarity (just wants a souvenir)
    },
    revendedor: {
        patience: [50, 70],           
        flex: [0.05, 0.15],           
        insultTolerance: 0.15,        // Very easily insulted
        patienceDamageMult: 1.5,      // Takes 150% patience damage on bad offers
        offerRange: { buy: [0.2, 0.4], sell: [1.5, 1.8] }, // Aggressive lowballing/highballing
        raritySensitivity: 1.2        // Values high rarity to squeeze margin
    },
    coleccionista: {
        patience: [60, 80],
        flex: [0.10, 0.25],
        insultTolerance: 0.25,        
        patienceDamageMult: 1.2,
        offerRange: { buy: [0.7, 0.9], sell: [1.1, 1.3] }, // Fair but firm
        raritySensitivity: 1.5        // Extreme valuation on rare items
    },
    regateador: {
        patience: [70, 90],
        flex: [0.20, 0.35],
        insultTolerance: 0.35,        
        patienceDamageMult: 1.0,
        offerRange: { buy: [0.4, 0.7], sell: [1.4, 1.6] }, // Standard market haggle
        raritySensitivity: 1.0
    },
    // Backwards compatibility for existing NPCs
    cliente_normal: {
        patience: [70, 90], flex: [0.20, 0.35], insultTolerance: 0.45, patienceDamageMult: 1.0,
        offerRange: { buy: [0.6, 0.8], sell: [1.4, 1.6] }, raritySensitivity: 1.0
    },
    estafador: {
        patience: [45, 65], flex: [0.0, 0.10], insultTolerance: 0.10, patienceDamageMult: 1.8,
        offerRange: { buy: [0.1, 0.2], sell: [1.8, 2.5] }, raritySensitivity: 1.0
    }
};

// Type-specific dialogue pools
export const TYPE_DIALOGUES = {
    coleccionista: {
        counter: [
            '"Hmm, para una pieza así... ¿qué tal $%PRICE%?"',
            '"Conozco el mercado. Mi oferta justa es $%PRICE%."',
            '"He visto estas piezas antes. $%PRICE% es razonable."',
            '"Para mi colección pagaría $%PRICE%, no más."'
        ],
        reject: [
            '"Eso no refleja el valor real. Sé lo que vale."',
            '"No, no. He estudiado estos precios. Es demasiado."',
            '"Paso. Ese precio no tiene sentido para esta pieza."'
        ],
        unseriousReject: [
            '"Hazme una oferta seria si de verdad quieres negociar."',
            '"Conozco el mercado. Eso es un insulto a la pieza."'
        ],
        accept: [
            '"¡Excelente pieza! ¡Trato hecho!"',
            '"Será una gran adición a mi colección."',
            '"¡Perfecto! Justo lo que buscaba."'
        ],
        walkAway: [
            '"Ya perdí la paciencia. Buscaré en otro puesto."',
            '"No vamos a llegar a un acuerdo. Adiós."'
        ],
        trait: 'Conocedor — sabe el valor real de las cosas'
    },
    turista: {
        counter: [
            '"Oh, is too much... ¿How about $%PRICE%?"',
            '"Hmm... my budget is limited. ¿$%PRICE%?"',
            '"I like it, but... ¿Puede ser $%PRICE%?"',
            '"¿$%PRICE%? Es para un souvenir, ¿no?"'
        ],
        reject: [
            '"Oh no no, too expensive for me!"',
            '"¡Qué caro! That\'s a lot of pesos..."',
            '"My guide said prices should be lower..."'
        ],
        unseriousReject: [
            '"Haha, are you joking? That is not a real price!"',
            '"I may be a tourist, but I am not crazy!"'
        ],
        accept: [
            '"¡Oh nice! Deal! ¡Gracias amigo!"',
            '"¡Perfecto! This is a great souvenir!"',
            '"¡Sí sí! I love it! ¡Trato hecho!"'
        ],
        walkAway: [
            '"I\'ll keep looking around. ¡Gracias anyway!"',
            '"Maybe I\'ll find cheaper somewhere else..."'
        ],
        trait: 'Entusiasta — disfruta la experiencia del regateo'
    },
    revendedor: {
        counter: [
            '"Mira, te ofrezco $%PRICE% y es mi última."',
            '"$%PRICE%. A ese precio sí le saco ganancia."',
            '"Nel, mejor $%PRICE%. Tengo que ganarle algo."',
            '"Te doy $%PRICE% y me lo llevo ahorita."'
        ],
        reject: [
            '"¡Estás loco! A ese precio ni de remate."',
            '"Nel carnal, eso no lo compra nadie así."',
            '"Paso. Conozco quien lo vende más barato."'
        ],
        unseriousReject: [
            '"No me hagas perder el tiempo con esas ofertas."',
            '"Si no vas a dar una oferta seria, mejor me voy."'
        ],
        accept: [
            '"¡Va! Negocio es negocio. ¡Trato hecho!"',
            '"Órale, cerramos. Dame la mano."',
            '"Sale pues. A ese precio sí jala."'
        ],
        walkAway: [
            '"Ya estuvo. Me voy a buscar otra oferta."',
            '"Ni modo, no vamos a llegar a nada."'
        ],
        trait: 'Astuto — busca la mejor relación precio-ganancia'
    },
    cliente_normal: {
        counter: [
            '"¿Y si me lo dejas en $%PRICE%?"',
            '"Hmm... ¿qué tal $%PRICE%? Eso sí puedo."',
            '"Ay, está caro. ¿En $%PRICE% no se puede?"',
            '"$%PRICE% y ya la armamos, ¿no?"'
        ],
        reject: [
            '"No, eso está muy caro para mí."',
            '"Ay no, mejor sigo viendo. Gracias."',
            '"Uy, no traigo tanto. Está fuera de mi rango."'
        ],
        unseriousReject: [
            '"¿En serio? Hazme una oferta más razonable."',
            '"Eso está demasiado lejos, ofrece bien."'
        ],
        accept: [
            '"¡Sale! Me lo llevo. ¡Gracias!"',
            '"¡Perfecto! Justo lo que buscaba."',
            '"¡Va! Buen precio, me gusta."'
        ],
        walkAway: [
            '"Mejor sigo dando la vuelta. Gracias."',
            '"No, ya no. Me voy a otro puesto."'
        ],
        trait: 'Relajado — solo busca algo que le guste'
    },
    estafador: {
        counter: [
            '"Mira, te hago el paro: $%PRICE%. Tómalo o déjalo."',
            '"$%PRICE% y ni un peso más. Es mi última."'
        ],
        reject: [
            '"¡Ja! ¿Eso es una oferta? Ni lo sueñes."',
            '"Estás perdiendo mi tiempo. Olvídalo."',
            '"¡Por favor! A mí no me vas a ver la cara."'
        ],
        unseriousReject: [
            '"¿Me viste cara de idiota? Ofréceme algo en serio."',
            '"Esas ofertas ridículas guárdatelas para otro."'
        ],
        accept: [
            '"Hmm... va. Pero me debes una, ¿eh?"',
            '"Sale pues, pero que quede claro que te hice un favor."'
        ],
        walkAway: [
            '"Ya me aburriste. Me largo."',
            '"Chido. Pero no voy a perder más tiempo."'
        ],
        trait: 'Mañoso — intenta manipular el precio a su favor'
    },
    regateador: {
        counter: [
            '"Hagamos negocio, ¿qué te parece $%PRICE%?"',
            '"No le pierdas. Te doy $%PRICE% y cerramos."',
            '"Mitad y mitad, ¿no? Que queden $%PRICE%."',
            '"Te propongo $%PRICE% para que ni tú ni yo."'
        ],
        reject: [
            '"No, hombre, así no se puede platicar."',
            '"Estás muy alto, mejor le bajamos un poco más, ¿no?"',
            '"A ese precio mejor me voy a la competencia."'
        ],
        unseriousReject: [
            '"¿Es broma? Ni de chiste vale eso."',
            '"Hazme una oferta en serio si quieres vender."'
        ],
        accept: [
            '"Eso me gusta más. ¡Trato hecho!"',
            '"Sale, me convenciste. ¡Cerramos negocio!"',
            '"Perfecto, los dos ganamos."'
        ],
        walkAway: [
            '"No, pues así no se puede. Ahí nos vemos."',
            '"Si no quieres aflojar ni modo, buena suerte."'
        ],
        trait: 'Negociador nato — no cederá su ganancia sin pelearla'
    }
};
