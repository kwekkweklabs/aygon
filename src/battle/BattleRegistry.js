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
      console.log('\n=== BATTLE CREATED ===');
      console.log(`Battle ID: ${battleId}`);
      console.log('Initial State:', initialState);

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

      console.log(`\n=== BATTLE UPDATE [${battleId}] ===`);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Current Turn:', newState.currentTurn);
      console.log('Battle Status:', newState.battleStatus);

      // Log hero state changes
      if (newState.heroStates) {
          console.log('\n--- Hero States ---', newState.heroStates);
          Object.entries(newState.heroStates).forEach(([heroId, hero]) => {
              const oldHp = currentState.heroStates?.[heroId]?.hp;
              const newHp = hero.hp;
              console.log(`${hero.name}:`, {
                  hp: `${oldHp || 100}% → ${newHp}%`,
                  status: this.getHeroStatusDescription(newHp)
              });
          });

          console.log("Hero1 Effects: ", newState.heroStates.hero1.effects);
          console.log("Hero2 Effects: ", newState.heroStates.hero2.effects);
      }

      // Track new commentary
      if (newState.commentary?.length > currentState.commentary?.length) {
          const newCommentary = newState.commentary[newState.commentary.length - 1];
          console.log('\n--- New Commentary ---');
          console.log(newCommentary);
          
          // Create an action record
          const action = {
              turn: newState.currentTurn,
              timestamp: new Date().toISOString(),
              commentary: newCommentary,
              battleStatus: newState.battleStatus,
              heroStates: newState.heroStates
          };

          // Update actions array and last action
          currentState.actions = currentState.actions || [];
          currentState.actions.push(action);
          currentState.lastAction = action;

          console.log('\n--- Action Recorded ---');
          console.log('Turn:', action.turn);
          console.log('Action:', action);
      }

      // Log any status effect changes
      if (newState.statusEffects) {
          console.log('\n--- Status Effects ---');
          Object.entries(newState.statusEffects).forEach(([heroId, effects]) => {
              console.log(`${heroId}:`, effects);
          });
      }

      // Log special meter changes
      if (newState.specialMeters) {
          console.log('\n--- Special Meters ---');
          Object.entries(newState.specialMeters).forEach(([heroId, meter]) => {
              const oldMeter = currentState.specialMeters?.[heroId] || 0;
              console.log(`${heroId}: ${oldMeter}% → ${meter}%`);
          });
      }

      // Update the state
      const updatedState = {
          ...currentState,
          ...newState,
          lastUpdate: Math.floor(Date.now() / 1000)
      };

      // console.log('\n--- Updated State ---', updatedState);

      this.battleStates.set(battleId, updatedState);
      
      console.log('\n--- Battle Summary ---');
      console.log('Total Actions:', updatedState.actions.length);
      console.log('Total Commentary:', updatedState.commentary.length);
      console.log('Last Update:', updatedState.lastUpdate);
      console.log('================================\n');

      return updatedState;
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
      console.log(`\n=== BATTLE DELETED [${battleId}] ===`);
      console.log('Final State:', this.battleStates.get(battleId));
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
          console.log(`\n=== CHECKING STATE CHANGES [${battleId}] ===`);
          console.log('Last Update:', lastUpdate);
          console.log('Check Time:', checkTime);

          // console.log('current state:', currentState);

          const newActions = currentState.actions?.filter(action => 
              new Date(action.timestamp) > checkTime
          ) || [];

          if (newActions.length > 0) {
              console.log('\n--- New Actions Detected ---');
              newActions.forEach(action => {
                  console.log(`Turn ${action.turn}:`, action.commentary);
              });
              
              return {
                  battleStatus: currentState.battleStatus,
                  currentTurn: currentState.currentTurn,
                  heroStates: currentState.heroStates,
                  newActions,
                  lastAction: currentState.actions[currentState.actions.length - 1]
              };
          }
      }

      console.log(`\n=== NO CHANGES [${battleId}] ===`);
      return null;
  }
}