import { BATTLE_EVENTS } from '../constants/types.js';
import { BattleEventEmitter } from './BattleEventEmitter.js';

export class BattleContextManager extends BattleEventEmitter {
  constructor() {
    super();
    this.state = {
      turn: 0,
      combo: 0,
      lastAction: null,
      commentary: [],
      maxCommentary: 5,
      specialMeters: new Map(),
      statusEffects: new Map(),
      battleLog: [],
      battleState: 'ACTIVE' // ACTIVE, ENDED
    };
  }

  getState() {
    return {
      ...this.state,
      specialMeters: Object.fromEntries(this.state.specialMeters),
      statusEffects: Object.fromEntries(this.state.statusEffects)
    };
  }

  initializeHero(heroId) {
    this.state.specialMeters.set(heroId, 0);
    this.state.statusEffects.set(heroId, []);
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
  }

  updateSpecialMeter(heroId, amount) {
    const current = this.state.specialMeters.get(heroId) || 0;
    this.state.specialMeters.set(heroId, Math.min(100, current + amount));
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
  }

  getSpecialMeter(heroId) {
    return this.state.specialMeters.get(heroId) || 0;
  }

  addCommentary(text) {
    this.state.commentary.push(text);
    if (this.state.commentary.length > this.state.maxCommentary) {
      this.state.commentary.shift();
    }
    this.emit(BATTLE_EVENTS.COMMENTARY_ADDED, text);
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
  }

  getCommentary() {
    return [...this.state.commentary];
  }

  updateCombo(isComboAction) {
    if (isComboAction) {
      this.state.combo++;
    } else {
      this.state.combo = 0;
    }
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
    return this.state.combo;
  }

  setLastAction(action) {
    this.state.lastAction = action;
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
  }

  addStatusEffect(heroId, effect) {
    const effects = this.state.statusEffects.get(heroId) || [];
    effects.push({ ...effect, duration: effect.duration || 2 });
    this.state.statusEffects.set(heroId, effects);
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
  }

  processStatusEffects(heroId) {
    const effects = this.state.statusEffects.get(heroId) || [];
    let totalDamage = 0;
    let modifiers = [];

    const remainingEffects = effects.filter(effect => {
      if (effect.duration > 0) {
        effect.duration--;
        if (effect.damage) totalDamage += effect.damage;
        if (effect.modifier) modifiers.push(effect.modifier);
        return true;
      }
      return false;
    });

    this.state.statusEffects.set(heroId, remainingEffects);
    this.emit(BATTLE_EVENTS.STATE_UPDATED, this.getState());
    
    return {
      damage: totalDamage,
      modifier: modifiers.reduce((acc, mod) => acc * mod, 1)
    };
  }
}