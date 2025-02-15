import { SOUND_EFFECT } from "../constants/types.js";

export class AIActionGenerator {
  constructor(battleContext, aiProvider) {
    this.context = battleContext;
    this.aiProvider = aiProvider;
  }


  generateActionPrompt(actor, state) {
    // Get the acting hero and find the opponent
    const heroStates = state.heroStates || {};
    const actingHero = heroStates[actor];
    const opponentId = Object.keys(heroStates).find(id => id !== actor);
    const opponent = heroStates[opponentId];

    if (!actingHero || !opponent) {
      console.error('Missing hero data:', { actingHero, opponent, state });
      throw new Error('Incomplete battle state - missing hero data');
    }

    return `You are an autonomous battle AI that makes tactical combat decisions. Analyze the current battle state and determine the next action:

CURRENT BATTLE STATE:
${actor}'s Status:
- Name: ${actingHero.name}
- Description: ${actingHero.description}
- Current HP: ${actingHero.hp}%
- Position: ${state.lastAction?.actor === actor ? 'Just acted' : 'Waiting to act'}

Opponent Status:
- Name: ${opponent.name}
- Description: ${opponent.description}
- Current HP: ${opponent.hp}%
- Their last action: ${state.lastAction ? this.formatLastAction(state.lastAction) : 'None'}

Battle Context:
- Current turn: ${state.currentTurn}
- Last 3 moves: ${this.formatBattleHistory(state.actionHistory, 3)}
- Special meter: ${state.specialMeters?.[actor] || actingHero.specialMeter || 0}%
- Active effects on you: ${this.formatEffects(state.statusEffects?.[actor] || actingHero.effects)}
- Active effects on opponent: ${this.formatEffects(state.statusEffects?.[opponentId] || opponent.effects)}

TACTICAL CONSIDERATIONS:
1. React to opponent's previous moves and current state
2. Consider your character's abilities and current condition
3. Plan moves that build upon your previous actions
4. Account for any active status effects
5. Use special moves strategically when meter is full

Respond in EXACTLY this format (including the || symbols):
[Action Type]||[5-15 word Description]||[OFFENSIVE/DEFENSIVE/TACTICAL]||[Base Power 8-22]||[Emoji1,Emoji2,Emoji3]||[Sound Effects]||[Tactical Reasoning]

Action Types can be: ATTACK, DEFEND, COUNTER, SPECIAL, or create a new type if tactically appropriate.

Available Sound Effects:
- hammer.mp3: A solid, metallic sound of a hammer striking a surface
- bomb-explode.mp3: A dramatic explosion sound reminiscent of a bomb detonation
- whoosh.mp3: A swift, airy sound that evokes rapid movement through the air

Select 1-3 sound effects that match your action's intensity and style.

EXAMPLE RESPONSES:
ATTACK||Launches a rapid series of precision strikes||OFFENSIVE||18||⚔️,💨,🎯||whoosh.mp3,hammer.mp3||Exploiting opponent's defensive gap after their last move
DEFEND||Creates an energy barrier while studying opponent||DEFENSIVE||12||🛡️,✨||hammer.mp3||Building defensive momentum while special meter charges
COUNTER||Redirects opponent's energy back with double force||OFFENSIVE||20||↩️,💥||whoosh.mp3,bomb-explode.mp3||Perfect timing to punish aggressive approach
SPECIAL||Unleashes devastating ultimate technique||OFFENSIVE||22||🌟,⚡️,💫||whoosh.mp3,bomb-explode.mp3,hammer.mp3||Special meter full and opponent is vulnerable`;
  }

  formatLastAction(action) {
    return `${action.actionType}: ${action.description} (Power: ${action.basePower})`;
  }

  formatBattleHistory(history, count) {
    if (!history || history.length === 0) return 'None';
    return history
      .slice(-count)
      .map(action => `${action.actor}: ${action.actionType}`)
      .join(' → ');
  }

  formatEffects(effects) {
    if (!effects || effects.length === 0) return 'None';
    return effects
      .map(effect => `${effect.type} (${effect.duration} turns left)`)
      .join(', ');
  }

  async getAIAction(actor, battleState) {
    try {
      const prompt = this.generateActionPrompt(actor, battleState);
      const response = await this.aiProvider.generate(prompt);

      // Clean up the response
      const cleanResponse = response
        .replace(/^["'{[\s]+|["'}]\s*$/g, '')
        .replace(/[\n\r]+/g, ' ')
        .trim();

      // Split the response into components
      const [
        actionType,
        description,
        targetType,
        basePower,
        emojisStr,
        soundEffectsStr,
        tacticalReasoning
      ] = cleanResponse.split('||').map(part => part.trim());

      // Parse emojis
      const emojis = emojisStr.split(',').map(emoji => emoji.trim()).filter(Boolean);

      // Parse sound effects
      const soundEffects = soundEffectsStr.split(',')
        .map(sound => sound.trim())
        .filter(sound => {
          // Validate that the sound effect exists in our list
          return sound.endsWith('.mp3') &&
            Object.values(SOUND_EFFECT).some(effect => effect.file === sound);
        });

      // Validate sound effects count
      if (soundEffects.length > 3) {
        soundEffects.length = 3; // Truncate to maximum of 3
      }

      // Validate and construct the action
      return {
        actor,
        actionType: this.validateActionType(actionType),
        description: description || 'Performs a tactical move',
        targetType: this.validateTargetType(targetType),
        basePower: this.validateBasePower(basePower),
        emojis: this.validateEmojis(emojis),
        soundEffects: soundEffects,
        tacticalReasoning: tacticalReasoning || 'Tactical decision based on battle conditions'
      };
    } catch (error) {
      console.error('AI Action Error:', error);
      return this.getFallbackAction(actor);
    }
  }

  // Add this method to handle fallback sound effects in the getFallbackAction method
  getFallbackAction(actor) {
    return {
      actor,
      actionType: 'ATTACK',
      description: 'Performs a basic attack',
      targetType: 'OFFENSIVE',
      basePower: 10,
      emojis: ['⚔️'],
      soundEffects: ['whoosh.mp3'], // Default fallback sound
      tacticalReasoning: 'Fallback action due to processing error'
    };
  }

  validateActionType(type) {
    const validTypes = ['ATTACK', 'DEFEND', 'COUNTER', 'SPECIAL'];
    const upperType = (type || '').toUpperCase();
    return validTypes.includes(upperType) ? upperType : validTypes[0];
  }

  validateTargetType(type) {
    const validTypes = ['OFFENSIVE', 'DEFENSIVE', 'TACTICAL'];
    const upperType = (type || '').toUpperCase();
    return validTypes.includes(upperType) ? upperType : 'OFFENSIVE';
  }

  validateBasePower(power) {
    const num = parseInt(power);
    return Math.min(22, Math.max(8, isNaN(num) ? 15 : num));
  }

  validateEmojis(emojis) {
    if (!Array.isArray(emojis) || emojis.length === 0) {
      return ['⚔️'];
    }
    return emojis.slice(0, 3);
  }

  getFallbackAction(actor) {
    return {
      actor,
      actionType: 'ATTACK',
      description: 'Performs a basic attack',
      targetType: 'OFFENSIVE',
      basePower: 15,
      emojis: ['⚔️'],
      tacticalReasoning: 'Fallback action due to processing error'
    };
  }
}