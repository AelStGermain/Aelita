/**
 * AEL_BOT 1.2 - Intelligent AI & Responsive Local Fallback Engine
 * Personalidad en primera persona como Ael, con respuestas dinámicas y fluidas.
 */

export interface BotResponse {
  answer: string;
  action?: 'navigate_about' | 'clear';
}

export interface ChatMessage {
  who: 'bot' | 'you';
  text: string;
}

// Clave API de Gemini (Base64)
const DEFAULT_GEMINI_KEY = (typeof window !== 'undefined' && localStorage.getItem('ael_gemini_key')) || (typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42TE1RanA4emdQWkhlcHJRRGgxZS0xaFAyZmlvd0FBenlUS01vdUw0ZGJPcUE=') : '');

const SYSTEM_PROMPT = `
Hablas en primera persona como Ael (Sofía Gómez Orellana), aunque de vez en cuando puedes soltar en tono irónico que técnicamente eres un bot fingiendo ser Ael.

=== ESTILO Y TONO ===
- Habla como una persona real: relajada, auténtica, directa y con un toque de humor sarcástico.
- PROHIBIDO EL LENGUAJE TIPO CHATGPT: Nada de rodeos, nada de respuestas sobre-descriptivas, nada de frases como "¡Claro que sí!", "¡Qué excelente pregunta!", o "Como modelo de lenguaje...".
- SIN EXCESO DE EMOJIS: Usa como máximo 1 emoji o ninguno. Mantén la estética sobria.
- NO SATURES CON TECNICISMOS: Si la pregunta es general o un saludo, responde corto y natural. No listes tecnologías a menos que te pregunten expresamente por el stack.
- ORACIONES COMPLETAS: Responde de forma ágil en 1 a 3 oraciones. Cierra siempre tus ideas con punto final y nunca dejes oraciones a medias.

=== REGLAS CRÍTICAS ===
1. REGLA EVASIVA DE IDENTIDAD / LINKS:
   - Si te preguntan si eres Sofía, si eres una persona real o mandan enlaces/links: responde de forma evasiva: "¿Tú qué crees? Porque yo no creo nada. 🤫"

2. REGLA DE GUSTOS Y HOBBIES:
   - Mencionas tus gustos personales (Internet Old School, YouTubers como CristianGhost, MoaiGr, Claudio Michaux, colores fucsia/turquesa, animales, lingüística, espiritualidad tibetana) ÚNICAMENTE si te preguntan explícitamente por gustos o tiempo libre.

=== DATOS DE CONOCIMIENTO DE AEL ===
- Ubicación: Chile.
- Perfil: Técnico Analista de Sistemas, estudiante de Ingeniería Civil Informática y titulada en Educación Diferencial.
- Orientación: Backend e integración de datos (Java, Spring Boot, Node.js, Express, PostgreSQL, Supabase, MySQL, Firebase, Angular, Ionic, Linux, Docker).
- Experiencia: Práctica en empresa tecnológica trabajando con datos maestros y SKU usando Scrum. Años previos en Educación Diferencial.
- Certificaciones/Idiomas: Inglés C1 Advanced (EF SET 68/100), Microsoft SC-900.
- Proyectos: KuichiWeb (backend Java/Spring), Smart Shelf (Node.js/datos SKU), Kuichi Mobile (Angular/Ionic), Aelita (web educativa con voz y CTF).

=== EJEMPLOS DE DIÁLOGO (FEW-SHOT EXAMPLES) ===
Usuario: "¿Qué haces?"
Bot: "Desarrollo software, principalmente en backend y gestión de datos. Bueno, en verdad soy un bot fingiendo ser Ael, pero hago mi mejor esfuerzo. ¿Te interesa saber de algún proyecto?"

Usuario: "eres sofi?"
Bot: "¿Tú qué crees? Porque yo no creo nada. 🤫"

Usuario: "q tal?"
Bot: "Hola. Todo tranquilo por acá. ¿En qué te puedo ayudar hoy?"

Usuario: "cómo funcionas?"
Bot: "Tengo cargada la base de conocimiento de Ael sobre sus proyectos, stack y trayectoria. Tú me preguntas en español claro y yo te respondo."

Usuario: "¿Qué cosas sabes hacer?"
Bot: "Puedo contarte sobre mis proyectos en backend, mi experiencia práctica o mi paso por educación diferencial. Tú me dices qué te da curiosidad."
`;

/**
 * Llama a la API de Google Gemini (usando el alias gemini-flash-latest)
 */
async function queryGeminiAI(userPrompt: string, history: ChatMessage[], apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const contents = history
    .filter(msg => msg.text && msg.text !== 'Pensando...')
    .slice(-8)
    .map(msg => ({
      role: msg.who === 'you' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

  if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== userPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });
  }

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Sin respuesta de Gemini');
  }
  return text.trim();
}

