/**
 * Renderer.js
 * Handles all Canvas drawing: background rain, neon glow, particles, UI overlays.
 */

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
      this.ctx = canvas.getContext("2d");

      // Particle pool
      this.particles = [];

    // Clickable hit regions — populated each frame during draw calls
    this.hitRegions = [];

      // Neon palette
      this.NEON = {
        cyan:    "#00E5FF",
        pink:    "#FF4466",
        lime:    "#76FF03",
        yellow:  "#FFEA00",
        orange:  "#FF9F1C",
        white:   "#EEFFFF",
      };

      // Color by difficulty tier
      this.TIER_COLORS = {
        easy:   this.NEON.lime,
        medium: this.NEON.cyan,
        hard:   this.NEON.pink,
        player: this.NEON.yellow,
      };

      // Rain characters (katakana-inspired mix + digits)
      this.RAIN_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";

      // Font
      this.FONT_FAMILY = "'Courier New', Courier, monospace";

        // Pulse timer for animated highlights
          this._pulseTime = 0;

          // Word-complete flash state
          this._flashTimer = 0;
          this._flashColor = "#00E5FF";



      // Locale for UI strings
      this._locale = getSystemLocale();
      this._strings = getUIStrings(this._locale);

      // Matrix rain columns (must be after RAIN_CHARS is set)
      this.columns = [];
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

      /** Set UI locale for all rendered text */
      setLocale(locale) {
        this._locale = locale;
        this._strings = getUIStrings(locale);
      }

      /** Clear hit regions at the start of each frame */
      clearHitRegions() { this.hitRegions = []; }

      /** Register a clickable rectangular area */
      addHitRegion(x, y, w, h, action, data) {
        this.hitRegions.push({ x, y, w, h, action, data });
      }

      /** Test a click point against all hit regions, return first match */
      hitTest(px, py) {
        for (let i = this.hitRegions.length - 1; i >= 0; i--) {
          const r = this.hitRegions[i];
          if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return r;
        }
        return null;
      }

      // ── Resize ───────────────────────────────────────────────

      resize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width  = window.innerWidth  * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      if (this.RAIN_CHARS) this._initRainColumns();
    }

    // ── 3D Matrix Rain ───────────────────────────────────────

      _initRainColumns() {
      const COUNT = 350;
      this.columns = [];
      for (let i = 0; i < COUNT; i++) {
        this.columns.push(this._makeRainDrop(false));
      }
    }

      _makeRainDrop(startFresh = false) {
        // z in (0,1]: 0 = far/tiny, 1 = close/large
        const z = startFresh ? (0.02 + Math.random() * 0.25) : (0.02 + Math.random() * 0.98);
        // x: raw screen-space fraction [0,1] — spread is full width, not perspective-compressed
        const xFrac = Math.random();
        return {
          xFrac,
          z,
          y: startFresh ? -0.05 - Math.random() * 1.2 : Math.random() * 1.4 - 0.2,
          speed: 0.03 + Math.pow(z, 1.2) * 0.65,
          ch: this.RAIN_CHARS[Math.floor(Math.random() * this.RAIN_CHARS.length)],
          changeTimer: Math.random() * 0.25,
        };
      }

  /** Draw a pulsing neon bounding box around a selected item */
  drawNeonHighlight(x, y, w, h, color = this.NEON.cyan) {
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(this._pulseTime * 4);
    const alpha = 0.4 + pulse * 0.6;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 + pulse * 12;
    ctx.lineWidth = 2;
    this._roundRect(x, y, w, h, 6);
    ctx.stroke();
    ctx.restore();

    // Subtle inner glow fill
    ctx.save();
    ctx.globalAlpha = 0.04 + pulse * 0.04;
    ctx.fillStyle = color;
    this._roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.restore();
  }

        drawRainBackground(dt, pressedKeys = null) {
          const ctx = this.ctx;
          this._pulseTime += dt;

          const W = this.W, H = this.H;
          const cx = W * 0.5;
          const cy = H * 0.38;   // vanishing point slightly above centre

          // Advance flash timer
          if (this._flashTimer > 0) {
            this._flashTimer -= dt;
            if (this._flashTimer < 0) this._flashTimer = 0;
          }

          // Build set of characters being pressed this frame
          const pressedChars = new Set();
          if (pressedKeys) {
            for (const k of pressedKeys) {
              if (k.length === 1) {
                pressedChars.add(k.toLowerCase());
                pressedChars.add(k.toUpperCase());
              }
            }
          }

          // Full clear each frame
          ctx.fillStyle = "#050510";
          ctx.fillRect(0, 0, W, H);

          // Radial glow at vanishing point
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.55);
          grad.addColorStop(0,   "rgba(0,229,255,0.07)");
          grad.addColorStop(0.5, "rgba(0,40,70,0.03)");
          grad.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Sort back-to-front
          this.columns.sort((a, b) => a.z - b.z);

          // Flash colour (null = no flash)
          const flashActive = this._flashTimer > 0;
          const flashProgress = flashActive ? (this._flashTimer / 0.5) : 0; // 0..1

          for (const col of this.columns) {
            // Mutate character
            col.changeTimer -= dt;
            if (col.changeTimer <= 0) {
              col.ch = this.RAIN_CHARS[Math.floor(Math.random() * this.RAIN_CHARS.length)];
              col.changeTimer = 0.04 + Math.random() * 0.18;
            }
            col.y += col.speed * dt;

             // Perspective projection — x is screen-space, y converges toward vanishing point
              const sz  = 0.08 + col.z * 0.92;
              const sx  = col.xFrac * W;
              const sy  = cy + (col.y - 0.25) * H * 1.1 * sz;
              const size = Math.max(7, Math.round(7 + col.z * 30));

            // Recycle when drop falls off the bottom
            if (sy > H + size * 2) {
              Object.assign(col, this._makeRainDrop(true));
              continue;
            }

            const isKeyPressed = pressedChars.has(col.ch);
            const baseAlpha = 0.08 + col.z * 0.80;

            // Base depth color
            const band = Math.floor(col.z * 4);
            const depthColors = ["#00E5FF", "#76FF03", "#FF4466", "#FFEA00"];
            let baseColor = depthColors[band % depthColors.length];
            let glowBlur = col.z > 0.6 ? 14 : col.z > 0.3 ? 7 : 2;

            // Word-complete flash: tint all drops toward flash color
            if (flashActive) {
              baseColor = this._flashColor;
              glowBlur = 4 + flashProgress * 22;
            }

            if (isKeyPressed) {
              baseColor = "#FFFFFF";
              glowBlur = 22;
            }

            const alpha = isKeyPressed ? 1.0
                        : flashActive  ? Math.min(1, baseAlpha + flashProgress * 0.55)
                        : baseAlpha;

            ctx.save();
            ctx.globalAlpha = Math.min(1, alpha);
            ctx.font = `bold ${size}px ${this.FONT_FAMILY}`;
            ctx.fillStyle = baseColor;
            ctx.shadowColor = baseColor;
            ctx.shadowBlur  = glowBlur;
            ctx.textAlign   = "center";
            ctx.fillText(col.ch, sx, sy);

            // Extra glow pass for pressed keys
            if (isKeyPressed) {
              ctx.shadowBlur = 40;
              ctx.globalAlpha = 0.5;
              ctx.fillText(col.ch, sx, sy);
            }

            ctx.restore();
          }

          ctx.textAlign = "left";
        }

        /** Call on word completion to flash all rain with accuracy-based colour */
        triggerWordFlash(accuracy) {
          this._flashColor = accuracy >= 95 ? "#76FF03"   // lime  — perfect
                           : accuracy >= 75 ? "#00E5FF"   // cyan  — good
                           : accuracy >= 50 ? "#FFEA00"   // yellow — ok
                           :                  "#FF4466";  // pink  — poor
          this._flashTimer = 0.5; // seconds
        }

  // ── Clear (full opaque) ──────────────────────────────────

  clearFull() {
    this.ctx.fillStyle = "#0a0a0f";
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // ── Falling Targets ──────────────────────────────────────

  drawTargets(targets) {
    const ctx = this.ctx;
    for (const t of targets) {
      const color = this.TIER_COLORS[t.tier] || this.NEON.cyan;
      const fontSize = t.fontSize || 28;
      ctx.font = `bold ${fontSize}px ${this.FONT_FAMILY}`;

      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      // Draw each character
      for (let i = 0; i < t.text.length; i++) {
          const ch = t.text[i];
        const cx = t.x + i * fontSize * 0.65;

        if (i < t.typed) {
          // Already typed — dim
          ctx.fillStyle = "rgba(255,255,255,0.15)";
        } else if (i === t.typed) {
          // Next to type — bright white
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = 12;
        }

        ctx.fillText(ch, cx, t.y);
      }

      ctx.shadowBlur = 0;
    }
  }

  // ── Particles ────────────────────────────────────────────

  spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  updateAndDrawParticles(dt) {
    const ctx = this.ctx;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ── HUD ──────────────────────────────────────────────────

  drawHUD(state) {
    const ctx = this.ctx;
    const { level, levelName, health, score, wpm, accuracy } = state;

    ctx.shadowBlur = 0;
    ctx.font = `bold 16px ${this.FONT_FAMILY}`;

    // Top-left: Level
    ctx.fillStyle = this.NEON.cyan;
    ctx.fillText(`${this._strings.level} ${level}`, 20, 30);
    ctx.font = `14px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.white;
    ctx.fillText(levelName, 20, 50);

    // Top-right: Score
    ctx.font = `bold 16px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.yellow;
    ctx.textAlign = "right";
    ctx.fillText(`${this._strings.score}: ${score}`, this.W - 20, 30);

    // WPM & Accuracy
    ctx.font = `14px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.white;
    ctx.fillText(`${this._strings.wpm}: ${wpm}  ${this._strings.acc}: ${accuracy}%`, this.W - 20, 50);
    ctx.textAlign = "left";

    // Health bar (bottom)
    this._drawHealthBar(health);
  }

  _drawHealthBar(health) {
    const ctx = this.ctx;
    const barW = 300;
    const barH = 12;
    const x = (this.W - barW) / 2;
    const y = this.H - 30;

    // Background
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x, y, barW, barH);

    // Fill
    const pct = Math.max(0, Math.min(1, health / 100));
    const color = pct > 0.5 ? this.NEON.lime :
                  pct > 0.25 ? this.NEON.yellow : this.NEON.pink;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillRect(x, y, barW * pct, barH);
    ctx.shadowBlur = 0;

    // Label
    ctx.font = `bold 11px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.white;
    ctx.textAlign = "center";
    ctx.fillText(`${this._strings.systemIntegrity}: ${Math.round(health)}%`, this.W / 2, y - 6);
    ctx.textAlign = "left";
  }

  // ── Screen Shake (glitch) ────────────────────────────────

  applyShake(intensity = 4) {
    this._shakeTime = 0.15;
    this._shakeIntensity = intensity;
  }

  updateShake(dt) {
    if (this._shakeTime > 0) {
      this._shakeTime -= dt;
      const dx = (Math.random() - 0.5) * this._shakeIntensity * 2;
      const dy = (Math.random() - 0.5) * this._shakeIntensity * 2;
      this.canvas.style.transform = `translate(${dx}px, ${dy}px)`;
    } else {
      this.canvas.style.transform = "";
    }
  }

  // ── Menu Screen ──────────────────────────────────────────

  drawMenuScreen(profiles, selectedIndex, mode) {
    this.drawRainBackground(0.016);
    const ctx = this.ctx;

    // Darken overlay so UI text doesn't ghost-trail
    ctx.fillStyle = "rgba(10, 10, 15, 0.75)";
    ctx.fillRect(0, 60, this.W, this.H - 100);

    // Title
    ctx.shadowColor = this.NEON.cyan;
    ctx.shadowBlur = 20;
    ctx.font = `bold 48px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.cyan;
    ctx.textAlign = "center";
    ctx.fillText(this._strings.title, this.W / 2, 100);

    ctx.shadowColor = this.NEON.pink;
    ctx.font = `bold 24px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.pink;
    ctx.fillText(this._strings.subtitle, this.W / 2, 135);
    ctx.shadowBlur = 0;

    if (mode === "select") {
      this._drawProfileSelect(profiles, selectedIndex);
    } else if (mode === "create") {
      // Handled by DOM overlay
    }

    ctx.textAlign = "left";
  }

    _drawProfileSelect(profiles, selectedIndex) {
      const ctx = this.ctx;
      const startY = 200;

      ctx.font = `18px ${this.FONT_FAMILY}`;
      ctx.fillStyle = this.NEON.white;
      ctx.textAlign = "center";
      ctx.fillText(this._strings.selectAlias, this.W / 2, startY);

      // Profile list
      for (let i = 0; i < profiles.length; i++) {
        const p = profiles[i];
        const y = startY + 50 + i * 45;
        const isSelected = i === selectedIndex;

        const boxX = this.W / 2 - 200;
        const boxY = y - 25;
        const boxW = 400;
        const boxH = 40;

      if (isSelected) {
            ctx.fillStyle = "rgba(0, 229, 255, 0.1)";
            ctx.fillRect(boxX, boxY, boxW, boxH);
            this.drawNeonHighlight(boxX, boxY, boxW, boxH, this.NEON.cyan);
            ctx.fillStyle = this.NEON.cyan;
            ctx.font = `bold 20px ${this.FONT_FAMILY}`;
          } else {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = `18px ${this.FONT_FAMILY}`;
        }

        const locale = p.locale === "es-ES" ? "ES" : "EN";
        ctx.fillText(`${p.alias}  [${locale}]  Lv.${p.progress.currentLevel}`, this.W / 2, y);

        // Register clickable hit region
        this.addHitRegion(boxX, boxY, boxW, boxH, "menu_select", { index: i });
      }

      // New profile option
      const newY = startY + 50 + profiles.length * 45;
      const isNewSelected = selectedIndex === profiles.length;
      ctx.font = isNewSelected ? `bold 20px ${this.FONT_FAMILY}` : `18px ${this.FONT_FAMILY}`;
      ctx.fillStyle = isNewSelected ? this.NEON.lime : "rgba(255,255,255,0.5)";
      ctx.fillText(this._strings.createNew, this.W / 2, newY);

        const newBoxX = this.W / 2 - 200;
        const newBoxY = newY - 25;
        if (isNewSelected) {
          this.drawNeonHighlight(newBoxX, newBoxY, 400, 40, this.NEON.lime);
        }
        this.addHitRegion(newBoxX, newBoxY, 400, 40, "menu_select", { index: profiles.length });

      // Instructions
      ctx.font = `14px ${this.FONT_FAMILY}`;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(this._strings.navSelect, this.W / 2, this.H - 40);

      ctx.textAlign = "left";
    }

  // ── Level Select Screen ──────────────────────────────────

  drawLevelSelect(levels, currentLevel, selectedLevel) {
    this.drawRainBackground(0.016);
    const ctx = this.ctx;

    // Darken overlay so grid text doesn't ghost-trail
    ctx.fillStyle = "rgba(10, 10, 15, 0.75)";
    ctx.fillRect(0, 30, this.W, this.H - 60);

    ctx.shadowColor = this.NEON.cyan;
    ctx.shadowBlur = 15;
    ctx.font = `bold 32px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.cyan;
    ctx.textAlign = "center";
    ctx.fillText(this._strings.selectMission, this.W / 2, 60);
    ctx.shadowBlur = 0;

    const cols = 5;
    const cellW = 140;
    const cellH = 70;
    const gridW = cols * cellW;
    const startX = (this.W - gridW) / 2;
    const startY = 100;

    for (let i = 0; i < levels.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const lvl = levels[i];
      const unlocked = lvl.id <= currentLevel;
      const selected = lvl.id === selectedLevel;

      // Box
      ctx.strokeStyle = selected ? this.NEON.cyan :
                        unlocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)";
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(x + 5, y + 5, cellW - 10, cellH - 10);

        if (selected) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          ctx.fillRect(x + 5, y + 5, cellW - 10, cellH - 10);
          this.drawNeonHighlight(x + 5, y + 5, cellW - 10, cellH - 10, this.NEON.cyan);
        }

      // Level number
      ctx.font = `bold 22px ${this.FONT_FAMILY}`;
      ctx.fillStyle = unlocked ? (selected ? this.NEON.cyan : this.NEON.white) : "rgba(255,255,255,0.15)";
      ctx.fillText(lvl.id.toString(), x + cellW / 2, y + 35);

      // Level name (truncated)
      ctx.font = `11px ${this.FONT_FAMILY}`;
      ctx.fillStyle = unlocked ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)";
      const name = lvl.name.length > 16 ? lvl.name.substring(0, 15) + "…" : lvl.name;
      ctx.fillText(name, x + cellW / 2, y + 55);

        // Lock icon
        if (!unlocked) {
          ctx.font = `18px ${this.FONT_FAMILY}`;
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillText("🔒", x + cellW / 2, y + 35);
        }

        // Register clickable hit region for unlocked levels
        if (unlocked) {
          this.addHitRegion(x + 5, y + 5, cellW - 10, cellH - 10, "level_select", { level: lvl.id });
        }
      }

    // Instructions
    ctx.font = `14px ${this.FONT_FAMILY}`;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(this._strings.navMission, this.W / 2, this.H - 40);

    ctx.textAlign = "left";
  }

  // ── Teacher Keyboard Overlay ─────────────────────────────

    drawKeyboardOverlay(layout, activeKeys, levelNewKeys, pressedKeys = new Set()) {
      const ctx = this.ctx;
      const keyW = 48;
      const keyH = 44;
      const gap = 4;
      const rows = layout.rows;
      const totalW = 14.5 * (keyW + gap);
      const startX = (this.W - totalW) / 2;
      const startY = this.H - rows.length * (keyH + gap) - 60;

      // Semi-transparent background
      ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
      ctx.fillRect(startX - 10, startY - 10, totalW + 20, rows.length * (keyH + gap) + 20);

      for (let r = 0; r < rows.length; r++) {
        let xOff = 0;
        for (const key of rows[r].keys) {
          const w = key.width * (keyW + gap) - gap;
          const x = startX + xOff;
          const y = startY + r * (keyH + gap);

          const isPressed = pressedKeys.has(key.normal) || pressedKeys.has(key.shift) ||
                            (key.normal === " " && pressedKeys.has(" "));
          const isActive = activeKeys.has(key.normal) || activeKeys.has(key.shift);
          const isNew = levelNewKeys.has(key.normal) || levelNewKeys.has(key.shift);

          // Key background
          if (isPressed) {
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
          } else if (isNew) {
            ctx.fillStyle = FINGER_COLORS[key.finger] + "55";
            ctx.strokeStyle = FINGER_COLORS[key.finger];
            ctx.lineWidth = 2;
          } else if (isActive) {
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 1;
          } else {
            ctx.fillStyle = "rgba(255,255,255,0.03)";
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.lineWidth = 1;
          }

          // Rounded rect
          this._roundRect(x, y, w, keyH, 4);
          ctx.fill();
          ctx.stroke();

          // Pressed glow
          if (isPressed) {
            ctx.save();
            ctx.shadowColor = "#FFFFFF";
            ctx.shadowBlur = 14;
            this._roundRect(x, y, w, keyH, 4);
            ctx.stroke();
            ctx.restore();
          }

          // Key label
          const label = key.normal === " " ? "SPACE" : key.normal;
          ctx.font = w > keyW ? `11px ${this.FONT_FAMILY}` : `13px ${this.FONT_FAMILY}`;
          ctx.fillStyle = isPressed ? "#FFFFFF" :
                          isNew ? FINGER_COLORS[key.finger] :
                          isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)";
          ctx.textAlign = "center";
          ctx.fillText(label, x + w / 2, y + keyH / 2 + 4);

          // Finger dot for new keys
          if (isNew && !isPressed) {
            ctx.beginPath();
            ctx.arc(x + w / 2, y + keyH - 8, 3, 0, Math.PI * 2);
            ctx.fillStyle = FINGER_COLORS[key.finger];
            ctx.fill();
          }

          xOff += key.width * (keyW + gap);
        }
      }

      ctx.textAlign = "left";
    }

  _roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Pause Screen ─────────────────────────────────────────

  drawPauseScreen(selectedIndex) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(10, 10, 15, 0.8)";
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.textAlign = "center";
    ctx.shadowColor = this.NEON.yellow;
    ctx.shadowBlur = 20;
    ctx.font = `bold 42px ${this.FONT_FAMILY}`;
    ctx.fillStyle = this.NEON.yellow;
    ctx.fillText(this._strings.paused, this.W / 2, this.H / 2 - 60);
    ctx.shadowBlur = 0;

      const options = [this._strings.pauseContinue, this._strings.pauseQuit];
        for (let i = 0; i < options.length; i++) {
          const y = this.H / 2 + i * 50;
          const selected = i === selectedIndex;
          ctx.font = selected ? `bold 24px ${this.FONT_FAMILY}` : `22px ${this.FONT_FAMILY}`;
          ctx.fillStyle = selected ? this.NEON.cyan : "rgba(255,255,255,0.4)";
          if (selected) {
            ctx.fillStyle = this.NEON.cyan;
            ctx.shadowColor = this.NEON.cyan;
            ctx.shadowBlur = 10;
            this.drawNeonHighlight(this.W / 2 - 150, y - 25, 300, 40, this.NEON.cyan);
          }
          ctx.fillText(options[i], this.W / 2, y);
          ctx.shadowBlur = 0;

        // Clickable region
        this.addHitRegion(this.W / 2 - 150, y - 25, 300, 40, "pause_option", { index: i });
      }

    ctx.font = `14px ${this.FONT_FAMILY}`;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(this._strings.pauseNav, this.W / 2, this.H / 2 + 130);
    ctx.textAlign = "left";
  }

  // ── Level Complete / Game Over ───────────────────────────

    drawLevelComplete(stats, selectedIndex) {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
      ctx.fillRect(0, 0, this.W, this.H);

      ctx.textAlign = "center";
      ctx.shadowColor = this.NEON.lime;
      ctx.shadowBlur = 20;
      ctx.font = `bold 42px ${this.FONT_FAMILY}`;
      ctx.fillStyle = this.NEON.lime;
      ctx.fillText(this._strings.missionComplete, this.W / 2, this.H / 2 - 80);
      ctx.shadowBlur = 0;

      ctx.font = `22px ${this.FONT_FAMILY}`;
      ctx.fillStyle = this.NEON.white;
      ctx.fillText(`${this._strings.score}: ${stats.score}`, this.W / 2, this.H / 2 - 20);
      ctx.fillText(`${this._strings.wpm}: ${stats.wpm}   ${this._strings.acc}: ${stats.accuracy}%`, this.W / 2, this.H / 2 + 15);

      // Stars
      const stars = stats.stars || 0;
      ctx.font = `36px ${this.FONT_FAMILY}`;
      const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
      ctx.fillStyle = this.NEON.yellow;
      ctx.fillText(starStr, this.W / 2, this.H / 2 + 65);

        // Buttons
        const btnY = this.H / 2 + 105;
        ctx.font = `bold 20px ${this.FONT_FAMILY}`;

        // Continue button
        const continueSelected = selectedIndex === 0;
        ctx.fillStyle = continueSelected ? this.NEON.cyan : "rgba(255,255,255,0.4)";
        ctx.fillText(this._strings.continue, this.W / 2 - 100, btnY);
        if (continueSelected) {
          this.drawNeonHighlight(this.W / 2 - 200, btnY - 22, 200, 35, this.NEON.cyan);
        }
        this.addHitRegion(this.W / 2 - 200, btnY - 22, 200, 35, "complete_continue", {});

        // Retry button
        const retrySelected = selectedIndex === 1;
        ctx.fillStyle = retrySelected ? this.NEON.orange : "rgba(255,255,255,0.4)";
        ctx.fillText(this._strings.retry, this.W / 2 + 100, btnY);
        if (retrySelected) {
          this.drawNeonHighlight(this.W / 2, btnY - 22, 200, 35, this.NEON.orange);
        }
        this.addHitRegion(this.W / 2, btnY - 22, 200, 35, "complete_retry", {});

      ctx.font = `14px ${this.FONT_FAMILY}`;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(this._strings.completeNav, this.W / 2, btnY + 35);

      ctx.textAlign = "left";
    }

    drawGameOver(selectedIndex) {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(10, 10, 15, 0.9)";
      ctx.fillRect(0, 0, this.W, this.H);

      ctx.textAlign = "center";
      ctx.shadowColor = this.NEON.pink;
      ctx.shadowBlur = 25;
      ctx.font = `bold 42px ${this.FONT_FAMILY}`;
      ctx.fillStyle = this.NEON.pink;
      ctx.fillText(this._strings.systemBreach, this.W / 2, this.H / 2 - 40);
      ctx.shadowBlur = 0;

      ctx.font = `18px ${this.FONT_FAMILY}`;
      ctx.fillStyle = this.NEON.white;
      ctx.fillText(this._strings.missionFailed, this.W / 2, this.H / 2 + 10);

        // Buttons
        const btnY = this.H / 2 + 55;
        ctx.font = `bold 20px ${this.FONT_FAMILY}`;

        // Retry button
        const retrySelected = selectedIndex === 0;
        ctx.fillStyle = retrySelected ? this.NEON.orange : "rgba(255,255,255,0.4)";
        ctx.fillText(this._strings.retry, this.W / 2 - 80, btnY);
        if (retrySelected) {
          this.drawNeonHighlight(this.W / 2 - 180, btnY - 22, 200, 35, this.NEON.orange);
        }
        this.addHitRegion(this.W / 2 - 180, btnY - 22, 200, 35, "gameover_retry", {});

        // Menu button
        const menuSelected = selectedIndex === 1;
        ctx.fillStyle = menuSelected ? this.NEON.cyan : "rgba(255,255,255,0.4)";
        ctx.fillText(this._strings.menu, this.W / 2 + 80, btnY);
        if (menuSelected) {
          this.drawNeonHighlight(this.W / 2 - 20, btnY - 22, 200, 35, this.NEON.cyan);
        }
        this.addHitRegion(this.W / 2 - 20, btnY - 22, 200, 35, "gameover_menu", {});

      ctx.font = `14px ${this.FONT_FAMILY}`;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(this._strings.gameOverNav, this.W / 2, btnY + 35);

      ctx.textAlign = "left";
    }
}
