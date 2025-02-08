import { COMBAT_ACTIONS } from '../constants/types.js';
import { EFFECTS } from '../constants/types.js';

export class BattleMechanicsHandler {
  constructor(battleContext, aiProvider) {
    this.context = battleContext;
    this.aiProvider = aiProvider;
  }

  determineActionType(attacker, defender) {
    const actions = Object.values(COMBAT_ACTIONS);
    const specialMeter = this.context.getSpecialMeter(attacker.id);

    if (specialMeter >= 100) return COMBAT_ACTIONS.SPECIAL;
    if (attacker.hp < 30 && Math.random() < 0.4) return COMBAT_ACTIONS.DEFEND;
    if (this.context.state.lastAction?.type === COMBAT_ACTIONS.ATTACK && Math.random() < 0.3)
      return COMBAT_ACTIONS.COUNTER;
    if (this.context.state.combo > 2 && Math.random() < 0.4) return COMBAT_ACTIONS.DODGE;

    return actions[Math.floor(Math.random() * (actions.length - 1))];
  }

  async processAction(action, attacker, defender) {
    const judgeAnalysis = await this.getJudgeAnalysis(action, attacker, defender);
    let finalDamage = Math.floor(action.damage * judgeAnalysis.multiplier);

    const statusEffects = this.context.processStatusEffects(defender.id);
    finalDamage += statusEffects.damage;
    finalDamage = Math.floor(finalDamage * statusEffects.modifier);

    if (action.type === COMBAT_ACTIONS.ATTACK) {
      const combo = this.context.updateCombo(true);
      if (combo > 2) {
        finalDamage *= 1.2;
      }
    } else {
      this.context.updateCombo(false);
    }

    this.context.updateSpecialMeter(attacker.id, 15);
    this.context.setLastAction(action);

    if (judgeAnalysis.effect !== 'NONE') {
      this.context.addStatusEffect(defender.id, {
        type: judgeAnalysis.effect,
        duration: 2,
        damage: this.getEffectDamage(judgeAnalysis.effect),
        modifier: this.getEffectModifier(judgeAnalysis.effect)
      });
    }

    return {
      ...action,
      damage: finalDamage,
      effect: judgeAnalysis.effect,
      judgeCommentary: judgeAnalysis.commentary
    };
  }

  getEffectDamage(effect) {
    const damages = {
      BURN: 5,
      BLEED: 4,
      FREEZE: 3,
      STUN: 0,
      WEAKNESS: 0
    };
    return damages[effect] || 0;
  }

  getEffectModifier(effect) {
    const modifiers = {
      STUN: 0.7,
      BURN: 0.9,
      FREEZE: 0.8,
      BLEED: 0.85,
      WEAKNESS: 0.75
    };
    return modifiers[effect] || 1.0;
  }

  async getJudgeAnalysis(action, attacker, defender) {
    const prompt = `As a wise and fair battle judge, analyze this combat move and determine its true effects:

    CURRENT BATTLE STATE:
    - Attacker: ${attacker.name} (${attacker.description})
    - Defender: ${defender.name} (${defender.description})
    - Attacker HP: ${attacker.hp}%
    - Defender HP: ${defender.hp}%
    - Last Action Type: ${this.context.state.lastAction?.type || 'None'}
    - Current Combo: ${this.context.state.combo}

    PROPOSED MOVE:
    Type: ${action.type}
    Description: ${action.text}
    Base Damage: ${action.damage}

    JUDGE REQUIREMENTS:
    1. Analyze the move's true effectiveness based on:
      - Move complexity and setup time
      - Character abilities and limitations
      - Current battle situation
      - Natural counters and vulnerabilities
    2. Provide commentary that explains the move's effects
    3. Balance powerful moves with realistic limitations
    4. Realistically simulate the move's impact on the battle
    5. The attack can have special effects like ${EFFECTS.join(', ')}
    6. Keep the commentary concise and relevant, avoid unnecessary details and keep it short and simple yet fun

    Respond in this format:
    [Effectiveness Multiplier (0.1-2.0)]||[Special Effect (NONE/STUN/BURN/FREEZE/etc)]||[Judge Commentary]`;

    try {
      const response = await this.aiProvider.generate(prompt);
      let [multiplier, effect, commentary] = response
        .replace(/^["'{[\s]+|["'}]\s*$/g, '')
        .split('||')
        .map(part => part.trim());

      multiplier = parseFloat(multiplier) || 1.0;
      multiplier = Math.min(2.0, Math.max(0.1, multiplier));

      const validEffects = EFFECTS;
      effect = validEffects.includes(effect) ? effect : 'NONE';

      return {
        multiplier,
        effect,
        commentary: commentary || 'The judge observes the exchange carefully.'
      };
    } catch (error) {
      console.error('Judge Analysis Error:', error);
      return {
        multiplier: 1.0,
        effect: 'NONE',
        commentary: 'The judge maintains balance in the battle.'
      };
    }
  }
}