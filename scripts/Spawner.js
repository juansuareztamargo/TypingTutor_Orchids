/**
 * Spawner.js
 * Manages creation and lifecycle of falling text targets.
 */

class Spawner {
  constructor() {
    this.targets = [];
    this._nextId = 0;
    this.spawnTimer = 0;
    this._playerWords = null;
  }

  /**
   * Configure spawner for a level.
   * @param {object} levelData - The level from DICTIONARIES
   * @param {number} difficulty - 1-15, affects speed/spawn rate
   * @param {string} [playerName] - Optional player alias to inject into the pool
   */
    configure(levelData, difficulty, playerName) {
      this.levelData = levelData;
      this.targets = [];
      this._nextId = 0;
      this.spawnTimer = 0;

    // Speed ramp — doubled to increase falling challenge
    if (difficulty <= 10) {
      this.baseSpeed = (22 + difficulty * 3) * 2;           // 50..104
    } else {
      this.baseSpeed = (52 + (difficulty - 10) * 2) * 2;    // 108..144 for L11-20
    }


      // Spawn interval — more breathing room at higher levels
      if (difficulty <= 10) {
        this.spawnInterval = Math.max(1.2, 3.0 - difficulty * 0.15);   // 2.85..1.5
      } else {
        this.spawnInterval = Math.max(1.0, 2.4 - (difficulty - 10) * 0.1); // 2.3..1.4
      }

      // Build the pool of words to pick from
      this.pool = [];
      this.pool.push(...levelData.drills);
      this.pool.push(...levelData.words.easy);
      if (difficulty >= 8) {
        this.pool.push(...levelData.words.medium);
      }
      if (difficulty >= 16) {
        this.pool.push(...levelData.words.hard);
      }

      // Inject player-name-derived words into the pool
      if (playerName && playerName.length >= 2) {
        this._injectPlayerName(playerName, levelData);
      }

      // Target count to complete the level — moderate increase
      this.totalToSpawn = 10 + difficulty * 2;
      this.spawned = 0;
    }

  update(dt, screenW, screenH) {
    if (this.spawned >= this.totalToSpawn && this.targets.length === 0) {
      return "level_complete";
    }

    // Spawn new targets
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawned < this.totalToSpawn) {
      this._spawn(screenW);
      this.spawnTimer = this.spawnInterval * (0.8 + Math.random() * 0.4);
    }

    // Update positions
    let missed = false;
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.y += t.speed * dt;

      // Hit bottom
      if (t.y > screenH - 50) {
        this.targets.splice(i, 1);
        missed = true;
      }
    }

    return missed ? "missed" : "ok";
  }

  /**
   * Build words from the player's name and inject them into the pool.
   * Generates: full name, reversed name, and substrings of 2+ chars.
   * Only keeps entries whose characters are all within the level's key set.
   */
  _injectPlayerName(name, levelData) {
    const lower = name.toLowerCase();
    // Build the set of keys available in this level
    const allowed = new Set();
    for (const k of levelData.newKeys) allowed.add(k.toLowerCase());
    // Also include keys from drills/words already in pool (they're valid)
    for (const w of this.pool) {
      for (const ch of w.toLowerCase()) allowed.add(ch);
    }

    const candidates = new Set();
    // Full name
    candidates.add(lower);
    // Reversed
    if (lower.length >= 3) candidates.add(lower.split("").reverse().join(""));
    // Substrings of length 2+
    for (let len = 2; len < lower.length; len++) {
      for (let start = 0; start <= lower.length - len; start++) {
        candidates.add(lower.substring(start, start + len));
      }
    }

    // Filter: only keep words where every character is in the allowed set
    const valid = [];
    for (const word of candidates) {
      let ok = true;
      for (const ch of word) {
        if (ch === " ") continue; // spaces are always fine
        if (!allowed.has(ch)) { ok = false; break; }
      }
      if (ok && word.trim().length >= 2) valid.push(word);
    }

    // Add valid words multiple times to give them decent spawn weight
    this._playerWords = new Set();
    for (const w of valid) {
      this.pool.push(w);
      this.pool.push(w); // double weight so they appear noticeably
      this._playerWords.add(w);
    }
  }

  _spawn(screenW) {
    const text = this.pool[Math.floor(Math.random() * this.pool.length)];
    const fontSize = text.length > 6 ? 22 : 28;
    const textW = text.length * fontSize * 0.65;
    const x = 30 + Math.random() * Math.max(50, screenW - textW - 60);

    // Determine tier for coloring
    let tier = "easy";
    if (this._playerWords && this._playerWords.has(text)) tier = "player";
    else if (this.levelData.words.hard.includes(text)) tier = "hard";
    else if (this.levelData.words.medium.includes(text)) tier = "medium";

    this.targets.push({
      id: this._nextId++,
      text: text,
      typed: 0,          // how many chars have been correctly typed
      x: x,
      y: -20,
      speed: this.baseSpeed * (0.8 + Math.random() * 0.4),
      fontSize: fontSize,
      tier: tier,
    });

    this.spawned++;
  }

  /**
   * Find the best target matching a typed character.
   * Priority: lowest on screen (closest to bottom), then leftmost.
   */
  getActiveTarget() {
    if (this.targets.length === 0) return null;

    // First, find any target already being typed (typed > 0)
    let active = null;
    for (const t of this.targets) {
      if (t.typed > 0) {
        if (!active || t.y > active.y) active = t;
      }
    }
    if (active) return active;

    // Otherwise, return the lowest target
    let lowest = this.targets[0];
    for (const t of this.targets) {
      if (t.y > lowest.y) lowest = t;
    }
    return lowest;
  }

  removeTarget(id) {
    const idx = this.targets.findIndex(t => t.id === id);
    if (idx !== -1) {
      const t = this.targets[idx];
      this.targets.splice(idx, 1);
      return t;
    }
    return null;
  }
}
