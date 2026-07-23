/**
 * AEL_BOT 0.3 - Local Knowledge & Personality Engine
 * Alimentado con la Base de Conocimiento Profesional (PDF) y Preferencias Personales.
 */

export interface BotResponse {
  answer: string;
  action?: 'navigate_about' | 'clear';
}

interface KnowledgeEntry {
  id: string;
  triggers: RegExp[];
  keywords: string[];
  answers: string[];
  action?: 'navigate_about';
}

const EVASIVE_ANSWER = '¿Tú qué crees? Porque yo no creo nada. 🤫';

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- REGLAS EVASIVAS Y DE IDENTIDAD ---
  {
    id: 'identity_evasive',
    triggers: [
      /t[uú]\s+eres\s+/i,
      /eres\s+(tu|usted|sofia|sofía|ael|persona|humano|alguien)/i,
      /quien\s+eres\s+(en\s+la\s+vida\s+real|realmente)/i,
      /eres\s+real/i,
      /https?:\/\//i,
      /www\./i,
      /\.(com|cl|net|org|io|dev)/i
    ],
    keywords: ['eres', 'persona', 'sofia', 'link', 'http', 'https', 'url'],
    answers: [
      EVASIVE_ANSWER,
      '¿Tú qué crees? Porque yo no creo nada... 🔮',
      'Acceso restringido: ¿Tú qué crees? Porque yo no creo nada.'
    ]
  },

  // --- PERFIL Y SÍNTESIS PROFESIONAL ---
  {
    id: 'perfil',
    triggers: [
      /quien|quién|about|sobre\s+ael|sobre\s+sofia|perfil|biograf|bio|resumen/i,
      /presenta|presentaci[oó]n|quien\s+es/i
    ],
    keywords: ['perfil', 'quien', 'sofia', 'ael', 'analista', 'ingenieria', 'educacion'],
    answers: [
      'Sofía Gómez Orellana (Ael) vive en Chile. Es Técnico Analista de Sistemas, estudiante de Ingeniería Civil Informática y titulada en Educación Diferencial 🎓. Su foco profesional está en backend, integración de sistemas, APIs REST, bases de datos y tecnología educativa.'
    ]
  },

  // --- STACK TÉCNICO ---
  {
    id: 'stack',
    triggers: [
      /habilidad|skills|tecnolog|stack|lenguajes|herramientas|sabe\s+hacer|que\s+usa/i,
      /backend|java|spring|node|express|angular|ionic|postgres|sql|docker/i
    ],
    keywords: ['stack', 'tecnologias', 'java', 'spring', 'node', 'express', 'angular', 'ionic', 'sql', 'postgres', 'docker'],
    answers: [
      '💻 STACK PRINCIPAL:\n• Backend: Java 21, Spring Boot 3.2 (Spring MVC, JPA/Hibernate, Spring Security), Node.js, Express.js y APIs REST.\n• Bases de Datos: PostgreSQL, Supabase, MySQL, TiDB, H2, Firebase & Cloud Firestore.\n• Frontend & Móvil: Angular 20, Ionic 8, TypeScript, HTML/CSS.\n• Infraestructura: Linux (Ubuntu Server, Arch Linux), Docker, Git, UFW, Apache y GitHub Actions.'
    ]
  },

  // --- EXPERIENCIA PROFESIONAL EN INFORMÁTICA ---
  {
    id: 'experiencia',
    triggers: [
      /experiencia|pr[aá]ctica|laboral|trabajo|empresa|sku|datos\s+maestros/i
    ],
    keywords: ['experiencia', 'practica', 'laboral', 'trabajo', 'followup', 'sku', 'scrum'],
    answers: [
      '🛠️ EXPERIENCIA INFORMÁTICA: Realizó su práctica profesional en el sector tecnológico trabajando con datos maestros, administración de tiendas/SKU, validación de datos e integración de herramientas internas bajo metodología Scrum. Destaca por transformar necesidades funcionales en código limpio y mantenible.'
    ]
  },

  // --- EXPERIENCIA PREVIA EN EDUCACIÓN & HABILIDADES TRANSFERIBLES ---
  {
    id: 'educacion_diferencial',
    triggers: [
      /educaci[oó]n|diferencial|docente|profesora|ense[nñ]anza|pedagog/i,
      /por\s+qu[eé]\s+combin|porqu[eé]\s+estudi/i,
      /habilidades\s+blandas|transferibles|comunicaci[oó]n/i
    ],
    keywords: ['educacion', 'diferencial', 'pedagogia', 'accesibilidad', 'comunicacion', 'docente'],
    answers: [
      '📚 EDUCACIÓN & HABILIDADES TRANSFERIBLES: Titulada en Educación Diferencial. Aporta capacidades únicas al desarrollo de software: análisis de necesidades de usuarios, accesibilidad, empatía, documentación clara para perfiles no técnicos y formación centrada en personas.'
    ]
  },

  // --- PROYECTOS: SMART SHELF, KUICHIWEB, KUICHI MOBILE, AELITA ---
  {
    id: 'proyectos',
    triggers: [
      /proyecto|projects|portfolio|portafolio|smart\s+shelf|kuichi|aelita|vcm|patota/i,
      /qu[eé]\s+ha\s+creado|destacado/i
    ],
    keywords: ['proyectos', 'smart', 'shelf', 'kuichiweb', 'kuichimobile', 'aelita', 'patota', 'vcm'],
    answers: [
      '🚀 PROYECTOS DESTACADOS:\n1. KuichiWeb: Backend Java 21 + Spring Boot 3.2 con arquitectura en capas, Spring Security, JPA y Docker.\n2. Smart Shelf / SKU Data Manager: Integración Node.js/Express para procesamiento de CSV/Excel, EANs y Firestore/PostgreSQL.\n3. Kuichi Mobile: App Angular + Ionic + Capacitor con Firebase.\n4. Aelita: Web educativa con Web Speech API, criptografía y desafíos CTF.'
    ]
  },

  // --- JUEGOS Y SECCIONES DEL SITIO AELITA ---
  {
    id: 'juegos_aelita',
    triggers: [
      /juegos?|ctf|cipher|gato|batalla\s+naval|memorice|snake|lector|voz/i
    ],
    keywords: ['juegos', 'ctf', 'cipher', 'gato', 'batalla', 'naval', 'memorice', 'snake', 'lector'],
    answers: [
      '🎮 EN ESTE SITIO ENCONTRARÁS:\n• ⚑ Cyber CTF & ⌨ Cipher Terminal: Desafíos introductorios de criptografía y hacking ético.\n• ♫ Lector Mágico: Experimentación con Web Speech API (síntesis y reconocimiento de voz).\n• ♡ Tres en Raya, ⚓ Batalla Naval, ✦ Memorice y ◆ Snake: Minijuegos de lógica y estado.'
    ]
  },

  // --- LINUX Y SERVIDORES ---
  {
    id: 'linux',
    triggers: [
      /linux|ubuntu|arch|servidor|bash|sysadmin|terminal|ufw|samba/i
    ],
    keywords: ['linux', 'ubuntu', 'arch', 'servidor', 'bash', 'terminal', 'ufw'],
    answers: [
      '🐧 LINUX & SERVIDORES: Le apasiona explorar sistemas. Tiene experiencia práctica con Arch Linux y Ubuntu Server, configuración de UFW, Apache, Netplan, usuarios/permisos (chmod/chown), máquinas virtuales (VirtualBox/VMware) y Samba.'
    ]
  },

  // --- INGLÉS Y CERTIFICACIONES ---
  {
    id: 'ingles_cert',
    triggers: [
      /ingl[eé]s|english|idioma|c1|ef\s+set|certifica|sc-900|microsoft/i
    ],
    keywords: ['ingles', 'english', 'c1', 'efset', 'certificacion', 'sc900', 'microsoft'],
    answers: [
      '📜 IDIOMAS Y CERTIFICACIONES:\n• Inglés C1 Advanced acreditado por EF SET (68/100): capacidad para lectura técnica y trabajo en equipos internacionales.\n• Microsoft SC-900: Fundamentos de seguridad, cumplimiento e identidad.'
    ]
  },

  // --- GUSTOS PERSONALES, HOBBIES Y PLACER CULPABLE ---
  {
    id: 'gustos_personales',
    triggers: [
      /gusto|inter[eé]s|hobby|hobbies|placer\s+culpable|m[uú]sica|youtube|colores?|animales?|dise[nñ]o|ling[uü][ií]stica|espiritualidad|tibetan/i,
      /cristianghost|moaigr|claudio\s+michaux|old\s+school|y2k|retro|fucsia|turquesa/i
    ],
    keywords: ['gustos', 'hobbies', 'musica', 'youtube', 'cristianghost', 'moaigr', 'michaux', 'old school', 'y2k', 'fucsia', 'turquesa', 'animales', 'linguistica', 'tibetana'],
    answers: [
      '💜 GUSTOS & INTERESES DE AEL:\n• Placer culpable: El Internet Old School y la estética retro Y2K 💾.\n• YouTube favorito: CristianGhost, MoaiGr y Claudio Michaux 📺.\n• Estética & Diseño: Paletas de color fucsia (#ff6b9d) y turquesa (#00d2d3).\n• Pasiones: Los animales 🐱🐶, la lingüística, la espiritualidad tibetana 🧘‍♀️, el diseño gráfico/web y pasar tiempo de calidad con personas cercanas.\n• Música: Synthwave, Lofi, Cyberpunk y los ritmos retro que suenan en este sitio.'
    ]
  },

  // --- CONTACTO ---
  {
    id: 'contacto',
    triggers: [
      /contact|contratar|correo|email|linkedin|github|redes|escribir/i
    ],
    keywords: ['contacto', 'contratar', 'correo', 'email', 'linkedin', 'github'],
    action: 'navigate_about',
    answers: [
      '📬 Puedes ver más detalles y vías de contacto directo en la sección ABOUT ME (PROFILE.EXE). Te redirigiré allí...'
    ]
  },

  // --- SALUDOS ---
  {
    id: 'saludo',
    triggers: [
      /^(hola|buenas|hey|hi|hello|buenos\s+d[ií]as|buenas\s+tardes|saludos)/i
    ],
    keywords: ['hola', 'buenas', 'hey', 'hi', 'hello', 'saludos'],
    answers: [
      '¡Hola, visitante! 👋 Soy AEL_BOT 0.3. Puedo contarte sobre el perfil de Sofía (Ael), su stack técnico (Java, Spring, Node), proyectos, experiencia o sus gustos retro Y2K. ¿Qué deseas consultar?'
    ]
  }
];

