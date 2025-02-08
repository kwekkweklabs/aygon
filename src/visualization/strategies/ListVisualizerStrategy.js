import { BattleVisualizerStrategy } from './BattleVisualizerStrategy.js';
import { BATTLE_EVENTS } from '../../constants/types.js';

export class ListVisualizerStrategy {
    constructor() {
        this.state = {
            commentary: [],
            battleState: null
        };
    }

    initialize(aiProvider) {
        this.aiProvider = aiProvider;
    }

    async visualizeAction(action, heroes, context) {
        // Store the current battle state
        this.state.battleState = {
            action,
            heroes,
            context
        };
    }

    handleBattleEvent(event, data) {
        switch (event) {
            case 'COMMENTARY_ADDED':
                this.state.commentary.push(data);
                break;
            case 'STATE_UPDATED':
                this.state.battleState = data;
                break;
        }
    }

    getState() {
        return {
            ...this.state,
            visualizationType: 'list'
        };
    }

    displayBattleState(heroes, battleContext) {
        const heroStates = Object.entries(heroes).map(([heroId, hero]) => {
            const statusEffects = battleContext.state.statusEffects[heroId] || [];
            const activeEffects = statusEffects
                .filter(effect => effect.duration > 0)
                .map(effect => `${effect.type} (${effect.duration} turns)`);

            return {
                id: heroId,
                name: hero.name,
                hp: hero.hp,
                effects: activeEffects,
                specialMeter: battleContext.state.specialMeters[heroId] || 0
            };
        });

        // Create status summary
        const statusSummary = heroStates.reduce((summary, hero) => {
            summary[hero.id] = {
                hp: hero.hp,
                effects: hero.effects,
                specialMeter: hero.specialMeter
            };
            return summary;
        }, {});

        // Update the state
        this.state.battleState = {
            ...this.state.battleState,
            heroes: statusSummary,
            turn: battleContext.state.currentTurn,
            combo: battleContext.state.combo
        };

        return {
            type: 'LIST_UPDATE',
            data: {
                heroes: statusSummary,
                turn: battleContext.state.currentTurn,
                combo: battleContext.state.combo,
                commentary: this.state.commentary
            }
        };
    }

    formatHeroStatus(hero) {
        const effectsText = hero.effects.length > 0 
            ? `[${hero.effects.join(', ')}]` 
            : '';
        const specialMeterText = `Special: ${hero.specialMeter}%`;
        
        return `${hero.name} - HP: ${hero.hp}% ${effectsText} ${specialMeterText}`;
    }

    formatBattleStatus(battleContext) {
        return `Turn: ${battleContext.state.currentTurn} | Combo: ${battleContext.state.combo}`;
    }

    clearState() {
        this.state = {
            commentary: [],
            battleState: null
        };
    }
}