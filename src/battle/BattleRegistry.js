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

  async emitBattleState(battleId, state, lastUpdate) {
    // Only proceed if there's been an update and the battle isn't already marked as finished
    if (!lastUpdate || state.lastUpdate > lastUpdate) {
      console.log(`\n=== BATTLE UPDATE [${battleId}] ===`);
      console.log('================================\n');

      // or when hero1 or hero2 is defeated (hp <= 0)
      const hero1Hp = state.heroStates.hero1.hp;
      const hero2Hp = state.heroStates.hero2.hp;

      if (state.battleStatus === 'ENDED' || hero1Hp <= 0 || hero2Hp <= 0) {
        let winner = null;
        if (hero1Hp <= 0) {
          winner = 'hero2';
        } else if (hero2Hp <= 0) {
          winner = 'hero1';
        }

        await this.handleFinishedBattle(battleId, state, winner);
      }

      // Only create new battle state if battle is not ended
      try {
        await prismaQuery.battleState.create({
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
        });
      } catch (err) {
        console.error('Failed to save battle state:', err);
      }
    }
  }

  async handleFinishedBattle(battleId, state, winner) {
    console.log(`Battle ${battleId} has ended!`);
    // Update the battle state to FINISHED in database
    try {
      const battle = await prismaQuery.battle.findUnique({
        where: { id: battleId },
        select: {
          hero1Id: true,
          hero2Id: true,
          hero1: {
            select: {
              user: {
                select: {
                  privyWalletAddress: true
                }
              }
            }
          },
          hero2: {
            select: {
              user: {
                select: {
                  privyWalletAddress: true
                }
              }
            }
          }
        }
      })

      let winnerId = null;
      if (winner === 'hero1') {
        winnerId = battle.hero1Id;
      } else if (winner === 'hero2') {
        winnerId = battle.hero2Id;
      }
      await prismaQuery.battle.update({
        where: { id: battleId },
        data: {
          status: 'FINISHED',
          winnerHeroId: winnerId
        }
      });

      // Clean up the battle from memory
      this.deleteBattle(battleId);

      // Empty the room
      await prismaQuery.room.update({
        where: { currentBattleId: battleId },
        data: {
          // hero1Id: null,
          hero2Id: null,
          state: 'WAITING',
          currentBattleId: null
        }
      });

      // TODO: Trigger payment transaction here
      let winnerAddress = null;
      if (winnerId === battle.hero1Id) {
        winnerAddress = battle.hero1.user.privyWalletAddress;
      } else if (winnerId === battle.hero2Id) {
        winnerAddress = battle.hero2.user.privyWalletAddress;
      }

      let loserAddress = null;
      if (winnerId !== battle.hero1Id) {
        loserAddress = battle.hero1.user.privyWalletAddress;
      } else if (winnerId !== battle.hero2Id) {
        loserAddress = battle.hero2.user.privyWalletAddress;
      }

      console.log(`TRANSFER FUNDS: ${winnerAddress} -> ${loserAddress}`);

      return; // Exit early to prevent creating new battle state
    } catch (err) {
      console.error('Failed to update battle status to FINISHED:', err);
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
    // Remove battle instance
    this.battles.delete(battleId);
    // Remove battle state
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