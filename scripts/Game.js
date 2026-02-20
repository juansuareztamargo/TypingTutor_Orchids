/**
 * Game.js
 * Main game loop, state management, and orchestration.
 *
 * States: menu → levelSelect → teacher → playing → levelComplete → gameOver
 */

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.renderer = new Renderer(this.canvas);
    this.userManager = new UserManager();
    this.spawner = new Spawner();
    this.input = new InputHandler();
    this.sfx = new SoundFX();

    // State
    this.state = "menu";       // menu | levelSelect | teacher | playing | paused | levelComplete | gameOver
    this.pauseIndex = 0;        // 0 = Continue, 1 = Quit
    this.menuIndex = 0;
    this.endScreenIndex = 0;    // 0 = Continue/Retry, 1 = Retry/Menu

    // Level select
    this.selectedLevel = 1;

    // Gameplay
    this.health = 100;
    this.score = 0;
    this.totalChars = 0;
    this.correctChars = 0;
    this.startTime = 0;
    this.levelData = null;

    // Teacher overlay timer
    this.teacherTimer = 0;
    this.showKeyboard = false;

    // Frame timing
    this._lastTime = 0;
    this._rafId = null;

    // Create profile form (DOM)
    this._createProfileForm();

    // Canvas click handler
    this.canvas.addEventListener("click", (e) => this._onClick(e));
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      this.canvas.style.cursor = this.renderer.hitTest(px, py) ? "pointer" : "default";
    });

    // Default locale for UI before any profile is selected
    this._uiLocale = getSystemLocale();
    this.renderer.setLocale(this._uiLocale);

    // Start
    this.input.start(
      (ch) => this._onChar(ch),
      (key) => this._onSpecial(key)
    );

    this._loop = this._loop.bind(this);
    this._rafId = requestAnimationFrame(this._loop);
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - (this._lastTime || timestamp)) / 1000, 0.1);
    this._lastTime = timestamp;

    // Clear click regions for this frame
    this.renderer.clearHitRegions();

    switch (this.state) {
      case "menu":
        this._updateMenu(dt);
        break;
      case "levelSelect":
        this._updateLevelSelect(dt);
        break;
      case "teacher":
        this._updateTeacher(dt);
        break;
      case "playing":
          this._updatePlaying(dt);
          break;
        case "paused":
          this.renderer.drawRainBackground(dt);
          this.renderer.drawPauseScreen(this.pauseIndex);
          break;
        case "levelComplete":
          this.renderer.drawRainBackground(dt);
          this.renderer.drawLevelComplete(this._completionStats, this.endScreenIndex);
          break;
        case "gameOver":
          this.renderer.drawRainBackground(dt);
          this.renderer.drawGameOver(this.endScreenIndex);
          break;
    }

    this.renderer.updateShake(dt);
    this._rafId = requestAnimationFrame(this._loop);
  }

  // ── MENU ─────────────────────────────────────────────────

  _updateMenu(dt) {
    const profiles = this.userManager.getProfiles();
    this.renderer.drawMenuScreen(profiles, this.menuIndex, "select");
  }

  // ── LEVEL SELECT ─────────────────────────────────────────

  _updateLevelSelect(dt) {
    const profile = this.userManager.getActive();
    if (!profile) { this.state = "menu"; return; }

    const locale = profile.locale;
    const levels = DICTIONARIES[locale].levels;
    this.renderer.drawLevelSelect(levels, profile.progress.currentLevel, this.selectedLevel);
  }

  // ── TEACHER ──────────────────────────────────────────────

  _updateTeacher(dt) {
    this.renderer.clearFull();
    this.renderer.drawRainBackground(dt);

    const profile = this.userManager.getActive();
    const locale = profile.locale;
    const layout = getLayoutForLocale(locale);
    const levels = DICTIONARIES[locale].levels;

    // Build cumulative active keys up to current level
    const activeKeys = new Set();
    const newKeys = new Set();
    for (let i = 0; i < this.selectedLevel; i++) {
      for (const k of levels[i].newKeys) activeKeys.add(k);
    }
    const currentLvl = levels[this.selectedLevel - 1];
    for (const k of currentLvl.newKeys) newKeys.add(k);

      this.renderer.drawKeyboardOverlay(layout, activeKeys, newKeys, this.input.pressedKeys);

      // Title
    const ctx = this.renderer.ctx;
    const strings = this.renderer._strings;
    ctx.textAlign = "center";
    ctx.font = `bold 24px ${this.renderer.FONT_FAMILY}`;
    ctx.fillStyle = this.renderer.NEON.cyan;
    ctx.fillText(`${strings.level} ${this.selectedLevel}: ${currentLvl.name}`, this.renderer.W / 2, 50);

    ctx.font = `16px ${this.renderer.FONT_FAMILY}`;
    ctx.fillStyle = this.renderer.NEON.yellow;
    ctx.fillText(`${strings.newKeys}: ${currentLvl.newKeys.join("  ")}`, this.renderer.W / 2, 85);

    // Countdown
    this.teacherTimer -= dt;
    const secs = Math.ceil(Math.max(0, this.teacherTimer));
    ctx.font = `bold 48px ${this.renderer.FONT_FAMILY}`;
    ctx.fillStyle = this.renderer.NEON.white;
    if (this.teacherTimer > 0) {
      ctx.fillText(secs.toString(), this.renderer.W / 2, 160);
    }

    ctx.font = `14px ${this.renderer.FONT_FAMILY}`;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(strings.teacherNav, this.renderer.W / 2, this.renderer.H - 15);
    ctx.textAlign = "left";

    if (this.teacherTimer <= 0) {
      this._startLevel();
    }
  }

  // ── PLAYING ──────────────────────────────────────────────

  _startLevel() {
    const profile = this.userManager.getActive();
    const locale = profile.locale;
    const levels = DICTIONARIES[locale].levels;
    this.levelData = levels[this.selectedLevel - 1];

    this.health = 100;
    this.score = 0;
    this.totalChars = 0;
    this.correctChars = 0;
    this.startTime = performance.now();
    this.showKeyboard = true;

      this.spawner.configure(this.levelData, this.selectedLevel, profile.alias);
    this.state = "playing";
  }

  _updatePlaying(dt) {
    const renderer = this.renderer;

      // Draw background with trail
      renderer.drawRainBackground(dt, this.input.pressedKeys);

    // Update spawner
    const result = this.spawner.update(dt, renderer.W, renderer.H);

    if (result === "missed") {
      this.health -= 15;
      this.sfx.playMissed();
      renderer.applyShake(6);
        if (this.health <= 0) {
          this.health = 0;
          this.sfx.playGameOver();
          this.endScreenIndex = 0;
          this.state = "gameOver";
          return;
        }
      }

      if (result === "level_complete") {
      this._completeLevel();
      return;
    }

    // Draw targets
    renderer.drawTargets(this.spawner.targets);

    // Draw particles
    renderer.updateAndDrawParticles(dt);

    // Draw keyboard overlay (toggleable)
    if (this.showKeyboard) {
      const profile = this.userManager.getActive();
      const layout = getLayoutForLocale(profile.locale);
      const levels = DICTIONARIES[profile.locale].levels;
      const activeKeys = new Set();
      const newKeys = new Set();
      for (let i = 0; i < this.selectedLevel; i++) {
        for (const k of levels[i].newKeys) activeKeys.add(k);
      }
      for (const k of this.levelData.newKeys) newKeys.add(k);
        renderer.drawKeyboardOverlay(layout, activeKeys, newKeys, this.input.pressedKeys);
    }

    // Draw HUD
    const elapsed = (performance.now() - this.startTime) / 60000; // minutes
    const wpm = elapsed > 0 ? Math.round((this.correctChars / 5) / elapsed) : 0;
    const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;

    renderer.drawHUD({
      level: this.selectedLevel,
      levelName: this.levelData.name,
      health: this.health,
      score: this.score,
      wpm: wpm,
      accuracy: accuracy,
    });
  }

  _completeLevel() {
    const elapsed = (performance.now() - this.startTime) / 60000;
    const wpm = elapsed > 0 ? Math.round((this.correctChars / 5) / elapsed) : 0;
    const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;

    const stars = accuracy >= 95 && wpm >= 20 ? 3 :
                  accuracy >= 80 && wpm >= 10 ? 2 :
                  accuracy >= 60 ? 1 : 0;

    this._completionStats = { score: this.score, wpm, accuracy, stars };

      this.userManager.saveLevelResult(this.selectedLevel, wpm, accuracy, this.score);
      this.sfx.playLevelComplete();
      this.endScreenIndex = 0;
      this.state = "levelComplete";
    }

  // ── INPUT HANDLING ───────────────────────────────────────

  _onChar(ch) {
    if (this.state === "playing") {
      this._handleGameChar(ch);
    }
  }

  _handleGameChar(ch) {
    const target = this.spawner.getActiveTarget();
    if (!target) return;

    this.totalChars++;
    const expected = target.text[target.typed];

    if (ch === expected) {
      this.correctChars++;
      target.typed++;
      this.score += 10;

      this.sfx.playKeyCorrect();

      // Character particle burst
      const fontSize = target.fontSize || 28;
      const cx = target.x + target.typed * fontSize * 0.65;
      const color = this.renderer.TIER_COLORS[target.tier] || this.renderer.NEON.cyan;
      this.renderer.spawnParticles(cx, target.y, color, 6);

          // Word completed
          if (target.typed >= target.text.length) {
            this.score += target.text.length * 5; // bonus
            this.sfx.playWordDestroyed();
            this.renderer.spawnParticles(
              target.x + (target.text.length * fontSize * 0.65) / 2,
              target.y,
              color,
              15
            );
            // Flash rain with accuracy-based colour
            const acc = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
            this.renderer.triggerWordFlash(acc);
            this.spawner.removeTarget(target.id);
          }
    } else {
      // Wrong key
      this.sfx.playKeyWrong();
      this.renderer.applyShake(3);
      this.health -= 2;
        if (this.health <= 0) {
          this.health = 0;
          this.sfx.playGameOver();
          this.endScreenIndex = 0;
          this.state = "gameOver";
        }
      }
    }

    _onSpecial(key) {
    switch (this.state) {
      case "menu":
        this._handleMenuKey(key);
        break;
      case "levelSelect":
        this._handleLevelSelectKey(key);
        break;
      case "teacher":
        if (key === "Escape") {
          this.state = "levelSelect";
        } else if (key === " ") {
          this._startLevel();
        }
        break;
      case "playing":
        if (key === "Escape") {
          this.pauseIndex = 0;
          this.state = "paused";
        }
        break;
      case "paused":
        if (key === "Escape" || key === "Enter") {
          this.sfx.playMenuSelect();
          if (this.pauseIndex === 0) {
            // Continue
            this.state = "playing";
          } else {
            // Quit
            this.spawner.targets = [];
            this.state = "levelSelect";
          }
        } else if (key === "ArrowUp" || key === "ArrowDown") {
          this.pauseIndex = this.pauseIndex === 0 ? 1 : 0;
          this.sfx.playMenuNav();
        }
        break;
      case "levelComplete":
        if (key === "ArrowLeft" || key === "ArrowRight") {
          this.endScreenIndex = this.endScreenIndex === 0 ? 1 : 0;
          this.sfx.playMenuNav();
        } else if (key === "Enter") {
          this.sfx.playMenuSelect();
          if (this.endScreenIndex === 0) {
            const totalLevels = DICTIONARIES[this.userManager.getActive().locale].levels.length;
            this.state = "levelSelect";
            this.selectedLevel = Math.min(this.selectedLevel + 1, totalLevels);
          } else {
            this._enterTeacher();
          }
        } else if (key === "r" || key === "R") {
          this._enterTeacher();
        }
        break;
      case "gameOver":
        if (key === "ArrowLeft" || key === "ArrowRight") {
          this.endScreenIndex = this.endScreenIndex === 0 ? 1 : 0;
          this.sfx.playMenuNav();
        } else if (key === "Enter") {
          this.sfx.playMenuSelect();
          if (this.endScreenIndex === 0) {
            this._enterTeacher();
          } else {
            this.state = "levelSelect";
          }
        } else if (key === "r" || key === "R") {
          this._enterTeacher();
        } else if (key === "Escape") {
          this.state = "levelSelect";
        }
        break;
    }
  }

  _handleMenuKey(key) {
    const profiles = this.userManager.getProfiles();
    const maxIdx = profiles.length; // last index = "create new"

      if (key === "ArrowUp") {
      this.menuIndex = Math.max(0, this.menuIndex - 1);
      this.sfx.playMenuNav();
    } else if (key === "ArrowDown") {
      this.menuIndex = Math.min(maxIdx, this.menuIndex + 1);
      this.sfx.playMenuNav();
    } else if (key === "Enter") {
      this.sfx.playMenuSelect();
      if (this.menuIndex < profiles.length) {
        // Select existing profile
        this.userManager.setActive(this.menuIndex);
        this.renderer.setLocale(this.userManager.getActive().locale);
        this.selectedLevel = this.userManager.getActive().progress.currentLevel;
        this.state = "levelSelect";
      } else {
        // Show create form
        this._showCreateForm();
      }
    } else if (key === "Delete" || key === "Backspace") {
      if (this.menuIndex < profiles.length) {
        this.userManager.deleteProfile(this.menuIndex);
        this.menuIndex = Math.min(this.menuIndex, Math.max(0, profiles.length - 2));
      }
    }
  }

  _handleLevelSelectKey(key) {
    const profile = this.userManager.getActive();
    const maxLevel = profile.progress.currentLevel;

    if (key === "ArrowRight") {
      this.selectedLevel = Math.min(maxLevel, this.selectedLevel + 1);
      this.sfx.playMenuNav();
    } else if (key === "ArrowLeft") {
      this.selectedLevel = Math.max(1, this.selectedLevel - 1);
      this.sfx.playMenuNav();
    } else if (key === "ArrowDown") {
      this.selectedLevel = Math.min(maxLevel, this.selectedLevel + 5);
      this.sfx.playMenuNav();
    } else if (key === "ArrowUp") {
      this.selectedLevel = Math.max(1, this.selectedLevel - 5);
      this.sfx.playMenuNav();
    } else if (key === "Enter") {
      if (this.selectedLevel <= maxLevel) {
        this.sfx.playMenuSelect();
        this._enterTeacher();
      }
    } else if (key === "Escape") {
      this.state = "menu";
    }
  }

  _enterTeacher() {
    this.teacherTimer = 4; // 4 second countdown
    this.state = "teacher";
  }

    // ── PROFILE CREATION FORM (DOM overlay) ──────────────────

    _onClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const hit = this.renderer.hitTest(px, py);
      if (!hit) return;

      switch (hit.action) {
        case "menu_select": {
          const profiles = this.userManager.getProfiles();
          const idx = hit.data.index;
          if (idx < profiles.length) {
            this.userManager.setActive(idx);
            this.renderer.setLocale(this.userManager.getActive().locale);
            this.selectedLevel = this.userManager.getActive().progress.currentLevel;
            this.state = "levelSelect";
          } else {
            this._showCreateForm();
          }
          break;
        }
        case "level_select": {
          this.selectedLevel = hit.data.level;
          this._enterTeacher();
          break;
        }
        case "pause_option": {
          if (hit.data.index === 0) {
            this.state = "playing";
          } else {
            this.spawner.targets = [];
            this.state = "levelSelect";
          }
          break;
        }
        case "complete_continue": {
          const totalLevels = DICTIONARIES[this.userManager.getActive().locale].levels.length;
          this.state = "levelSelect";
          this.selectedLevel = Math.min(this.selectedLevel + 1, totalLevels);
          break;
        }
        case "complete_retry": {
          this._enterTeacher();
          break;
        }
        case "gameover_retry": {
          this._enterTeacher();
          break;
        }
        case "gameover_menu": {
          this.state = "levelSelect";
          break;
        }
      }
    }

    _createProfileForm() {
    this.formOverlay = document.getElementById("profileForm");
    this.formAlias = document.getElementById("aliasInput");
    this.formLocale = document.getElementById("localeSelect");
    this.formSubmit = document.getElementById("formSubmit");
    this.formCancel = document.getElementById("formCancel");

    if (this.formSubmit) {
      this.formSubmit.addEventListener("click", () => this._submitProfile());
    }
    if (this.formCancel) {
      this.formCancel.addEventListener("click", () => this._hideCreateForm());
    }
    // Enter key in alias field
    if (this.formAlias) {
      this.formAlias.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this._submitProfile();
        if (e.key === "Escape") this._hideCreateForm();
      });
    }
  }

  _showCreateForm() {
    if (this.formOverlay) {
      // Localize form labels
      const strings = getUIStrings(this._uiLocale);
      const h2 = this.formOverlay.querySelector("h2");
      if (h2) h2.textContent = strings.createAlias;
      const labels = this.formOverlay.querySelectorAll("label");
      if (labels[0]) labels[0].textContent = strings.alias;
      if (labels[1]) labels[1].textContent = strings.langKeyboard;
      this.formAlias.placeholder = strings.aliasPlaceholder;
      this.formSubmit.textContent = strings.create;
      this.formCancel.textContent = strings.cancel;
      // Set default locale from system
      this.formLocale.value = this._uiLocale;
      // Localize locale options
      const opts = this.formLocale.options;
      for (let i = 0; i < opts.length; i++) {
        if (opts[i].value === "en-US") opts[i].textContent = strings.optionEN;
        if (opts[i].value === "es-ES") opts[i].textContent = strings.optionES;
      }

      this.formOverlay.classList.add("visible");
      this.formAlias.value = "";
      this.formAlias.focus();
      this.input.enabled = false;
    }
  }

  _hideCreateForm() {
    if (this.formOverlay) {
      this.formOverlay.classList.remove("visible");
      this.input.enabled = true;
    }
  }

  _submitProfile() {
    const alias = this.formAlias.value.trim();
    if (!alias) return;
    const locale = this.formLocale.value;
    this.userManager.createProfile(alias, locale);
    this._hideCreateForm();
    this.menuIndex = this.userManager.getProfiles().length - 1;
    this._uiLocale = locale;
    this.renderer.setLocale(locale);
  }
}

// ── Boot ────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  window.game = new Game();
});
