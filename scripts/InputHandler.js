/**
 * InputHandler.js
 * Captures keystrokes and matches them to active falling targets.
 */

class InputHandler {
  constructor() {
    this._listeners = [];
    this._onKey = null;       // callback(char) set by Game
    this._onSpecial = null;   // callback(key) for menu nav
    this.enabled = true;
    this.pressedKeys = new Set(); // currently held physical keys (e.key, lowercased)
  }

  /**
   * Start listening for keyboard input.
   * @param {Function} onChar - Called with the typed character (lowercase)
   * @param {Function} onSpecial - Called for non-char keys (Enter, Escape, Arrow*, etc.)
   */
  start(onChar, onSpecial) {
    this.stop();
    this._onKey = onChar;
    this._onSpecial = onSpecial;

      const handler = (e) => {
          if (!this.enabled) return;

          // Developer cheat hotkey (CTRL+ALT+SHIFT+G)
          if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === "g" || e.key === "G")) {
            e.preventDefault();
            if (this._onSpecial) this._onSpecial("CheatGodMode");
            return;
          }

          // Track physical key press
          if (e.key.length === 1) this.pressedKeys.add(e.key.toLowerCase());

          // Prevent default for game keys (no scrolling, etc.)
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(e.code)) {
          e.preventDefault();
        }


      // Special keys (including Space for menu/teacher navigation)
      if (["Enter", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
           "Backspace", "Delete"].includes(e.key) ||
          e.key.startsWith("Arrow") || e.key === " ") {
        if (this._onSpecial) this._onSpecial(e.key);
        // In playing state, Space is also a typeable character — let it fall through
        if (e.key !== " ") return;
      }

      // Regular character
      if (e.key.length === 1) {
        e.preventDefault();
        if (this._onKey) this._onKey(e.key.toLowerCase());
      }
    };

    document.addEventListener("keydown", handler);
    this._listeners.push(handler);

    const upHandler = (e) => {
      if (e.key.length === 1) this.pressedKeys.delete(e.key.toLowerCase());
    };
    document.addEventListener("keyup", upHandler);
    this._listeners.push(upHandler);
  }

  stop() {
    for (const fn of this._listeners) {
      document.removeEventListener("keydown", fn);
      document.removeEventListener("keyup", fn);
    }
    this._listeners = [];
    this.pressedKeys.clear();
  }
}
