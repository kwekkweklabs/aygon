import { BattleManager } from "./BattleManager.js";

export class BattleRegistry {
  constructor() {
    this.activeBattles = new Map();
    this.battleStates = new Map();
    this.stateChangeListeners = new Set();
    this.pollIntervals = new Map();
    this.lastPolledStates = new Map();
    console.log('BattleRegistry initialized');
  }

  createBattle(battleId, heroes, aiProvider, options = {}) {
    if (this.activeBattles.has(battleId)) {
      throw new Error(`Battle with ID ${battleId} already exists`);
    }

    const battle = new BattleManager(heroes, aiProvider, {
      visualizeMode: 'list',
      turnDelay: options.turnDelay || 3000,
      battleId,
      onStateUpdate: (battleId, state) => this.updateBattleState(battleId, state)
    });

    this.activeBattles.set(battleId, battle);
    this.battleStates.set(battleId, {
      status: 'INITIALIZED',
      lastUpdate: new Date(),
      stateHistory: [],
      currentStateId: 0
    });

    // Start polling immediately upon battle creation
    this.startPolling(battleId);

    return battle;
  }

  hasStateChangedInPoll(oldState, newState) {
    if (!oldState || !newState) {
      // console.log('State change reason: Initial state or missing state');
      return true;
    }

    if (oldState.lastUpdate === newState.lastUpdate) {
      // console.log('No change detected - same lastUpdate timestamp');
      return false;
    }

    return true;
  }

  startPolling(battleId) {
    if (this.pollIntervals.has(battleId)) {
      clearInterval(this.pollIntervals.get(battleId));
    }

    const interval = setInterval(() => {
      const battle = this.activeBattles.get(battleId);
      if (!battle) {
        this.stopPolling(battleId);
        return;
      }

      const currentState = battle.getBattleState();
      const lastPolledState = this.lastPolledStates.get(battleId);

      console.log(`\n[BATTLE UPDATE] Battle ${battleId} - ${new Date().toISOString()}`);

      if (currentState && this.hasStateChangedInPoll(lastPolledState, currentState)) {
        console.log('State changed:', {
          battleId: battleId,
          state: currentState
        });

        console.log('lastAction:', currentState.actions[currentState.actions.length - 1]);

        // console.log(currentState);
        this.lastPolledStates.set(battleId, JSON.parse(JSON.stringify(currentState)));

        if (currentState.battleStatus === 'ENDED') {
          this.handleBattleEnd(battleId);
        }
      } else {
        console.log('No state changes detected');
      }
    }, 2000);

    this.pollIntervals.set(battleId, interval);
  }

  stopPolling(battleId) {
    const interval = this.pollIntervals.get(battleId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(battleId);
      this.lastPolledStates.delete(battleId);
      console.log(`[POLLING] Stopped polling for battle ${battleId}`);
    }
  }


  updateBattleState(battleId, newState) {
    const battleState = this.battleStates.get(battleId);
    if (!battleState) return;

    const stateWithMetadata = {
      id: ++battleState.currentStateId,
      timestamp: new Date(),
      ...newState
    };

    const lastState = battleState.stateHistory[battleState.stateHistory.length - 1];
    if (this.hasStateChanged(lastState, stateWithMetadata)) {
      battleState.stateHistory.push(stateWithMetadata);
      battleState.lastUpdate = new Date();
      this.emitStateUpdate(battleId, stateWithMetadata);
    }
  }

  hasStateChanged(oldState, newState) {
    if (!oldState) return true;

    const relevantProps = ['heroStates', 'battleStatus', 'currentTurn'];
    return relevantProps.some(prop =>
      JSON.stringify(oldState[prop]) !== JSON.stringify(newState[prop])
    );
  }

  handleBattleEnd(battleId) {
    const battleState = this.battleStates.get(battleId);
    if (!battleState) return;

    battleState.status = 'ENDED';
    this.stopPolling(battleId);
    this.activeBattles.delete(battleId);

    const finalState = {
      ...battleState.stateHistory[battleState.stateHistory.length - 1],
      finalState: true
    };

    this.emitStateUpdate(battleId, finalState);
    console.log(`[BATTLE END] Battle ${battleId} has concluded`);
  }

  emitStateUpdate(battleId, state) {
    const eventData = { battleId, state, timestamp: new Date().toISOString() };
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  addStateChangeListener(listener) {
    this.stateChangeListeners.add(listener);
  }

  removeStateChangeListener(listener) {
    this.stateChangeListeners.delete(listener);
  }

  getBattleState(battleId) {
    return this.battleStates.get(battleId);
  }

  getAllActiveBattles() {
    return Array.from(this.activeBattles.keys());
  }
}