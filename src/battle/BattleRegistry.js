import { prismaQuery } from "../../lib/prisma.js";
import { BattleManager } from "./BattleManager.js";

export class BattleRegistry {
  constructor() {
    this.battles = new Map();
    this.battleStates = new Map();
  }

  createBattle(battleId, heroes, aiProvider, config = {}) {
    const battle = new BattleManager(heroes, aiProvider, {
      ...config,
      battleId,
      onStateUpdate: (id, state) => this.updateBattleState(id, state)
    });

    this.battles.set(battleId, battle);
    const initialState = {
      battleStatus: 'INITIALIZED',
      currentTurn: 0,
      heroes: {},
      commentary: [],
      actions: [],
      lastAction: null
    };

    this.battleStates.set(battleId, initialState);
    console.log(`Battle created: ${battleId}`);

    return battle;
  }

  getBattle(battleId) {
    return this.battles.get(battleId);
  }

  updateBattleState(battleId, newState) {
    const currentState = this.battleStates.get(battleId) || {
      battleStatus: 'INITIALIZED',
      currentTurn: 0,
      heroes: {},
      commentary: [],
      actions: [],
      lastAction: null
    };

    // Track new commentary and create action record
    if (newState.commentary?.length > currentState.commentary?.length) {
      const newCommentary = newState.commentary[newState.commentary.length - 1];
      const action = {
        turn: newState.currentTurn,
        timestamp: new Date().toISOString(),
        commentary: newCommentary,
        battleStatus: newState.battleStatus,
        heroStates: newState.heroStates
      };

      currentState.actions = currentState.actions || [];
      currentState.actions.push(action);
      currentState.lastAction = action;
    }

    // Update the state
    const updatedState = {
      ...currentState,
      ...newState,
      lastUpdate: Math.floor(Date.now() / 1000)
    };

    this.battleStates.set(battleId, updatedState);
    this.emitBattleState(battleId, updatedState, currentState.lastUpdate);

    return updatedState;
  }

  emitBattleState(battleId, state, lastUpdate) {
    if (!lastUpdate || state.lastUpdate > lastUpdate) {
      console.log(`\n=== BATTLE UPDATE [${battleId}] ===`);
      // console.log({
      //   battleId: battleId,
      //   timestamp: new Date().toISOString(),
      //   currentTurn: state.currentTurn,
      //   battleStatus: state.battleStatus,
      //   heroStates: state.heroStates,
      //   commentary: state.commentary,
      //   actions: state.actions,
      //   lastAction: state.lastAction,
      //   statusEffects: state.statusEffects,
      //   specialMeters: state.specialMeters,
      //   lastUpdate: state.lastUpdate
      // });
      // console.log({
      //   battleId: battleId,
      //   turnIndex: state.currentTurn,
      //   hero1State: {
      //     hp: state.heroStates.hero1.hp,
      //     specialMeter: state.heroStates.hero1.specialMeter,
      //     effects: state.heroStates.hero1.effects
      //   },
      //   hero2State: {
      //     hp: state.heroStates.hero2.hp,
      //     specialMeter: state.heroStates.hero2.specialMeter,
      //     effects: state.heroStates.hero2.effects
      //   },
      //   commentary: state.commentary[state.commentary.length - 1].text,
      //   action: state.lastAction
      // })
      console.log('================================\n');

      prismaQuery.battleState.create({
        data: {
          battleId: battleId,
          turnIndex: state.currentTurn,
          hero1State: {
            hp: state.heroStates.hero1.hp,
            specialMeter: state.heroStates.hero1.specialMeter,
            effects: state.heroStates.hero1.effects
          },
          hero2State: {
            hp: state.heroStates.hero2.hp,
            specialMeter: state.heroStates.hero2.specialMeter,
            effects: state.heroStates.hero2.effects
          },
          commentary: state.commentary[state.commentary.length - 1].text,
          action: state.lastAction
        }
      }).catch(err => {
        console.error('Failed to save battle state:', err);
      })
    }
  }

  getHeroStatusDescription(hp) {
    if (hp <= 0) return 'DEFEATED';
    if (hp <= 25) return 'CRITICAL';
    if (hp <= 50) return 'WOUNDED';
    if (hp <= 75) return 'INJURED';
    return 'HEALTHY';
  }

  getBattleState(battleId) {
    return this.battleStates.get(battleId);
  }

  deleteBattle(battleId) {
    console.log(`Battle deleted: ${battleId}`);
    this.battles.delete(battleId);
    this.battleStates.delete(battleId);
  }

  getAllBattleStates() {
    const states = {};
    this.battleStates.forEach((state, battleId) => {
      states[battleId] = state;
    });
    return states;
  }

  getBattleStateChanges(battleId, lastUpdateTime) {
    const currentState = this.battleStates.get(battleId);
    if (!currentState) return null;

    const lastUpdate = new Date(currentState.lastUpdate);
    const checkTime = new Date(lastUpdateTime);

    if (lastUpdate > checkTime) {
      const newActions = currentState.actions?.filter(action =>
        new Date(action.timestamp) > checkTime
      ) || [];

      if (newActions.length > 0) {
        return {
          battleStatus: currentState.battleStatus,
          currentTurn: currentState.currentTurn,
          heroStates: currentState.heroStates,
          newActions,
          lastAction: currentState.actions[currentState.actions.length - 1]
        };
      }
    }

    return null;
  }
}