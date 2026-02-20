/**
 * dictionaries.js
 * Word lists keyed by locale (en-US / es-ES).
 *
 * COUPLED APPROACH: Each locale bundles BOTH language AND keyboard layout:
 *   - "en-US" → English words + QWERTY US (ANSI) layout
 *   - "es-ES" → Spanish words + QWERTY Spanish (ISO) layout
 *
 * DESIGN RULES
 * - newKeys lists ONLY the newly introduced keys per level.
 *   Cumulative pool = union of newKeys from levels 1..N.
 * - ALL words/drills at every tier use ONLY the cumulative key pool.
 *   No exceptions. Verified character-by-character.
 * - 20 levels: gradual progression from home-row anchors to full keyboard.
 * - Levels 1-10: letters only (home row + top row), short words
 * - Levels 11-15: bottom row, introduced gradually with short/medium words
 * - Levels 16-18: punctuation and longer phrases
 * - Levels 19-20: numbers and full review with longer sentences
 */

// ── UI Localization Strings ──────────────────────────────
const UI_STRINGS = {
  "en-US": {
    title: "NEON STREAM",
    subtitle: "TYPING HACKER",
    selectAlias: "SELECT YOUR HACKER ALIAS",
      createNew: "+ CREATE NEW HACKER",
      maxProfiles: "Maximum 5 profiles reached. Delete one to create a new profile.",
      navSelect: "[↑/↓] Navigate   [ENTER] Select   [DEL] Delete Profile",
    selectMission: "SELECT MISSION",
    navMission: "[←/→/↑/↓] Navigate   [ENTER] Start   [ESC] Back",
    level: "LEVEL",
    score: "SCORE",
    wpm: "WPM",
    acc: "ACC",
    systemIntegrity: "SYSTEM INTEGRITY",
    paused: "PAUSED",
    pauseContinue: "CONTINUE",
    pauseQuit: "QUIT TO MENU",
    pauseNav: "[↑/↓] Select   [ENTER/ESC] Confirm",
    missionComplete: "MISSION COMPLETE",
    continue: "CONTINUE",
    retry: "RETRY",
    completeNav: "[ENTER] Continue   [R] Retry",
    systemBreach: "SYSTEM BREACH",
    missionFailed: "System integrity lost. Mission failed.",
    menu: "MENU",
    gameOverNav: "[R] Retry   [ESC] Back to Menu",
    newKeys: "New keys",
    teacherNav: "[SPACE] Skip   [ESC] Back",
    createAlias: "CREATE HACKER ALIAS",
    alias: "Alias",
    aliasPlaceholder: "Enter your hacker name...",
    langKeyboard: "Language & Keyboard",
      create: "CREATE",
      cancel: "CANCEL",
      duplicateAlias: "\"{alias}\" already exists. Choose a different name.",
      godModeEnabled: "GOD MODE ENABLED",
      optionEN: "English (US Keyboard)",
      optionES: "Español (Teclado ES)",
  },
  "es-ES": {
    title: "NEON STREAM",
    subtitle: "TYPING HACKER",
    selectAlias: "SELECCIONA TU ALIAS HACKER",
      createNew: "+ CREAR NUEVO HACKER",
      maxProfiles: "Has alcanzado el máximo de 5 perfiles. Borra uno para crear otro.",
      navSelect: "[↑/↓] Navegar   [ENTER] Seleccionar   [SUPR] Borrar perfil",
    selectMission: "SELECCIONAR MISIÓN",
    navMission: "[←/→/↑/↓] Navegar   [ENTER] Iniciar   [ESC] Volver",
    level: "NIVEL",
    score: "PUNTOS",
    wpm: "PPM",
    acc: "PREC",
    systemIntegrity: "INTEGRIDAD DEL SISTEMA",
    paused: "PAUSA",
    pauseContinue: "CONTINUAR",
    pauseQuit: "SALIR AL MENÚ",
    pauseNav: "[↑/↓] Seleccionar   [ENTER/ESC] Confirmar",
    missionComplete: "MISIÓN COMPLETADA",
    continue: "CONTINUAR",
    retry: "REINTENTAR",
    completeNav: "[ENTER] Continuar   [R] Reintentar",
    systemBreach: "BRECHA EN EL SISTEMA",
    missionFailed: "Integridad perdida. Misión fallida.",
    menu: "MENÚ",
    gameOverNav: "[R] Reintentar   [ESC] Volver al menú",
    newKeys: "Teclas nuevas",
    teacherNav: "[ESPACIO] Saltar   [ESC] Volver",
    createAlias: "CREAR ALIAS HACKER",
    alias: "Alias",
    aliasPlaceholder: "Introduce tu nombre hacker...",
    langKeyboard: "Idioma y teclado",
      create: "CREAR",
      cancel: "CANCELAR",
      duplicateAlias: "\"{alias}\" ya existe. Elige un nombre diferente.",
      godModeEnabled: "MODO DIOS ACTIVADO",
      optionEN: "English (US Keyboard)",
      optionES: "Español (Teclado ES)",
  }
};

