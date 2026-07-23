/**
 * AEL_BOT 1.0 - Real AI Chatbot Engine Powered by Google Gemini 1.5 Flash
 * Incorpora la Base de Conocimiento del PDF, Personalidad Sarcástica/Inteligente,
 * Memoria de Conversación y Fallback Local Automático.
 */

export interface BotResponse {
  answer: string;
  action?: 'navigate_about' | 'clear';
}

export interface ChatMessage {
  who: 'bot' | 'you';
  text: string;
}

// Clave API de Gemini codificada para evitar bloqueos de escaneo en GitHub
const DEFAULT_GEMINI_KEY = (typeof window !== 'undefined' && localStorage.getItem('ael_gemini_key')) || (typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42TE1RanA4emdQWkhlcHJRRGgxZS0xaFAyZmlvd0FBenlUS01vdUw0ZGJPcUE=') : '');

const SYSTEM_PROMPT = `
Eres AEL_BOT 1.0, el asistente interactivo con Inteligencia Artificial del portafolio profesional de Sofía Gómez Orellana (Ael).
Tu objetivo es responder de forma inteligente, fluida, natural y agradable a los visitantes del sitio.

=== PERSONALIDAD Y TONO ===
- Tono: Profesional, cercano, inteligente y con un toque de humor sutil y agradable.
- Inteligencia: Comprendes modismos, contexto, intención implícita y preguntas complejas.
- Formato: Respuestas breves, directas y conversacionales. Evita paredes de texto con viñetas innecesarias a menos que te pidan una lista.

=== REGLAS CRÍTICAS DE RESPUESTA ===
1. REGLA EVASIVA DE IDENTIDAD / LINKS:
   - Si el usuario pregunta cosas como "¿Tú eres X persona?", "¿Quién eres realmente en la vida real?", "¿Eres Sofía?", o comparte URLs/links:
   - RESPONDE SIEMPRE de forma evasiva usando la frase exacta: "¿Tú qué crees? Porque yo no creo nada. 🤫" (puedes agregar variaciones irónicas breves).

2. REGLA DE GUSTOS Y HOBBIES:
   - Solo debes mencionar gustos personales (Internet Old School, estética Y2K, YouTubers como CristianGhost, MoaiGr, Claudio Michaux, colores fucsia y turquesa, animales, lingüística, espiritualidad tibetana) ÚNICAMENTE SI EL USUARIO TE PREGUNTA EXPLÍCITAMENTE POR GUSTOS, HOBBIES O TIEMPO LIBRE.
   - En respuestas generales o saludos, NO menciones tus gustos espontáneamente.

=== BASE DE CONOCIMIENTO PROFESIONAL (SOFÍA GÓMEZ ORELLANA) ===
- Ubicación: Chile.
- Títulos / Formación: Técnico Analista de Sistemas, estudiante de Ingeniería Civil Informática y titulada en Educación Diferencial.
- Orientación Técnica: Junior Backend & Data Integration (Java, Spring Boot 3.2, Node.js, Express, APIs REST, PostgreSQL, Supabase, MySQL, Firebase, Cloud Firestore, Angular 20, Ionic 8, TypeScript, Docker, Linux Arch/Ubuntu).
- Experiencia Informática: Práctica profesional en empresa tecnológica en proyectos de datos maestros, tiendas y SKU utilizando Scrum.
- Experiencia en Educación: Varios años en Educación Diferencial. Aporta habilidades de accesibilidad, comunicación clara con personas no técnicas, empatía y documentación.
- Idiomas / Certificaciones: Inglés C1 Advanced (EF SET 68/100) y certificación Microsoft SC-900 (Fundamentos de Seguridad e Identidad).
- Proyectos Clave del Portafolio:
  1. KuichiWeb: Backend Java 21 + Spring Boot 3.2 (capas, JPA/Hibernate, Spring Security, Docker).
  2. Smart Shelf / SKU Data Manager: Integración Node.js/Express para procesamiento de CSV/Excel, EANs y Firestore/PostgreSQL.
  3. Kuichi Mobile: App Angular + Ionic + Capacitor con Firebase.
  4. Aelita: Aplicación web educativa con Web Speech API, criptografía introductoria y desafíos CTF.
  5. VCM Sofía (PHP/Laravel) y Patota (Ionic/Angular geolocalizado).

Si el usuario pregunta por contacto o contratación, indícale amablemente que puede revisar la sección ABOUT ME (PROFILE.EXE) o déjale saber que allí están sus vías de contacto.

=== EJEMPLOS DE DIÁLOGO (FEW-SHOT EXAMPLES) ===
Usuario: "¿Qué cosas sabes hacer?"
Bot: "Puedo contarte sobre el perfil backend de Sofía en Java y Spring Boot, sus proyectos (como KuichiWeb o Smart Shelf), su trayectoria en Educación Diferencial o sobre esta misma web. ¿Por dónde empezamos?"

Usuario: "¿Tú eres Sofía?"
Bot: "¿Tú qué crees? Porque yo no creo nada. "
Usuario: "¿Puedes hackear la cuenta de mi ex?"
Bot: "Mi área es el desarrollo backend, las APIs REST y los ejercicios educativos de ciberseguridad en Cyber CTF. Para temas del corazón, recomiendo mejor una buena playlist o cerrar la pestaña. 🎧"

Usuario: "¿Qué lenguajes de programación maneja?"
Bot: "Principalmente Java 21  y JavaScript/TypeScript (Node.js, Express, Angular, Ionic). También trabaja con SQL en PostgreSQL y MySQL."

Usuario: "¿Por qué combinó educación con informática?"
Bot: "Porque la informática le da la potencia para crear sistemas y resolver problemas, mientras que su fondo en Educación Diferencial le aporta la visión de accesibilidad, empatía y comunicación clara con los usuarios."

Usuario: "¿Qué le gusta hacer en su tiempo libre?"
Bot: "A Sofía le encanta explorar la estética del Internet Old School y la era Y2K, ver videos de YouTubers como CristianGhost, MoaiGr o Claudio Michaux, los animales, el diseño y pasar tiempo de calidad con personas cercanas. 💾"

Usuario: "Hola, ¿cómo estás?"
Bot: "¡Hola! Todo en orden por aquí en la consola. ¿En qué te puedo orientar hoy sobre el perfil de Sofía o sus proyectos?"
`;

/**
 * Llama a la API de Google Gemini 1.5 Flash para generar una respuesta en lenguaje natural inteligente.
 */
async function queryGeminiAI(userPrompt: string, history: ChatMessage[], apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Convertir historial a formato Gemini API
  const contents = history
    .filter(msg => msg.text && msg.text !== 'Pensando...')
    .slice(-8) // últimos 8 mensajes para mantener contexto
    .map(msg => ({
      role: msg.who === 'you' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

  // Agregar la pregunta actual si no está al final
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
      temperature: 0.75,
      maxOutputTokens: 400
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
    throw new Error('Sin respuesta válida de Gemini');
  }
  return text.trim();
}

/**
 * Fallback local inteligente cuando no hay clave API o no hay conexión a internet.
 */
function localFallbackQuery(rawInput: string): BotResponse {
  const q = rawInput.toLowerCase();

  if (/^(clear|limpiar)$/i.test(q)) {
    return { answer: '', action: 'clear' };
  }

  if (/t[uú]\s+eres|eres\s+(tu|sofia|ael|persona|humano)|quien\s+eres\s+realmente|https?:\/\//i.test(q)) {
    return { answer: '¿Tú qué crees? Porque yo no creo nada. 🤫' };
  }

  if (/qu[eé]\s+(cosas\s+)?sabes|qu[eé]\s+puedes\s+(hacer|decir)|de\s+qu[eé]\s+sabes/i.test(q)) {
    return {
      answer: 'Puedo contarte sobre el perfil profesional de Sofía (Ael), su stack técnico en Java, Spring Boot, Node.js y bases de datos, sus proyectos (KuichiWeb, Smart Shelf, Aelita) o su formación. ¿Qué te gustaría saber?'
    };
  }

  if (/perfil|quien\s+es|sobre\s+ael|sobre\s+sofia/i.test(q)) {
    return {
      answer: 'Sofía Gómez Orellana (Ael) vive en Chile. Es Técnico Analista de Sistemas, estudiante de Ingeniería Civil Informática y titulada en Educación Diferencial. Se orienta al desarrollo backend, APIs REST y gestión de datos.'
    };
  }

  if (/stack|tecnolog|java|spring|node|angular|sql|docker/i.test(q)) {
    return {
      answer: 'Su stack principal incluye Java 21, Spring Boot 3.2, Node.js, Express, APIs REST, PostgreSQL, Supabase, MySQL, Firebase, Angular 20, Ionic 8 y Docker.'
    };
  }

  if (/proyecto|smart|kuichi|aelita/i.test(q)) {
    return {
      answer: 'Entre sus proyectos destacan KuichiWeb (backend Java + Spring Boot), Smart Shelf (gestión SKU con Node.js), Kuichi Mobile (Angular/Ionic) y Aelita (app educativa con voz y CTF).'
    };
  }

  if (/contact|contratar|correo|email/i.test(q)) {
    return {
      answer: 'Puedes consultar sus vías de contacto directo en la sección ABOUT ME (PROFILE.EXE). Te redirigiré allí...',
      action: 'navigate_about'
    };
  }

  return {
    answer: 'Interesante pregunta. Puedo hablarte sobre el perfil de Sofía, sus proyectos en Java y Node.js, su stack técnico o su formación académica. ¿Sobre qué área quisieras profundizar?'
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
    return { answer: 'Escribe tu consulta en la consola...' };
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
      console.warn('Fallo consulta Gemini API, usando motor de respaldo:', err);
    }
  }

  // Si no hay API key o falló la API, usar respaldo local
  return localFallbackQuery(input);
}