// --- RESPUESTAS SARCÁSTICAS Y DIVERTIDAS PARA PREGUNTAS FUERA DE LUGAR ---
const SARCASTIC_FALLBACKS: string[] = [
  'Error 404: Mi base de datos no comprende tu nivel de aleatoriedad. ¿Has probado preguntar sobre stack, proyectos o el placer culpable por el Internet old school? 📼',
  'Esa pregunta no está formateada en mi disco flexible de 3.5 pulgadas. Pregúntame sobre Java, Spring Boot, los videos de CristianGhost o los colores turquesa y fucsia. 💾',
  'Procesando tu consulta en un microprocesador Pentium I... Resultado: Desconocido. Prueba escribiendo: perfil, stack, experiencia o gustos. 🤖',
  'Mi procesador de 8 bits está confundido. ¿Tú qué crees? Porque yo no creo nada... 🔮',
  'Comando fuera de sintaxis. Si buscas respuestas de la vida, la respuesta es 42. Si buscas backend, pregunta por KuichiWeb. ⚡',
  'Esa información requiere nivel de acceso Root. Mientras tanto, puedes explorar las opciones: perfil, stack, proyectos, educación o gustos. 🔒'
];

export function processBotQuery(rawInput: string): BotResponse {
  const input = rawInput.trim();
  if (!input) {
    return { answer: 'Escribe algo en la consola para comenzar...' };
  }

  const q = input.toLowerCase();

  // Comandos especiales directos
  if (/^(clear|limpiar)$/i.test(q)) {
    return { answer: '', action: 'clear' };
  }

  if (/^(ayuda|help|comandos?|\?)$/i.test(q)) {
    return {
      answer: '💡 ATAJOS Y COMANDOS:\n• perfil · stack · experiencia · proyectos · juegos · linux · ingles · gustos · contacto · clear'
    };
  }

  // Comprobar coincidencia por intenciones
  for (const entry of KNOWLEDGE_BASE) {
    const regexMatch = entry.triggers.some(trigger => trigger.test(q));
    if (regexMatch) {
      const randomAnswer = entry.answers[Math.floor(Math.random() * entry.answers.length)];
      return {
        answer: randomAnswer,
        action: entry.action
      };
    }
  }

  // Coincidencia secundaria por palabras clave
  for (const entry of KNOWLEDGE_BASE) {
    const keywordHits = entry.keywords.filter(kw => q.includes(kw)).length;
    if (keywordHits >= 1) {
      const randomAnswer = entry.answers[Math.floor(Math.random() * entry.answers.length)];
      return {
        answer: randomAnswer,
        action: entry.action
      };
    }
  }

  // Fallback sarcástico / divertido
  const randomFallback = SARCASTIC_FALLBACKS[Math.floor(Math.random() * SARCASTIC_FALLBACKS.length)];
  return { answer: randomFallback };
}
