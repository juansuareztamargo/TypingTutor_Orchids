/**
 * UserManager.js
 * Handles localStorage persistence for user profiles.
 */

class UserManager {
  constructor() {
    this.STORAGE_KEY = "neonstream_profiles";
    this.profiles = this._load();
    this.activeProfile = null;
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("UserManager: failed to load profiles", e);
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn("UserManager: failed to save profiles", e);
    }
  }

  getProfiles() {
    return this.profiles;
  }

  createProfile(alias, locale) {
    const profile = {
      alias: alias.trim().substring(0, 20),
      createdAt: Date.now(),
      locale: locale,
      progress: {
        currentLevel: 1,
        scores: {},
      },
    };
    this.profiles.push(profile);
    this._save();
    return profile;
  }

  deleteProfile(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.profiles.splice(index, 1);
      this._save();
    }
  }

  setActive(index) {
    if (index >= 0 && index < this.profiles.length) {
      this.activeProfile = this.profiles[index];
      return this.activeProfile;
    }
    return null;
  }

  getActive() {
    return this.activeProfile;
  }

  /**
   * Save level completion results.
   * Unlocks next level if this was the highest unlocked.
   */
  saveLevelResult(levelId, wpm, accuracy, score) {
    const p = this.activeProfile;
    if (!p) return;

    const stars = this._calcStars(accuracy, wpm);

    const prev = p.progress.scores[levelId];
    if (!prev || score > (prev.bestScore || 0)) {
      p.progress.scores[levelId] = {
        bestWpm: Math.max(wpm, prev ? prev.bestWpm : 0),
        bestAcc: Math.max(accuracy, prev ? prev.bestAcc : 0),
        bestScore: Math.max(score, prev ? prev.bestScore || 0 : 0),
        stars: Math.max(stars, prev ? prev.stars : 0),
      };
    }

    // Unlock next level
    if (levelId >= p.progress.currentLevel && stars >= 1) {
      const totalLevels = DICTIONARIES[p.locale] ? DICTIONARIES[p.locale].levels.length : 20;
      p.progress.currentLevel = Math.min(levelId + 1, totalLevels);
    }

    this._save();
  }

  _calcStars(accuracy, wpm) {
    let stars = 0;
    if (accuracy >= 60) stars = 1;
    if (accuracy >= 80 && wpm >= 10) stars = 2;
    if (accuracy >= 95 && wpm >= 20) stars = 3;
    return stars;
  }
}
