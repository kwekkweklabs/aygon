export class BattleMechanicsHandler {
  constructor(battleContext, aiProvider) {
    this.context = battleContext;
    this.aiProvider = aiProvider;
  }

  async processAction(action) {
    const battleState = this.context.getBattleState();
    const currentTurn = battleState.currentTurn;

    console.log(`Processing action for turn ${currentTurn}`);

    const judgeAnalysis = await this.getJudgeAnalysis(action, battleState);
    let finalDamage = Math.floor(action.basePower * judgeAnalysis.multiplier);

    // Process existing effects
    this.processStatusEffects(action.actor, currentTurn);
    const statusEffects = this.getActiveEffects(action.actor, currentTurn);

    finalDamage = this.calculateFinalDamage(finalDamage, action, battleState, statusEffects);

    this.context.updateSpecialMeter(action.actor, 15);
    this.context.addToHistory(action);

    // Add new effect if applicable
    if (judgeAnalysis.effect !== 'NONE') {
      const targetActor = Object.keys(battleState.heroes).find(id => id !== action.actor);
      const newEffect = {
        type: judgeAnalysis.effect,
        duration: 2,
        damage: this.getEffectDamage(judgeAnalysis.effect),
        modifier: this.getEffectModifier(judgeAnalysis.effect),
        turnAdded: currentTurn,
        validUntilTurn: currentTurn + 2  // Effect expires after 2 turns
      };

      console.log('Adding new effect:', {
        effect: newEffect,
        currentTurn,
        expiresAt: newEffect.validUntilTurn
      });

      this.addUniqueStatusEffect(targetActor, newEffect, currentTurn);
    }

    return {
      ...action,
      damage: finalDamage,
      effect: judgeAnalysis.effect,
      judgeCommentary: judgeAnalysis.commentary
    };
  }

  processStatusEffects(actorId, currentTurn) {
    console.log(`Processing effects for ${actorId} at turn ${currentTurn}`);

    let effects = this.context.state.statusEffects[actorId] || [];

    console.log('Before processing:', effects);

    // Filter out expired effects using validUntilTurn
    effects = effects.filter(effect => {
      const isActive = currentTurn < effect.validUntilTurn;

      console.log(`Effect ${effect.type} status:`, {
        currentTurn,
        validUntilTurn: effect.validUntilTurn,
        isActive,
        turnsRemaining: effect.validUntilTurn - currentTurn
      });

      return isActive;
    });

    console.log('After processing:', effects);

    // Update the effects in context
    this.context.state.statusEffects[actorId] = effects;
    return effects;
  }

  addUniqueStatusEffect(actorId, newEffect, currentTurn) {
    console.log(`Adding effect for ${actorId} at turn ${currentTurn}`);

    let effects = this.context.state.statusEffects[actorId] || [];

    // Remove existing effect of the same type
    effects = effects.filter(effect => effect.type !== newEffect.type);

    // Ensure all required fields are set
    if (!newEffect.validUntilTurn) {
      newEffect.validUntilTurn = currentTurn + newEffect.duration;
    }

    // Add new effect
    effects.push(newEffect);

    console.log('Updated effects array:', effects);

    // Update effects in context
    this.context.state.statusEffects[actorId] = effects;
  }

  getActiveEffects(actorId, currentTurn) {
    const effects = this.context.state.statusEffects[actorId] || [];

    console.log(`Getting active effects for ${actorId} at turn ${currentTurn}`);

    // Filter effects using validUntilTurn
    const activeEffects = effects.filter(effect => currentTurn < effect.validUntilTurn);

    console.log('Active effects:', activeEffects);

    // Calculate cumulative effects
    return activeEffects.reduce((acc, effect) => ({
      damage: acc.damage + effect.damage,
      modifier: acc.modifier * effect.modifier
    }), { damage: 0, modifier: 1.0 });
  }

  async getJudgeAnalysis(action, battleState) {
    const prompt = `As a battle judge, analyze this combat move considering the full context:

CURRENT BATTLE STATE:
Actor: ${battleState.heroes[action.actor].name}
Actor HP: ${battleState.heroes[action.actor].health}%
Action Type: ${action.actionType}
Description: ${action.description}
Base Power: ${action.basePower}
Tactical Reasoning: ${action.tacticalReasoning}

Previous Actions: ${this.formatPreviousActions(battleState.actionHistory)}
Active Effects: ${this.formatActiveEffects(battleState.statusEffects)}

REQUIREMENTS:
Respond in EXACTLY this format (including the || symbols):
[Effectiveness Multiplier (0.1-2.0)]||[Special Effect (NONE/STUN/BURN/FREEZE/BLEED/WEAKNESS)]||[Judge Commentary]

Consider:
- Move effectiveness given battle context
- Previous actions and their impact
- Status effects and positioning
- Character abilities and limitations

Example Good Responses:
1.2||BURN||A powerful strike that leaves the opponent vulnerable to fire damage.
0.8||NONE||The defensive stance reduces the attack's impact but provides tactical advantage.
1.5||STUN||Perfect timing exploits the opponent's opening for a devastating hit.
0.6||WEAKNESS||The cautious approach limits damage but applies a strategic debuff.`;

    try {
      const response = await this.aiProvider.generate(prompt);

      const cleanResponse = response
        .replace(/^["'{[\s]+|["'}]\s*$/g, '')
        .replace(/[\n\r]+/g, ' ')
        .trim();

      const [multiplierStr, effect, commentary] = cleanResponse.split('||').map(part => part.trim());

      const multiplier = this.validateMultiplier(parseFloat(multiplierStr));
      const validatedEffect = this.validateEffect(effect);

      return {
        multiplier,
        effect: validatedEffect,
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

  validateMultiplier(multiplier) {
    if (isNaN(multiplier)) return 1.0;
    return Math.min(2.0, Math.max(0.1, multiplier));
  }

  validateEffect(effect) {
    const validEffects = ['NONE', 'BURN', 'FREEZE', 'STUN', 'BLEED', 'WEAKNESS'];
    const upperEffect = (effect || '').toUpperCase();
    return validEffects.includes(upperEffect) ? upperEffect : 'NONE';
  }

  formatPreviousActions(history) {
    if (!history || history.length === 0) return 'None';
    return history.slice(-3).map(action =>
      `${action.actor}: ${action.actionType} - ${action.description}`
    ).join(' → ');
  }

  formatActiveEffects(effects) {
    if (!effects) return 'None';
    const currentTurn = this.context.state.currentTurn;

    return Object.entries(effects)
      .map(([heroId, effectList]) => {
        const activeEffects = effectList.filter(effect => {
          const turnsLeft = effect.duration - (currentTurn - effect.turnAdded);
          return turnsLeft > 0;
        });

        return `${heroId}: ${activeEffects.length > 0 ?
          activeEffects.map(e => {
            const turnsLeft = e.duration - (currentTurn - e.turnAdded);
            return `${e.type}(${turnsLeft} turns left)`;
          }).join(', ')
          : 'None'}`;
      }).join(' | ');
  }

  calculateFinalDamage(baseDamage, action, battleState, statusEffects) {
    let damage = baseDamage;

    // Apply status effect modifiers
    damage += statusEffects.damage;
    damage = Math.floor(damage * statusEffects.modifier);

    // Apply combo system
    if (action.targetType === 'OFFENSIVE') {
      const combo = this.context.updateCombo(true);
      if (combo > 2) damage *= 1.2;
    } else {
      this.context.updateCombo(false);
    }

    // Consider defensive actions
    const lastAction = battleState.lastAction;
    if (lastAction && lastAction.actor !== action.actor) {
      if (lastAction.actionType === 'DEFEND' && action.targetType === 'OFFENSIVE') {
        damage *= 0.5;
      }
      if (lastAction.actionType === 'COUNTER' && action.targetType === 'OFFENSIVE') {
        damage *= 0.7;
      }
    }

    return Math.floor(Math.max(1, damage));
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
}