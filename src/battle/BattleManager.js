import { BattleContextManager } from '../core/BattleContextManager.js';
// import { BattleMechanicsHandler } from './BattleMechanicsHandler.js';
import { AIActionGenerator } from './AIActionGenerator.js';
import { TerminalVisualizerStrategy } from '../visualization/strategies/TerminalVisualizerStrategy.js';
import { ListVisualizerStrategy } from '../visualization/strategies/ListVisualizerStrategy.js';
import { BATTLE_EVENTS } from '../constants/types.js';
import { sleep } from '../utils/helpers.js';
import { BattleMechanicsHandler } from '../core/BattleMechanicHandler.js';

export class BattleManager {
    constructor(heroes, aiProvider, config = { visualizeMode: 'terminal', turnDelay: 3000 }) {
        this.heroes = heroes;
        this.config = config;
        this.context = new BattleContextManager();
        this.mechanics = new BattleMechanicsHandler(this.context, aiProvider);
        this.aiGenerator = new AIActionGenerator(this.context, aiProvider);
        
        // Select visualization strategy based on config
        this.visualizer = config.visualizeMode === 'terminal' 
            ? new TerminalVisualizerStrategy()
            : new ListVisualizerStrategy();
        
        this.visualizer.initialize(aiProvider);

        // Initialize heroes in context
        Object.keys(heroes).forEach(heroId => {
            this.context.initializeHero(heroId);
            this.heroes[heroId].id = heroId;
        });

        // Set up event listeners
        this.context.on(BATTLE_EVENTS.COMMENTARY_ADDED, data => 
            this.visualizer.handleBattleEvent(BATTLE_EVENTS.COMMENTARY_ADDED, data));
        this.context.on(BATTLE_EVENTS.BATTLE_ENDED, data => 
            this.visualizer.handleBattleEvent(BATTLE_EVENTS.BATTLE_ENDED, data));
        this.context.on(BATTLE_EVENTS.STATE_UPDATED, data => 
            this.visualizer.handleBattleEvent(BATTLE_EVENTS.STATE_UPDATED, data));
    }

    async startBattle() {
        const heroIds = Object.keys(this.heroes);
        let [attackerId, defenderId] = Math.random() < 0.5
            ? [heroIds[0], heroIds[1]]
            : [heroIds[1], heroIds[0]];

        this.visualizer.displayBattleState(this.heroes, this.context);
        await sleep(2000);

        while (this.heroes[heroIds[0]].hp > 0 && this.heroes[heroIds[1]].hp > 0) {
            const attacker = this.heroes[attackerId];
            const defender = this.heroes[defenderId];

            const actionType = this.mechanics.determineActionType(attacker, defender);
            const action = await this.aiGenerator.getAIAction(attacker, defender, actionType);
            const processedAction = await this.mechanics.processAction(action, attacker, defender);

            await this.visualizer.visualizeAction(processedAction, attacker, defender, this.context);

            defender.hp = Math.max(0, defender.hp - processedAction.damage);

            const moveText = `${processedAction.emoji} ${attacker.name}'s ${processedAction.type}:`;
            const actionText = processedAction.text;
            let damageMessage = `Hit: ${processedAction.damage} damage`;

            if (processedAction.crit) {
                damageMessage = `CRITICAL HIT: ${processedAction.damage} damage!`;
            } else if (processedAction.miss) {
                damageMessage = `Glancing blow: ${processedAction.damage} damage`;
            }

            this.context.addCommentary(`${moveText}\n${actionText}\n${damageMessage}`);

            this.visualizer.displayBattleState(this.heroes, this.context);
            await sleep(this.config.turnDelay || 3000);

            [attackerId, defenderId] = [defenderId, attackerId];
        }

        const winner = this.heroes[heroIds[0]].hp > 0 ? this.heroes[heroIds[0]] : this.heroes[heroIds[1]];
        const victoryMessage = `🏆 FINAL BLOW: ${winner.name} emerges victorious! 🏆`;
        this.context.addCommentary(victoryMessage);
        this.context.emit(BATTLE_EVENTS.BATTLE_ENDED, { winner });
        this.visualizer.displayBattleState(this.heroes, this.context);
    }

    getBattleState() {
        if (this.visualizer instanceof ListVisualizerStrategy) {
            return this.visualizer.getState();
        }
        return null;
    }
}