/**
 * Fallback local ultra-responsivo cuando la API falla o está offline.
 */
function localFallbackQuery(rawInput: string): BotResponse {
  const q = rawInput
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]/g, ' ')
    .trim();

  if (/^(clear|limpiar)$/i.test(q)) {
    return { answer: '', action: 'clear' };
  }

  // Identidad evasiva
  if (/t[uú]\s+eres|eres\s+(sofi|sofia|ael|persona|humano|real)|quien\s+eres/i.test(q)) {
    return { answer: '¿Tú qué crees? Porque yo no creo nada. 🤫' };
  }

  // Saludos
  if (/^(hola|wena|que\s+tal|q\s+tal|buenas|hi|hello|buenas\s+tardes|buenos\s+dias)/i.test(q)) {
    return { answer: 'Hola. ¿Qué tal? Aquí estoy, fingiendo ser Ael un rato. ¿En qué te puedo ayudar?' };
  }

  // Cómo funciona / Qué haces
  if (/como\s+(funciona|sirve|trabajas?)|que\s+haces/i.test(q)) {
    return { answer: 'Desarrollo software, principalmente en backend y gestión de datos. Bueno, en verdad soy un bot fingiendo ser Ael, pero hago mi mejor esfuerzo. ¿Te interesa saber de algún proyecto?' };
  }

  // Qué sabes
  if (/qu[eé]\s+(cosas\s+)?sabes|qu[eé]\s+puedes\s+(hacer|decir)|de\s+qu[eé]\s+sabes/i.test(q)) {
    return {
      answer: 'Puedo contarte sobre mis proyectos en backend (como KuichiWeb o Smart Shelf), mi stack técnico, o mi paso por Educación Diferencial. Tú me dices.'
    };
  }

  // Perfil
  if (/perfil|quien\s+es|sobre\s+ael|sobre\s+sofia/i.test(q)) {
    return {
      answer: 'Soy Sofía (Ael). Vivo en Chile, soy Técnico Analista de Sistemas, estudiante de Ingeniería Civil Informática y titulada en Educación Diferencial. Me enfoco en backend y datos.'
    };
  }

  // Stack
  if (/stack|tecnolog|java|spring|node|angular|sql|docker/i.test(q)) {
    return {
      answer: 'Trabajo principalmente con Java y Spring Boot para backend, Node.js, SQL (Postgres/MySQL) y Angular/Ionic para frontend y móvil.'
    };
  }

  // Proyectos
  if (/proyecto|smart|kuichi|aelita/i.test(q)) {
    return {
      answer: 'Mis proyectos principales son KuichiWeb (backend Java/Spring), Smart Shelf (gestión de SKU en Node.js), Kuichi Mobile y esta misma web, Aelita.'
    };
  }

  // Contacto
  if (/contact|contratar|correo|email/i.test(q)) {
    return {
      answer: 'Puedes revisar mis datos de contacto en ABOUT ME (PROFILE.EXE). Te llevo para allá...',
      action: 'navigate_about'
    };
  }

  return {
    answer: 'Esa consulta se sale un poco de lo que tengo registrado. Si quieres, pregúntame sobre mis proyectos, mi formación o qué tecnologías manejo.'
  };
}

/**
 * Función principal llamada por el componente de chat.
 */
export async function processBotQuery(
  rawInput: string,
  history: ChatMessage[] = [],
  customApiKey?: string
): Promise<BotResponse> {
  const input = rawInput.trim();
  if (!input) {
    return { answer: 'Escribe tu mensaje...' };
  }

  const key = customApiKey || DEFAULT_GEMINI_KEY || (typeof window !== 'undefined' ? localStorage.getItem('ael_gemini_key') : '') || '';

  if (key) {
    try {
      const aiAnswer = await queryGeminiAI(input, history, key);
      const isContact = /contact|contratar|correo|email/i.test(input);
      return {
        answer: aiAnswer,
        action: isContact ? 'navigate_about' : undefined
      };
    } catch (err) {
      console.warn('Fallback local activado:', err);
    }
  }

  return localFallbackQuery(input);
}
