import { BattleVisualizerStrategy } from './BattleVisualizerStrategy.js';
import { BATTLE_EVENTS } from '../../constants/types.js';

export class ListVisualizerStrategy extends BattleVisualizerStrategy {
    constructor() {
        super();
        this.battleState = {
            actions: [],
            commentary: [],
            heroes: {},
            currentTurn: 0,
            battleStatus: 'ACTIVE',
            lastUpdate: Date.now(),
            statusEffects: {},
            specialMeters: {}
        };
    }

    initialize() {
        // No initialization needed for list strategy
    }

    async visualizeAction(action, attacker, defender, battleContext) {
        this.battleState.actions.push({
            timestamp: Date.now(),
            action: {
                type: action.type,
                text: action.text,
                damage: action.damage,
                effect: action.effect,
                emoji: action.emoji,
                emojis: action.emojis,
                crit: action.crit,
                miss: action.miss
            },
            attacker: {
                id: attacker.id,
                name: attacker.name,
                hp: attacker.hp
            },
            defender: {
                id: defender.id,
                name: defender.name,
                hp: defender.hp
            },
            judgeCommentary: action.judgeCommentary
        });

        this.battleState.lastUpdate = Date.now();
    }

    displayBattleState(heroes, battleContext) {
        this.battleState.heroes = Object.entries(heroes).reduce((acc, [id, hero]) => {
            acc[id] = {
                id,
                name: hero.name,
                description: hero.description,
                hp: hero.hp,
                specialMeter: battleContext.getSpecialMeter(id),
                statusEffects: battleContext.state.statusEffects.get(id) || []
            };
            return acc;
        }, {});

        this.battleState.currentTurn++;
        this.battleState.lastUpdate = Date.now();
        
        return this.getState();
    }

    handleBattleEvent(eventType, data) {
        switch (eventType) {
            case BATTLE_EVENTS.COMMENTARY_ADDED:
                this.battleState.commentary.push({
                    timestamp: Date.now(),
                    text: data
                });
                break;
            case BATTLE_EVENTS.BATTLE_ENDED:
                this.battleState.battleStatus = 'ENDED';
                this.battleState.winner = data.winner;
                break;
            case BATTLE_EVENTS.STATE_UPDATED:
                this.updateBattleState(data);
                break;
        }
        
        this.battleState.lastUpdate = Date.now();
    }

    updateBattleState(newState) {
        this.battleState.specialMeters = newState.specialMeters;
        this.battleState.statusEffects = newState.statusEffects;
    }

    getState() {
        return {
            ...this.battleState,
            timestamp: Date.now()
        };
    }
}