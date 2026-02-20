/**
 * layouts.js
 * Physical keyboard layouts for the visual keyboard overlay.
 *
 * COUPLED MODEL: Layouts are selected via DICTIONARIES[locale].layoutId,
 * not independently. See dictionaries.js for the locale → layout mapping.
 *
 * SCHEMA
 * ------
 * LAYOUTS = {
 *   <layoutId>: {                          // "qwerty-us" | "qwerty-es"
 *     id       : String,
 *     label    : String,                   // Human-readable name
 *     rows     : [                         // Array of rows, top to bottom
 *       {
 *         keys : [
 *           {
 *             code      : String,          // KeyboardEvent.code (physical key)
 *             normal    : String,          // Character produced (no modifier)
 *             shift     : String,          // Character produced with Shift
 *             finger    : String,          // Which finger: "pinky-l" | "ring-l" | "mid-l" |
 *                                          //   "index-l" | "index-r" | "mid-r" | "ring-r" | "pinky-r" | "thumb"
 *             width     : Number           // Relative width multiplier (1 = standard key)
 *           },
 *           ...
 *         ]
 *       },
 *       ...
 *     ]
 *   }
 * }
 *
 * FINGER COLOR MAP (used by the Teacher overlay)
 * -----------------------------------------------
 *   pinky-l  / pinky-r  : #FF4466  (Red / Hot Pink)
 *   ring-l   / ring-r   : #FF9F1C  (Orange)
 *   mid-l    / mid-r    : #00E5FF  (Cyan)
 *   index-l  / index-r  : #76FF03  (Lime Green)
 *   thumb               : #FFEA00  (Electric Yellow)
 */

const FINGER_COLORS = {
  "pinky-l":  "#FF4466",
  "ring-l":   "#FF9F1C",
  "mid-l":    "#00E5FF",
  "index-l":  "#76FF03",
  "index-r":  "#76FF03",
  "mid-r":    "#00E5FF",
  "ring-r":   "#FF9F1C",
  "pinky-r":  "#FF4466",
  "thumb":    "#FFEA00"
};