/** Detect system locale, defaulting to es-ES if Spanish */
function getSystemLocale() {
  const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  return lang.startsWith("es") ? "es-ES" : "en-US";
}

/** Get UI strings for a locale */
function getUIStrings(locale) {
  return UI_STRINGS[locale] || UI_STRINGS["en-US"];
}

const DICTIONARIES = {

  // ═══════════════════════════════════════════════════════════
  //  ENGLISH (US)
  // ═══════════════════════════════════════════════════════════
  "en-US": {
    layoutId: "qwerty-us",
    levels: [

      // ── 1 : Home Row Anchors ──
      // Cumulative: f j [space]
      {
        id: 1,
        name: "Home Row Anchors",
        newKeys: ["f", "j", " "],
        drills: ["f", "j", "ff", "jj", "fj", "jf"],
        words: {
          easy:   ["f", "j", "ff", "jj"],
          medium: ["fjf", "jfj", "ffj", "jjf"],
          hard:   ["fj fj", "jf jf", "ff jj"]
        }
      },

      // ── 2 : Inner Home Row ──
      // Cumulative: f j d k [space]
      {
        id: 2,
        name: "Inner Home Row",
        newKeys: ["d", "k"],
        drills: ["d", "k", "dd", "kk", "dk", "kd", "fd", "jk"],
        words: {
          easy:   ["dd", "kk", "fd", "jk", "dk"],
          medium: ["fdk", "jkf", "dkf", "kjd"],
          hard:   ["fd jk fd", "dk dk fj"]
        }
      },

      // ── 3 : Outer Home Row ──
      // Cumulative: f j d k s l [space]
      {
        id: 3,
        name: "Outer Home Row",
        newKeys: ["s", "l"],
        drills: ["s", "l", "ss", "ll", "sl", "ls", "sd", "lk"],
        words: {
          easy:   ["sdk", "lsd", "sdf", "lkj"],
          medium: ["flds", "skld", "sldf", "jkls"],
          hard:   ["sl dk sl", "fd lk sd"]
        }
      },

      // ── 4 : Home Row Pinkies ──
      // Cumulative: f j d k s l a ; [space]
      {
        id: 4,
        name: "Home Row Pinkies",
        newKeys: ["a", ";"],
        drills: ["a", ";", "aa", ";;", "a;", ";a", "as", "la"],
        words: {
          easy:   ["ads", "ask", "all", "add", "sad", "dad", "lad"],
          medium: ["salad", "flask", "falls", "lass"],
          hard:   ["a sad lad", "dad asks all"]
        }
      },

      // ── 5 : Home Row Complete ──
      // Cumulative: f j d k s l a ; g h [space]
      {
        id: 5,
        name: "Home Row Complete",
        newKeys: ["g", "h"],
        drills: ["g", "h", "gh", "hg", "fg", "hj", "gf", "jh"],
        words: {
          easy:   ["had", "has", "gag", "ash", "half", "glad", "hash"],
          medium: ["flash", "shall", "glass", "slash", "gash"],
          hard:   ["a glad lad has", "half a glass"]
        }
      },

      // ── 6 : Top Row — Middle Fingers ──
      // Cumulative: + e i
      {
        id: 6,
        name: "Top Row — Middle Fingers",
        newKeys: ["e", "i"],
        drills: ["e", "i", "ee", "ii", "ei", "ie", "de", "ki"],
        words: {
          easy:   ["die", "lie", "dig", "fig", "his", "she", "hide"],
          medium: ["field", "slide", "ideal", "shelf"],
          hard:   ["she hides his", "a field lies ahead"]
        }
      },

      // ── 7 : Top Row — Index Fingers ──
      // Cumulative: + r u
      {
        id: 7,
        name: "Top Row — Index Fingers",
        newKeys: ["r", "u"],
        drills: ["r", "u", "rr", "uu", "ru", "ur", "fr", "ju"],
        words: {
          easy:   ["ride", "rude", "sure", "fire", "rule", "rush"],
          medium: ["figure", "ridge", "sailed", "raised"],
          hard:   ["a sure ride", "he figured rules"]
        }
      },

      // ── 8 : Top Row — Index Reach ──
      // Cumulative: + t y
      {
        id: 8,
        name: "Top Row — Index Reach",
        newKeys: ["t", "y"],
        drills: ["t", "y", "tt", "yy", "ty", "yt", "tr", "yu"],
        words: {
          easy:   ["the", "yet", "they", "this", "that", "try", "style"],
          medium: ["thirty", "thirsty", "reality", "dusty"],
          hard:   ["they tried thirty", "dusty reality set"]
        }
      },

      // ── 9 : Top Row — Ring Fingers ──
      // Cumulative: + w o
      {
        id: 9,
        name: "Top Row — Ring Fingers",
        newKeys: ["w", "o"],
        drills: ["w", "o", "ww", "oo", "wo", "ow", "ws", "ol"],
        words: {
          easy:   ["flow", "show", "wood", "work", "word", "wrote"],
          medium: ["follow", "shadow", "growth", "flowers"],
          hard:   ["our world flows", "she follows wood"]
        }
      },

      // ── 10 : Top Row — Pinkies ──
      // Cumulative: + q p
      {
        id: 10,
        name: "Top Row — Pinkies",
        newKeys: ["q", "p"],
        drills: ["q", "p", "qq", "pp", "qp", "pq", "qu", "pa"],
        words: {
          easy:   ["quip", "put", "port", "proud", "quest", "equal"],
          medium: ["quarter", "quality", "topside", "request"],
          hard:   ["a proud quest", "quality equals power"]
        }
      },

      // ── 11 : Bottom Row — c ──
      // Cumulative: + c
      {
        id: 11,
        name: "Bottom Row — c",
        newKeys: ["c"],
        drills: ["c", "cc", "cd", "ck", "sc", "cl"],
        words: {
          easy:   ["cut", "such", "clue", "cold", "each", "curl"],
          medium: ["occurs", "direct", "pictures", "select"],
          hard:   ["such cold pictures", "direct the circle"]
        }
      },

      // ── 12 : Bottom Row — comma ──
      // Cumulative: + ,
      {
        id: 12,
        name: "Bottom Row — comma",
        newKeys: [","],
        drills: [",", "c,", ",c", "d,", ",s"],
        words: {
          easy:   ["hi, cut", "yes, go", "top, for"],
          medium: ["slow, we drift", "work, focus"],
          hard:   ["west, east, cold, hot", "quote, reply, scroll"]
        }
      },

      // ── 13 : Bottom Row — v m ──
      // Cumulative: + v m
      {
        id: 13,
        name: "Bottom Row — v m",
        newKeys: ["v", "m"],
        drills: ["v", "m", "vv", "mm", "vm", "mv", "fv", "jm"],
        words: {
          easy:   ["move", "live", "must", "came", "vim", "hive"],
          medium: ["remove", "improve", "custom", "product"],
          hard:   ["improve every move", "vim must work"]
        }
      },

      // ── 14 : Bottom Row — x period ──
      // Cumulative: + x .
      {
        id: 14,
        name: "Bottom Row — x period",
        newKeys: ["x", "."],
        drills: ["x", ".", "xx", "..", "x.", ".x", "sx", "l."],
        words: {
          easy:   ["fox", "mix", "fix", "text", "exit", "pixel"],
          medium: ["complex", "explore", "extreme"],
          hard:   ["fix the complex exit.", "explore the mix."]
        }
      },

      // ── 15 : Bottom Row — b n ──
      // Cumulative: + b n
      {
        id: 15,
        name: "Bottom Row — b n",
        newKeys: ["b", "n"],
        drills: ["b", "n", "bb", "nn", "bn", "nb", "fb", "jn"],
        words: {
          easy:   ["born", "bone", "bent", "next", "been", "never"],
          medium: ["broken", "number", "button", "benign"],
          hard:   ["the next number", "never been broken"]
        }
      },

      // ── 16 : Bottom Row — z ──
      // Cumulative: + z
      {
        id: 16,
        name: "Bottom Row — z",
        newKeys: ["z"],
        drills: ["z", "zz", "za", "ze", "zi", "zo", "zu"],
        words: {
          easy:   ["zone", "zero", "buzz", "size", "quiz", "dozen"],
          medium: ["frozen", "citizen", "horizon", "realize"],
          hard:   ["the frozen zone", "citizens realize"]
        }
      },

      // ── 17 : Bottom Row — slash ──
      // Cumulative: + /
      {
        id: 17,
        name: "Slash Key",
        newKeys: ["/"],
        drills: ["/", "//", "a/", "/b"],
        words: {
          easy:   ["yes/no", "on/off", "in/out", "up/down"],
          medium: ["left/right", "open/close", "win/lose"],
          hard:   ["push/pull, on/off.", "win/lose, zero/one."]
        }
      },

      // ── 18 : Consolidation ──
      // Cumulative: all letters + , . ; / [space]
      {
        id: 18,
        name: "Full Letters Review",
        newKeys: [],
        drills: ["the", "quick", "fox", "jumps", "over"],
        words: {
          easy:   ["strong", "behind", "except", "frozen", "liquid"],
          medium: ["vertical", "explored", "combined", "junction"],
          hard:   ["the quick fox jumps.", "we explored the frozen zone."]
        }
      },

      // ── 19 : Number Row ──
      // Cumulative: + 1 2 3 4 5 6 7 8 9 0
      {
        id: 19,
        name: "Number Row",
        newKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        drills: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "12", "34", "56", "78", "90"],
        words: {
          easy:   ["10", "25", "300", "42", "99", "2048"],
          medium: ["room 101", "port 80", "code 404"],
          hard:   ["port 8080 is open.", "25 frozen zones, 10 explored."]
        }
      },

      // ── 20 : Full Review ──
      {
        id: 20,
        name: "Full Keyboard Review",
        newKeys: [],
        drills: ["the", "quick", "brown", "fox", "jumps"],
        words: {
          easy:   ["bridge", "expand", "liquid", "frozen", "object"],
          medium: ["exploited", "customize", "blueprint", "recognized"],
          hard:   [
            "the quick brown fox jumps over the lazy dog.",
            "12 bronze foxes explored 50 frozen zones.",
            "quiz, fix, object, vertical, combined."
          ]
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  ESPAÑOL (ES)
  // ═══════════════════════════════════════════════════════════
  "es-ES": {
    layoutId: "qwerty-es",
    levels: [

      // ── 1 : Anclas de la Fila Base ──
      // Acumulado: f j [espacio]
      {
        id: 1,
        name: "Anclas de la Fila Base",
        newKeys: ["f", "j", " "],
        drills: ["f", "j", "ff", "jj", "fj", "jf"],
        words: {
          easy:   ["f", "j", "ff", "jj"],
          medium: ["fjf", "jfj", "ffj", "jjf"],
          hard:   ["fj fj", "jf jf", "ff jj"]
        }
      },

      // ── 2 : Fila Base Interior ──
      // Acumulado: f j d k [espacio]
      {
        id: 2,
        name: "Fila Base Interior",
        newKeys: ["d", "k"],
        drills: ["d", "k", "dd", "kk", "dk", "kd", "fd", "jk"],
        words: {
          easy:   ["dd", "kk", "fd", "jk", "dk"],
          medium: ["fdk", "jkf", "dkf", "kjd"],
          hard:   ["fd jk fd", "dk dk fj"]
        }
      },

      // ── 3 : Fila Base Exterior ──
      // Acumulado: f j d k s l [espacio]
      {
        id: 3,
        name: "Fila Base Exterior",
        newKeys: ["s", "l"],
        drills: ["s", "l", "ss", "ll", "sl", "ls", "sd", "lk"],
        words: {
          easy:   ["sdf", "lsd", "lkj", "sld"],
          medium: ["flds", "skld", "sldf", "jkls"],
          hard:   ["sl dk sl", "fd lk sd"]
        }
      },

      // ── 4 : Fila Base Meñiques ──
      // Acumulado: f j d k s l a ñ [espacio]
      {
        id: 4,
        name: "Fila Base Meñiques",
        newKeys: ["a", "ñ"],
        drills: ["a", "ñ", "aa", "ññ", "aña", "ñaña", "as", "lañ"],
        words: {
          easy:   ["ala", "aña", "daña", "saña", "sal"],
          medium: ["falda", "ñaña", "añada", "dañas"],
          hard:   ["la saña daña", "ala da faldas"]
        }
      },

      // ── 5 : Fila Base Completa ──
      // Acumulado: f j d k s l a ñ g h [espacio]
      {
        id: 5,
        name: "Fila Base Completa",
        newKeys: ["g", "h"],
        drills: ["g", "h", "gh", "hg", "fg", "hj", "gf", "jh"],
        words: {
          easy:   ["hada", "gala", "haga", "halda", "alga"],
          medium: ["halaga", "galgas", "alhajas", "galas"],
          hard:   ["la hada halaga", "haga las galas"]
        }
      },

      // ── 6 : Fila Superior — Dedos Medios ──
      // Acumulado: + e i
      {
        id: 6,
        name: "Fila Superior — Dedos Medios",
        newKeys: ["e", "i"],
        drills: ["e", "i", "ee", "ii", "ei", "ie", "de", "ki"],
        words: {
          easy:   ["idea", "hiel", "fiel", "hila", "dile", "liga"],
          medium: ["aliada", "ideales", "desfile", "lidia"],
          hard:   ["ella desfila", "las ideas ideales"]
        }
      },

      // ── 7 : Fila Superior — Dedos Índice ──
      // Acumulado: + r u
      {
        id: 7,
        name: "Fila Superior — Dedos Índice",
        newKeys: ["r", "u"],
        drills: ["r", "u", "rr", "uu", "ru", "ur", "fr", "ju"],
        words: {
          easy:   ["ruda", "dura", "jura", "ruge", "usar", "risa"],
          medium: ["segura", "residir", "guarida", "saluda"],
          hard:   ["la dura jura", "su ruda ira surge"]
        }
      },

      // ── 8 : Fila Superior — Índice Alcance ──
      // Acumulado: + t y
      {
        id: 8,
        name: "Fila Superior — Índice Alcance",
        newKeys: ["t", "y"],
        drills: ["t", "y", "tt", "yy", "ty", "yt", "tr", "yu"],
        words: {
          easy:   ["tela", "yate", "tuya", "ruta", "seta", "tira"],
          medium: ["estira", "resulta", "resiste", "giraste"],
          hard:   ["el yate suelta", "estira la tela"]
        }
      },

      // ── 9 : Fila Superior — Dedos Anulares ──
      // Acumulado: + w o
      {
        id: 9,
        name: "Fila Superior — Dedos Anulares",
        newKeys: ["w", "o"],
        drills: ["w", "o", "ww", "oo", "wo", "ow", "ws", "ol"],
        words: {
          easy:   ["otro", "solo", "todo", "foro", "hora", "olor"],
          medium: ["tesoro", "letargo", "otoño", "otorga"],
          hard:   ["todo estilo yerto", "otro tesoro solo"]
        }
      },

      // ── 10 : Fila Superior — Meñiques ──
      // Acumulado: + q p
      {
        id: 10,
        name: "Fila Superior — Meñiques",
        newKeys: ["q", "p"],
        drills: ["q", "p", "qq", "pp", "qp", "pq", "qu", "pa"],
        words: {
          easy:   ["que", "piso", "pago", "quiso", "poder"],
          medium: ["equipo", "espejo", "paquete", "repite"],
          hard:   ["el equipo quiso", "aquel paquete"]
        }
      },

      // ── 11 : Fila Inferior — c ──
      // Acumulado: + c
      {
        id: 11,
        name: "Fila Inferior — c",
        newKeys: ["c"],
        drills: ["c", "cc", "cd", "ck", "sc", "cl"],
        words: {
          easy:   ["cosa", "poco", "cada", "cero", "clic", "cual"],
          medium: ["correcto", "creador", "crucial", "declara"],
          hard:   ["correcto y crucial", "cada cosa es poco"]
        }
      },

      // ── 12 : Fila Inferior — coma ──
      // Acumulado: + ,
      {
        id: 12,
        name: "Fila Inferior — coma",
        newKeys: [","],
        drills: [",", "c,", ",c", "d,", ",s"],
        words: {
          easy:   ["si, claro", "poco, algo", "eso, tal"],
          medium: ["algo, poco, todo", "cero, dicho"],
          hard:   ["correcto, todo clic", "poco a poco, crece"]
        }
      },

      // ── 13 : Fila Inferior — v m ──
      // Acumulado: + v m
      {
        id: 13,
        name: "Fila Inferior — v m",
        newKeys: ["v", "m"],
        drills: ["v", "m", "vv", "mm", "vm", "mv", "fv", "jm"],
        words: {
          easy:   ["vida", "mover", "vivir", "mucho", "vamos"],
          medium: ["motivar", "mejorar", "moldear", "revivir"],
          hard:   ["vivir mucho, motivar", "mejorar cada movida"]
        }
      },

      // ── 14 : Fila Inferior — x punto ──
      // Acumulado: + x .
      {
        id: 14,
        name: "Fila Inferior — x punto",
        newKeys: ["x", "."],
        drills: ["x", ".", "xx", "..", "x.", ".x", "sx", "l."],
        words: {
          easy:   ["mixto", "texto", "pixel", "extra", "exige"],
          medium: ["explorar", "exterior", "complejo"],
          hard:   ["el texto explora.", "el pixel extra."]
        }
      },

      // ── 15 : Fila Inferior — b n ──
      // Acumulado: + b n
      {
        id: 15,
        name: "Fila Inferior — b n",
        newKeys: ["b", "n"],
        drills: ["b", "n", "bb", "nn", "bn", "nb", "fb", "jn"],
        words: {
          easy:   ["nube", "noble", "bien", "banco", "buen"],
          medium: ["bronce", "nombre", "combate", "bloqueo"],
          hard:   ["el nombre noble", "bien combate bronce"]
        }
      },

      // ── 16 : Fila Inferior — z ──
      // Acumulado: + z
      {
        id: 16,
        name: "Fila Inferior — z",
        newKeys: ["z"],
        drills: ["z", "zz", "za", "ze", "zi", "zo", "zu"],
        words: {
          easy:   ["zona", "caza", "lazo", "zumo", "diez"],
          medium: ["belleza", "certeza", "confianza"],
          hard:   ["la belleza del lazo", "diez zonas de certeza"]
        }
      },

      // ── 17 : Guion ──
      // Acumulado: + -
      {
        id: 17,
        name: "Guion",
        newKeys: ["-"],
        drills: ["-", "--", "a-", "-b"],
        words: {
          easy:   ["bien-mal", "si-no", "va-ven"],
          medium: ["norte-sur", "abrir-cerrar"],
          hard:   ["todo-nada, bien-mal.", "norte-sur, este-oeste."]
        }
      },

      // ── 18 : Repaso Completo de Letras ──
      // Acumulado: todas las letras + , . ñ - [espacio]
      {
        id: 18,
        name: "Repaso de Letras",
        newKeys: [],
        drills: ["que", "bueno", "zona", "texto", "clave"],
        words: {
          easy:   ["fuerte", "camino", "ejemplo", "belleza"],
          medium: ["combinar", "explorar", "conquista"],
          hard:   ["el ejemplo combina belleza.", "explora todo camino posible."]
        }
      },

      // ── 19 : Números y Acentos ──
      // Acumulado: + 1 2 3 4 5 6 7 8 9 0 á é í ó ú
      {
        id: 19,
        name: "Números y Acentos",
        newKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "á", "é", "í", "ó", "ú"],
        drills: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "á", "é", "í", "ó", "ú"],
        words: {
          easy:   ["10", "25", "café", "aquí", "rápido"],
          medium: ["código 404", "señal 5", "habitación 3"],
          hard:   ["aquí va el código 10.", "25 señales rápido."]
        }
      },

      // ── 20 : Repaso Total ──
      {
        id: 20,
        name: "Repaso Total",
        newKeys: [],
        drills: ["que", "rápido", "zorro", "café", "señal"],
        words: {
          easy:   ["combinar", "explorar", "belleza", "rápido"],
          medium: ["conquista", "reconocer", "horizontal"],
          hard:   [
            "el rápido zorro salta sobre el perro.",
            "12 señales únicas en 50 zonas.",
            "aquí va el código completo, bien hecho."
          ]
        }
      }
    ]
  }
};

/**
 * USER PROFILE SCHEMA (for reference — implemented in UserManager.js)
 *
 * UserProfile = {
 *   alias          : String,
 *   createdAt      : Number,
 *   locale         : "en-US" | "es-ES",
 *   progress       : {
 *     currentLevel : Number,
 *     scores       : {
 *       [levelId]  : {
 *         bestWpm  : Number,
 *         bestAcc  : Number,
 *         stars    : Number
 *       }
 *     }
 *   }
 * }
 *
 * localStorage key: "neonstream_profiles"
 * Format: JSON array of UserProfile objects
 */
