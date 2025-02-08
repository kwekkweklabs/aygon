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
        this.commentaryArray = [];
        this.actionHistory = [];

        this.visualizer = config.visualizeMode === 'terminal'
            ? new TerminalVisualizerStrategy()
            : new ListVisualizerStrategy();

        this.visualizer.initialize(aiProvider);

        // Initialize battle state for each hero
        Object.entries(heroes).forEach(([heroId, hero]) => {
            // Basic hero initialization
            this.context.initializeHero(heroId);
            hero.id = heroId;

            // Initialize special meters and status effects
            this.context.initializeSpecialMeter(heroId);
            this.context.initializeStatusEffects(heroId);

            // Set initial state in context
            this.context.state.heroStates[heroId] = {
                health: hero.hp,
                name: hero.name,
                description: hero.description
            };
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        const events = {
            [BATTLE_EVENTS.COMMENTARY_ADDED]: (data) => {
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


    getBattleState() {
        const visualizerState = this.visualizer.getState() || {};

        // Create the complete battle state including the correct current turn
        const battleState = {
            ...visualizerState,
            battleStatus: this.battleStatus,
            currentTurn: this.currentTurn,  // Use the class's currentTurn property
            commentary: this.commentaryArray,
            actions: this.actionHistory || [],
            heroStates: Object.fromEntries(
                Object.entries(this.heroes).map(([id, hero]) => [
                    id,
                    {
                        name: hero.name,
                        hp: hero.hp,
                        description: hero.description,
                        specialMeter: this.context.state.specialMeters[id] || 0,
                        effects: this.context.state.statusEffects[id] || []
                    }
                ])
            ),
            heroes: this.heroes,  // Add the full heroes object for complete state
            lastAction: this.actionHistory?.[this.actionHistory.length - 1] || null
        };

        // Update the context's state with the current turn
        this.context.state.currentTurn = this.currentTurn;

        return battleState;
    }

    updateBattleState() {
        const state = this.getBattleState();
        if (state && this.stateUpdateCallback) {
            state.lastUpdate = new Date().toISOString();
            this.stateUpdateCallback(this.battleId, state);
        }
        return state;
    }


    async startBattle() {
        this.battleStatus = 'ACTIVE';
        this.currentTurn = 0;

        this.context.addCommentary(`⚔️ Battle begins between ${this.heroes.hero1.name} and ${this.heroes.hero2.name}! ⚔️`);
        this.updateBattleState();

        const heroIds = Object.keys(this.heroes);
        let currentActor = Math.random() < 0.5 ? heroIds[0] : heroIds[1];

        while (this.heroes[heroIds[0]].hp > 0 && this.heroes[heroIds[1]].hp > 0) {
            await this.processTurn(currentActor);
            currentActor = heroIds.find(id => id !== currentActor);
        }

        await this.concludeBattle(heroIds);
    }

    async processTurn(actorId) {
        this.currentTurn++;

        // Get the updated battle state with correct turn number
        const battleState = this.getBattleState();

        const action = await this.aiGenerator.getAIAction(actorId, battleState);
        const processedAction = await this.mechanics.processAction(action);

        // Add to action history
        this.actionHistory = this.actionHistory || [];
        this.actionHistory.push({
            ...processedAction,
            turn: this.currentTurn,
            timestamp: new Date().toISOString()
        });

        await this.visualizer.visualizeAction(processedAction, this.heroes, this.context);
        await this.applyActionEffects(processedAction);
        await sleep(this.config.turnDelay || 3000);
    }

    async applyActionEffects(processedAction) {
        const actor = this.heroes[processedAction.actor];
        const target = this.heroes[Object.keys(this.heroes).find(id => id !== processedAction.actor)];
        const previousHp = target.hp;

        // Apply damage if action is offensive
        if (processedAction.targetType === 'OFFENSIVE') {
            target.hp = Math.max(0, target.hp - processedAction.damage);

            // Increase special meter more when receiving damage
            const meterIncrease = Math.floor(processedAction.damage * 0.5);
            this.context.updateSpecialMeter(processedAction.actor, 15); // Base increase
            this.context.updateSpecialMeter(target.id, 15 + meterIncrease); // Bonus for taking damage
        } else {
            // Smaller increase for non-offensive actions
            this.context.updateSpecialMeter(processedAction.actor, 10);
        }

        // Generate battle commentary with additional state info
        const moveText = `${processedAction.emojis.join('')} ${actor.name}'s ${processedAction.actionType}:`;
        const damageText = processedAction.targetType === 'OFFENSIVE'
            ? `\nDamage: ${processedAction.damage} (${target.name}'s HP: ${previousHp} → ${target.hp})`
            : '';
        const effectText = processedAction.effect !== 'NONE'
            ? `\nEffect: ${processedAction.effect} applied!`
            : '';
        const meterText = `\nSpecial Meters - ${actor.name}: ${this.context.state.specialMeters[actor.id]}%, ${target.name}: ${this.context.state.specialMeters[target.id]}%`;
        const tacticalText = `\nTactical Analysis: ${processedAction.tacticalReasoning}`;
        const judgeText = `\nJudge's Commentary: ${processedAction.judgeCommentary}`;

        const commentary = `${moveText}\n${processedAction.description}${damageText}${effectText}${meterText}${tacticalText}${judgeText}`;

        console.log(`Turn ${this.currentTurn} Commentary:`, commentary);
        this.context.addCommentary(commentary);

        this.visualizer.displayBattleState(this.heroes, this.context);
    }

    async concludeBattle(heroIds) {
        const winner = this.heroes[heroIds.find(id => this.heroes[id].hp > 0)];
        const loser = this.heroes[heroIds.find(id => this.heroes[id].hp <= 0)];

        const finalCommentary = this.generateFinalCommentary(winner, loser);
        this.context.addCommentary(finalCommentary);

        this.battleStatus = 'ENDED';
        this.context.emit(BATTLE_EVENTS.BATTLE_ENDED, { winner });
        this.visualizer.displayBattleState(this.heroes, this.context);
        this.updateBattleState();
    }

    generateFinalCommentary(winner, loser) {
        const battleAnalysis = this.analyzeBattleStatistics();
        return `🏆 FINAL BLOW: ${winner.name} emerges victorious over ${loser.name}! 🏆

Battle Statistics:
- Total Turns: ${this.currentTurn}
- Most Used Action: ${battleAnalysis.mostUsedAction}
- Highest Damage: ${battleAnalysis.highestDamage} (Turn ${battleAnalysis.highestDamageTurn})
- Status Effects Applied: ${battleAnalysis.totalStatusEffects}
- Special Moves Used: ${battleAnalysis.specialMovesUsed}

${winner.name} claims victory after an epic battle!`;
    }

    analyzeBattleStatistics() {
        const stats = {
            actionCounts: {},
            highestDamage: 0,
            highestDamageTurn: 0,
            totalStatusEffects: 0,
            specialMovesUsed: 0
        };

        this.actionHistory.forEach((action, index) => {
            // Count action types
            stats.actionCounts[action.actionType] = (stats.actionCounts[action.actionType] || 0) + 1;

            // Track highest damage
            if (action.damage > stats.highestDamage) {
                stats.highestDamage = action.damage;
                stats.highestDamageTurn = index + 1;
            }

            // Count status effects and special moves
            if (action.effect !== 'NONE') stats.totalStatusEffects++;
            if (action.actionType === 'SPECIAL') stats.specialMovesUsed++;
        });

        return {
            mostUsedAction: Object.entries(stats.actionCounts)
                .sort(([, a], [, b]) => b - a)[0][0],
            highestDamage: stats.highestDamage,
            highestDamageTurn: stats.highestDamageTurn,
            totalStatusEffects: stats.totalStatusEffects,
            specialMovesUsed: stats.specialMovesUsed
        };
    }
}