const LAYOUTS = {

  // ═══════════════════════════════════════════
  //  QWERTY US  (ANSI 104-key)
  // ═══════════════════════════════════════════
  "qwerty-us": {
    id: "qwerty-us",
    label: "QWERTY US (ANSI)",
    rows: [

      // ── Row 0: Number Row ──
      {
        keys: [
          { code: "Backquote",  normal: "`",  shift: "~",  finger: "pinky-l",  width: 1 },
          { code: "Digit1",     normal: "1",  shift: "!",  finger: "pinky-l",  width: 1 },
          { code: "Digit2",     normal: "2",  shift: "@",  finger: "ring-l",   width: 1 },
          { code: "Digit3",     normal: "3",  shift: "#",  finger: "mid-l",    width: 1 },
          { code: "Digit4",     normal: "4",  shift: "$",  finger: "index-l",  width: 1 },
          { code: "Digit5",     normal: "5",  shift: "%",  finger: "index-l",  width: 1 },
          { code: "Digit6",     normal: "6",  shift: "^",  finger: "index-r",  width: 1 },
          { code: "Digit7",     normal: "7",  shift: "&",  finger: "index-r",  width: 1 },
          { code: "Digit8",     normal: "8",  shift: "*",  finger: "mid-r",    width: 1 },
          { code: "Digit9",     normal: "9",  shift: "(",  finger: "ring-r",   width: 1 },
          { code: "Digit0",     normal: "0",  shift: ")",  finger: "pinky-r",  width: 1 },
          { code: "Minus",      normal: "-",  shift: "_",  finger: "pinky-r",  width: 1 },
          { code: "Equal",      normal: "=",  shift: "+",  finger: "pinky-r",  width: 1 },
          { code: "Backspace",  normal: "⌫",  shift: "⌫",  finger: "pinky-r",  width: 2 }
        ]
      },

      // ── Row 1: Top Letter Row ──
      {
        keys: [
          { code: "Tab",        normal: "⇥",  shift: "⇥",  finger: "pinky-l",  width: 1.5 },
          { code: "KeyQ",       normal: "q",  shift: "Q",  finger: "pinky-l",  width: 1 },
          { code: "KeyW",       normal: "w",  shift: "W",  finger: "ring-l",   width: 1 },
          { code: "KeyE",       normal: "e",  shift: "E",  finger: "mid-l",    width: 1 },
          { code: "KeyR",       normal: "r",  shift: "R",  finger: "index-l",  width: 1 },
          { code: "KeyT",       normal: "t",  shift: "T",  finger: "index-l",  width: 1 },
          { code: "KeyY",       normal: "y",  shift: "Y",  finger: "index-r",  width: 1 },
          { code: "KeyU",       normal: "u",  shift: "U",  finger: "index-r",  width: 1 },
          { code: "KeyI",       normal: "i",  shift: "I",  finger: "mid-r",    width: 1 },
          { code: "KeyO",       normal: "o",  shift: "O",  finger: "ring-r",   width: 1 },
          { code: "KeyP",       normal: "p",  shift: "P",  finger: "pinky-r",  width: 1 },
          { code: "BracketLeft",  normal: "[",  shift: "{",  finger: "pinky-r",  width: 1 },
          { code: "BracketRight", normal: "]",  shift: "}",  finger: "pinky-r",  width: 1 },
          { code: "Backslash",  normal: "\\", shift: "|",  finger: "pinky-r",  width: 1.5 }
        ]
      },

      // ── Row 2: Home Row ──
      {
        keys: [
          { code: "CapsLock",   normal: "⇪",  shift: "⇪",  finger: "pinky-l",  width: 1.75 },
          { code: "KeyA",       normal: "a",  shift: "A",  finger: "pinky-l",  width: 1 },
          { code: "KeyS",       normal: "s",  shift: "S",  finger: "ring-l",   width: 1 },
          { code: "KeyD",       normal: "d",  shift: "D",  finger: "mid-l",    width: 1 },
          { code: "KeyF",       normal: "f",  shift: "F",  finger: "index-l",  width: 1 },
          { code: "KeyG",       normal: "g",  shift: "G",  finger: "index-l",  width: 1 },
          { code: "KeyH",       normal: "h",  shift: "H",  finger: "index-r",  width: 1 },
          { code: "KeyJ",       normal: "j",  shift: "J",  finger: "index-r",  width: 1 },
          { code: "KeyK",       normal: "k",  shift: "K",  finger: "mid-r",    width: 1 },
          { code: "KeyL",       normal: "l",  shift: "L",  finger: "ring-r",   width: 1 },
          { code: "Semicolon",  normal: ";",  shift: ":",  finger: "pinky-r",  width: 1 },
          { code: "Quote",      normal: "'",  shift: "\"", finger: "pinky-r",  width: 1 },
          { code: "Enter",      normal: "↵",  shift: "↵",  finger: "pinky-r",  width: 2.25 }
        ]
      },

      // ── Row 3: Bottom Row ──
      {
        keys: [
          { code: "ShiftLeft",  normal: "⇧",  shift: "⇧",  finger: "pinky-l",  width: 2.25 },
          { code: "KeyZ",       normal: "z",  shift: "Z",  finger: "pinky-l",  width: 1 },
          { code: "KeyX",       normal: "x",  shift: "X",  finger: "ring-l",   width: 1 },
          { code: "KeyC",       normal: "c",  shift: "C",  finger: "mid-l",    width: 1 },
          { code: "KeyV",       normal: "v",  shift: "V",  finger: "index-l",  width: 1 },
          { code: "KeyB",       normal: "b",  shift: "B",  finger: "index-l",  width: 1 },
          { code: "KeyN",       normal: "n",  shift: "N",  finger: "index-r",  width: 1 },
          { code: "KeyM",       normal: "m",  shift: "M",  finger: "index-r",  width: 1 },
          { code: "Comma",      normal: ",",  shift: "<",  finger: "mid-r",    width: 1 },
          { code: "Period",     normal: ".",  shift: ">",  finger: "ring-r",   width: 1 },
          { code: "Slash",      normal: "/",  shift: "?",  finger: "pinky-r",  width: 1 },
          { code: "ShiftRight", normal: "⇧",  shift: "⇧",  finger: "pinky-r",  width: 2.75 }
        ]
      },

      // ── Row 4: Space Bar Row ──
      {
        keys: [
          { code: "ControlLeft",  normal: "Ctrl",  shift: "Ctrl",  finger: "pinky-l",  width: 1.5 },
          { code: "AltLeft",      normal: "Alt",   shift: "Alt",   finger: "pinky-l",  width: 1.25 },
          { code: "Space",        normal: " ",     shift: " ",     finger: "thumb",     width: 6.25 },
          { code: "AltRight",     normal: "Alt",   shift: "Alt",   finger: "pinky-r",  width: 1.25 },
          { code: "ControlRight", normal: "Ctrl",  shift: "Ctrl",  finger: "pinky-r",  width: 1.5 }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════
  //  QWERTY ES  (ISO 105-key, Spanish layout)
  // ═══════════════════════════════════════════
  "qwerty-es": {
    id: "qwerty-es",
    label: "QWERTY Español (ISO)",
    rows: [

      // ── Row 0: Number Row ──
      // Spanish layout: top row symbols differ (e.g., Shift+1 = !, Shift+2 = ", etc.)
      {
        keys: [
          { code: "Backquote",  normal: "º",  shift: "ª",  finger: "pinky-l",  width: 1 },
          { code: "Digit1",     normal: "1",  shift: "!",  finger: "pinky-l",  width: 1 },
          { code: "Digit2",     normal: "2",  shift: "\"", finger: "ring-l",   width: 1 },
          { code: "Digit3",     normal: "3",  shift: "·",  finger: "mid-l",    width: 1 },
          { code: "Digit4",     normal: "4",  shift: "$",  finger: "index-l",  width: 1 },
          { code: "Digit5",     normal: "5",  shift: "%",  finger: "index-l",  width: 1 },
          { code: "Digit6",     normal: "6",  shift: "&",  finger: "index-r",  width: 1 },
          { code: "Digit7",     normal: "7",  shift: "/",  finger: "index-r",  width: 1 },
          { code: "Digit8",     normal: "8",  shift: "(",  finger: "mid-r",    width: 1 },
          { code: "Digit9",     normal: "9",  shift: ")",  finger: "ring-r",   width: 1 },
          { code: "Digit0",     normal: "0",  shift: "=",  finger: "pinky-r",  width: 1 },
          { code: "Minus",      normal: "'",  shift: "?",  finger: "pinky-r",  width: 1 },
          { code: "Equal",      normal: "¡",  shift: "¿",  finger: "pinky-r",  width: 1 },
          { code: "Backspace",  normal: "⌫",  shift: "⌫",  finger: "pinky-r",  width: 2 }
        ]
      },

      // ── Row 1: Top Letter Row ──
      {
        keys: [
          { code: "Tab",        normal: "⇥",  shift: "⇥",  finger: "pinky-l",  width: 1.5 },
          { code: "KeyQ",       normal: "q",  shift: "Q",  finger: "pinky-l",  width: 1 },
          { code: "KeyW",       normal: "w",  shift: "W",  finger: "ring-l",   width: 1 },
          { code: "KeyE",       normal: "e",  shift: "E",  finger: "mid-l",    width: 1 },
          { code: "KeyR",       normal: "r",  shift: "R",  finger: "index-l",  width: 1 },
          { code: "KeyT",       normal: "t",  shift: "T",  finger: "index-l",  width: 1 },
          { code: "KeyY",       normal: "y",  shift: "Y",  finger: "index-r",  width: 1 },
          { code: "KeyU",       normal: "u",  shift: "U",  finger: "index-r",  width: 1 },
          { code: "KeyI",       normal: "i",  shift: "I",  finger: "mid-r",    width: 1 },
          { code: "KeyO",       normal: "o",  shift: "O",  finger: "ring-r",   width: 1 },
          { code: "KeyP",       normal: "p",  shift: "P",  finger: "pinky-r",  width: 1 },
          // Dead key: accent ` / ^ (used with vowels to produce à, è, etc.)
          { code: "BracketLeft",  normal: "`",  shift: "^",  finger: "pinky-r",  width: 1 },
          { code: "BracketRight", normal: "+",  shift: "*",  finger: "pinky-r",  width: 1 },
          // ISO Enter spans row 1 & 2 — we represent the tail here
          { code: "Enter",      normal: "↵",  shift: "↵",  finger: "pinky-r",  width: 1.5 }
        ]
      },

      // ── Row 2: Home Row ──
      // KEY DIFFERENCE: Semicolon position has Ñ on Spanish layout
      {
        keys: [
          { code: "CapsLock",   normal: "⇪",  shift: "⇪",  finger: "pinky-l",  width: 1.75 },
          { code: "KeyA",       normal: "a",  shift: "A",  finger: "pinky-l",  width: 1 },
          { code: "KeyS",       normal: "s",  shift: "S",  finger: "ring-l",   width: 1 },
          { code: "KeyD",       normal: "d",  shift: "D",  finger: "mid-l",    width: 1 },
          { code: "KeyF",       normal: "f",  shift: "F",  finger: "index-l",  width: 1 },
          { code: "KeyG",       normal: "g",  shift: "G",  finger: "index-l",  width: 1 },
          { code: "KeyH",       normal: "h",  shift: "H",  finger: "index-r",  width: 1 },
          { code: "KeyJ",       normal: "j",  shift: "J",  finger: "index-r",  width: 1 },
          { code: "KeyK",       normal: "k",  shift: "K",  finger: "mid-r",    width: 1 },
          { code: "KeyL",       normal: "l",  shift: "L",  finger: "ring-r",   width: 1 },
          // Ñ sits where ; is on US layout
          { code: "Semicolon",  normal: "ñ",  shift: "Ñ",  finger: "pinky-r",  width: 1 },
          // Dead key: accent ´ / ¨ (used with vowels to produce á, é, ü, etc.)
          { code: "Quote",      normal: "´",  shift: "¨",  finger: "pinky-r",  width: 1 },
          // ç is on the key between Quote and Enter on ISO
          { code: "Backslash",  normal: "ç",  shift: "Ç",  finger: "pinky-r",  width: 1 }
          // Note: ISO Enter is on Row 1 for this layout
        ]
      },

      // ── Row 3: Bottom Row ──
      // ISO has an extra key between Left Shift and Z: < >
      {
        keys: [
          { code: "ShiftLeft",     normal: "⇧",  shift: "⇧",  finger: "pinky-l",  width: 1.25 },
          // Extra ISO key (IntlBackslash)
          { code: "IntlBackslash", normal: "<",  shift: ">",  finger: "pinky-l",  width: 1 },
          { code: "KeyZ",          normal: "z",  shift: "Z",  finger: "pinky-l",  width: 1 },
          { code: "KeyX",          normal: "x",  shift: "X",  finger: "ring-l",   width: 1 },
          { code: "KeyC",          normal: "c",  shift: "C",  finger: "mid-l",    width: 1 },
          { code: "KeyV",          normal: "v",  shift: "V",  finger: "index-l",  width: 1 },
          { code: "KeyB",          normal: "b",  shift: "B",  finger: "index-l",  width: 1 },
          { code: "KeyN",          normal: "n",  shift: "N",  finger: "index-r",  width: 1 },
          { code: "KeyM",          normal: "m",  shift: "M",  finger: "index-r",  width: 1 },
          { code: "Comma",         normal: ",",  shift: ";",  finger: "mid-r",    width: 1 },
          { code: "Period",        normal: ".",  shift: ":",  finger: "ring-r",   width: 1 },
          { code: "Slash",         normal: "-",  shift: "_",  finger: "pinky-r",  width: 1 },
          { code: "ShiftRight",    normal: "⇧",  shift: "⇧",  finger: "pinky-r",  width: 2.75 }
        ]
      },

      // ── Row 4: Space Bar Row ──
      {
        keys: [
          { code: "ControlLeft",  normal: "Ctrl",   shift: "Ctrl",   finger: "pinky-l",  width: 1.5 },
          { code: "AltLeft",      normal: "Alt",    shift: "Alt",    finger: "pinky-l",  width: 1.25 },
          { code: "Space",        normal: " ",      shift: " ",      finger: "thumb",     width: 6.25 },
          // AltGr on Spanish keyboards — produces @, #, €, etc.
          { code: "AltRight",     normal: "AltGr",  shift: "AltGr",  finger: "pinky-r",  width: 1.25 },
          { code: "ControlRight", normal: "Ctrl",   shift: "Ctrl",   finger: "pinky-r",  width: 1.5 }
        ]
      }
    ]
  }
};

/**
 * HELPER: Build a lookup map from physical KeyboardEvent.code → character
 * for a given layout. Useful for the InputHandler to resolve what character
 * the player intended to type based on their chosen layout.
 *
 * @param {string} layoutId  - "qwerty-us" or "qwerty-es"
 * @returns {Object} { [code]: { normal, shift } }
 */
function buildCodeToCharMap(layoutId) {
  const layout = LAYOUTS[layoutId];
  if (!layout) return {};
  const map = {};
  for (const row of layout.rows) {
    for (const key of row.keys) {
      map[key.code] = { normal: key.normal, shift: key.shift };
    }
  }
  return map;
}

/**
 * HELPER: Get the layout object for a given locale.
 * Uses the coupled mapping from DICTIONARIES.
 *
 * @param {string} locale - "en-US" or "es-ES"
 * @returns {Object|null} The LAYOUTS entry, or null if not found
 */
function getLayoutForLocale(locale) {
  const dict = typeof DICTIONARIES !== "undefined" ? DICTIONARIES[locale] : null;
  if (!dict) return null;
  return LAYOUTS[dict.layoutId] || null;
}
