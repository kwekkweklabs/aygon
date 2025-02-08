import { BattleContextManager } from '../core/BattleContextManager.js';
import { AIActionGenerator } from './AIActionGenerator.js';
import { TerminalVisualizerStrategy } from '../visualization/strategies/TerminalVisualizerStrategy.js';
import { ListVisualizerStrategy } from '../visualization/strategies/ListVisualizerStrategy.js';
import { BATTLE_EVENTS } from '../constants/types.js';
import { sleep } from '../utils/helpers.js';
import { BattleMechanicsHandler } from '../core/BattleMechanicHandler.js';

export class BattleManager {
    constructor(heroes, aiProvider, config = {}) {
        this.heroes = heroes;
        this.config = config;
        this.context = new BattleContextManager();
        this.mechanics = new BattleMechanicsHandler(this.context, aiProvider);
        this.aiGenerator = new AIActionGenerator(this.context, aiProvider);
        this.currentTurn = 0;
        this.battleStatus = 'INITIALIZED';
        this.stateUpdateCallback = config.onStateUpdate;
        this.battleId = config.battleId;
        this.commentaryArray = []; // Track commentary locally

        this.visualizer = config.visualizeMode === 'terminal'
            ? new TerminalVisualizerStrategy()
            : new ListVisualizerStrategy();

        this.visualizer.initialize(aiProvider);

        Object.entries(heroes).forEach(([heroId, hero]) => {
            this.context.initializeHero(heroId);
            hero.id = heroId;
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        const events = {
            [BATTLE_EVENTS.COMMENTARY_ADDED]: (data) => {
                // Add new commentary with timestamp and turn number
                this.commentaryArray.push({
                    text: data,
                    timestamp: new Date().toISOString(),
                    turn: this.currentTurn
                });
                this.visualizer.handleBattleEvent(BATTLE_EVENTS.COMMENTARY_ADDED, data);
                this.updateBattleState();
            },
            [BATTLE_EVENTS.BATTLE_ENDED]: (data) => {
                this.battleStatus = 'ENDED';
                this.visualizer.handleBattleEvent(BATTLE_EVENTS.BATTLE_ENDED, data);
                this.updateBattleState();
            },
            [BATTLE_EVENTS.STATE_UPDATED]: (data) => {
                this.visualizer.handleBattleEvent(BATTLE_EVENTS.STATE_UPDATED, data);
                this.updateBattleState();
            }
        };

        Object.entries(events).forEach(([event, handler]) => {
            this.context.on(event, handler);
        });
    }

    updateBattleState() {
        const state = this.getBattleState();
        if (state && this.stateUpdateCallback) {
            state.battleStatus = this.battleStatus;
            state.currentTurn = this.currentTurn;
            state.heroStates = Object.fromEntries(
                Object.entries(this.heroes).map(([id, hero]) => [
                    id,
                    {
                        name: hero.name,
                        hp: hero.hp,
                        description: hero.description
                    }
                ])
            );
            state.commentary = this.commentaryArray;
            this.stateUpdateCallback(this.battleId, state);
        }
        return state;
    }

    async startBattle() {
        this.battleStatus = 'ACTIVE';
        this.currentTurn = 0;
        
        // Add initial battle commentary
        this.context.addCommentary(`⚔️ Battle begins between ${this.heroes.hero1.name} and ${this.heroes.hero2.name}! ⚔️`);
        this.updateBattleState();

        const heroIds = Object.keys(this.heroes);
        let [attackerId, defenderId] = Math.random() < 0.5 ? heroIds : heroIds.reverse();

        while (this.heroes[heroIds[0]].hp > 0 && this.heroes[heroIds[1]].hp > 0) {
            await this.processTurn(attackerId, defenderId);
            [attackerId, defenderId] = [defenderId, attackerId];
        }

        await this.concludeBattle(heroIds);
    }

    async processTurn(attackerId, defenderId) {
        this.currentTurn++;
        const attacker = this.heroes[attackerId];
        const defender = this.heroes[defenderId];

        const actionType = this.mechanics.determineActionType(attacker, defender);
        const action = await this.aiGenerator.getAIAction(attacker, defender, actionType);
        const processedAction = await this.mechanics.processAction(action, attacker, defender);

        await this.visualizer.visualizeAction(processedAction, attacker, defender, this.context);
        await this.applyDamage(processedAction, attacker, defender);
        await sleep(this.config.turnDelay || 3000);
    }

    async applyDamage(processedAction, attacker, defender) {
        const previousHp = defender.hp;
        defender.hp = Math.max(0, defender.hp - processedAction.damage);

        const moveText = `${processedAction.emojis.join('')} ${attacker.name}'s ${processedAction.type}:`;
        const damageMessage = processedAction.crit ? 'CRITICAL HIT' :
            processedAction.miss ? 'Glancing blow' : 'Hit';

        const commentary = `${moveText}\n${processedAction.text}\n${damageMessage}: ${processedAction.damage} damage\n${defender.name}'s HP: ${previousHp} → ${defender.hp}`;
        
        console.log(`Turn ${this.currentTurn} Commentary:`, commentary);
        this.context.addCommentary(commentary);

        this.visualizer.displayBattleState(this.heroes, this.context);
    }

    async concludeBattle(heroIds) {
        const winner = this.heroes[heroIds.find(id => this.heroes[id].hp > 0)];
        const loser = this.heroes[heroIds.find(id => this.heroes[id].hp <= 0)];
        
        const finalCommentary = `🏆 FINAL BLOW: ${winner.name} emerges victorious over ${loser.name}! 🏆\nBattle concluded in ${this.currentTurn} turns.`;
        this.context.addCommentary(finalCommentary);
        
        this.battleStatus = 'ENDED';
        this.context.emit(BATTLE_EVENTS.BATTLE_ENDED, { winner });
        this.visualizer.displayBattleState(this.heroes, this.context);
        this.updateBattleState();
    }

    getBattleState() {
        const visualizerState = this.visualizer.getState() || {};
        return {
            ...visualizerState,
            battleStatus: this.battleStatus,
            currentTurn: this.currentTurn,
            commentary: this.commentaryArray,
            heroStates: Object.fromEntries(
                Object.entries(this.heroes).map(([id, hero]) => [
                    id,
                    {
                        name: hero.name,
                        hp: hero.hp,
                        description: hero.description
                    }
                ])
            )
        };
    }
}