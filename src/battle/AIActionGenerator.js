import { COMBAT_ACTIONS } from '../constants/types.js';

export class AIActionGenerator {
  constructor(battleContext, aiProvider) {
    this.context = battleContext;
    this.aiProvider = aiProvider;
  }

  generatePromptFromAction(attacker, defender, actionType) {
    const prompts = {
      [COMBAT_ACTIONS.ATTACK]: `${attacker.name} launches an offensive move against ${defender.name}.`,
      [COMBAT_ACTIONS.DEFEND]: `${attacker.name} takes a defensive stance against ${defender.name}'s next move.`,
      [COMBAT_ACTIONS.COUNTER]: `${attacker.name} prepares to counter ${defender.name}'s attack.`,
      [COMBAT_ACTIONS.DODGE]: `${attacker.name} attempts to evade ${defender.name}'s assault.`,
      [COMBAT_ACTIONS.SPECIAL]: `${attacker.name} channels their power for a special technique against ${defender.name}.`
    };

    return `You are a battle narrator who specializes in both epic and comedically overblown combat descriptions. Given the following scenario, generate a short combat action that makes ANY character seem impressive (whether they're a cosmic deity or a corporate middle manager).

    SCENARIO:
    ${prompts[actionType]}
    Character's abilities: ${attacker.description}
    
    REQUIREMENTS:
    1. Respond with EXACTLY this format (including the || symbols): 
      [Brief Action Description]||[Number between 8-22]||[1-3 Emojis separated by commas]
    2. Action description must be 5-15 words
    3. Description should either:
      - Use the character's actual abilities in an epic way, OR
      - Transform mundane traits into hilarious combat powers
    4. Power level should be entertaining regardless of character type:
      - Magical beings can use their genuine powers
      - Regular people get creative/absurd power interpretations
      - Corporate roles become funny combat abilities
    5. Emojis should represent the intensity/nature of the action (1-3 emojis max)
    6. DO NOT use JSON format
    
    EXAMPLE GOOD RESPONSES:
    "Summons ice daggers from shadows||15||❄️,⚔️,❄️"
    "Weaponizes quarterly reports as throwing stars||18||📊,⚔️,💼"
    "Unleashes devastating lightning storm||20||⚡️,⚡️,⚡️"
    "Defeats enemy with aggressive powerpoint presentation||19||💼,💫,💥"
    "Gracefully sidesteps attack with intern's agility||12||💨,👔"
    "Launches surprise audit attack||16||📝,💰,💣"
    `;
  }

  async getAIAction(attacker, defender, actionType) {
    const prompt = this.generatePromptFromAction(attacker, defender, actionType);

    try {
      const response = await this.aiProvider.generate(prompt);
      let responseText = response
        .replace(/^["'{[\s]+|["'}]\s*$/g, '')
        .replace(/\s*:\s*/, '||')
        .replace(/[\n\r]+/g, ' ')
        .trim();

      let [actionText, baseDamage, emojisStr] = responseText.split('||').map(part => {
        return part.replace(/["{}[\]]/g, '').trim();
      });

      // Parse and validate base damage
      baseDamage = parseInt(baseDamage) || 15;
      if (baseDamage < 8 || baseDamage > 22) {
        baseDamage = 15;
      }

      // Parse emojis into array and limit to 3
      const emojis = emojisStr
        .split(',')
        .map(emoji => emoji.trim())
        .filter(emoji => emoji.length > 0)
        .slice(0, 3);

      // Ensure at least one emoji
      if (emojis.length === 0) {
        emojis.push(this.getFallbackEmoji(actionType));
      }

      const damageVariation = Math.floor(Math.random() * 7) - 3;
      const calculatedDamage = this.calculateDamage(
        baseDamage,
        damageVariation,
        actionType
      );

      return {
        type: actionType,
        text: actionText,
        damage: calculatedDamage,
        emojis: emojis, // Now returning array of emojis
        crit: calculatedDamage > 20,
        miss: calculatedDamage < 8
      };
    } catch (error) {
      console.error('AI Action Error:', error);
      return this.getFallbackAction(actionType);
    }
  }

  getFallbackEmoji(actionType) {
    const fallbackEmojis = {
      [COMBAT_ACTIONS.ATTACK]: '⚔️',
      [COMBAT_ACTIONS.DEFEND]: '🛡️',
      [COMBAT_ACTIONS.COUNTER]: '↩️',
      [COMBAT_ACTIONS.DODGE]: '💨',
      [COMBAT_ACTIONS.SPECIAL]: '✨'
    };
    return fallbackEmojis[actionType] || '⚔️';
  }

  calculateDamage(baseDamage, variation, actionType) {
    let damage = baseDamage + variation;

    const modifiers = {
      [COMBAT_ACTIONS.ATTACK]: 1,
      [COMBAT_ACTIONS.COUNTER]: 1.5,
      [COMBAT_ACTIONS.SPECIAL]: 2,
      [COMBAT_ACTIONS.DEFEND]: 0.5,
      [COMBAT_ACTIONS.DODGE]: 0.3
    };

    damage *= modifiers[actionType] || 1;
    return Math.min(25, Math.max(5, Math.floor(damage)));
  }

  getFallbackAction(actionType) {
    return {
      type: actionType,
      text: `Performs a ${actionType.toLowerCase()} move`,
      damage: 15,
      emojis: [this.getFallbackEmoji(actionType)],
      crit: false,
      miss: false
    };
  }
}