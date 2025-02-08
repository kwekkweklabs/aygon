import "./dotenv.js";

import fs from 'fs';
import { BattleManager } from './src/battle/BattleManager.js';
import { AIProvider } from './src/core/AIProvider.js';
export { COMBAT_ACTIONS } from './src/constants/types.js';
export { BATTLE_EVENTS } from './src/constants/types.js';

// Example usage:
const heroes = {
  // hero1: {
  //   name: 'KUCING OYEN',
  //   hp: 100,
  //   description: 'Literally just an orange cat.'
  // },
  // hero2: {
  //   name: "Lumina Flux",
  //   hp: 100,
  //   description: "A photon manipulator who bends light to blind, shield, and strike with radiant precision."
  // }
  hero1: {
    name: 'Dum Sipero-sipero',
    hp: 100,
    description: 'Anda lengah, uang anda buat saya/'
  },
  hero2: {
    name: "Farhan the chill smoker",
    hp: 100,
    description: "A chill smoker who loves to smoke and chill, unfazed by anything, even the end of the world."
  }
};

// Create AI provider
const aiProvider = new AIProvider('openai', {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
});
// const aiProvider = new AIProvider('ollama', {
//   model: 'llama3.2:latest'
// });

// Example of using terminal mode
const terminalBattle = new BattleManager(heroes, aiProvider, {
  visualizeMode: 'list', // 'terminal' or 'list'
  turnDelay: 3000
});

// Start the battle
terminalBattle.startBattle().catch(error => {
  console.error('Battle Error:', error);
});

// Example of using list mode (for frontend)
const listBattle = new BattleManager(heroes, aiProvider, {
  visualizeMode: 'list',
  turnDelay: 1000
});

// Start battle and poll for updates
listBattle.startBattle().catch(error => {
  console.error('Battle Error:', error);
});


let battleLog = [];
let stateId = 1;

const recordBattleState = () => {
  const currentState = listBattle.getBattleState();

  // Add ID to the state
  const stateWithId = {
    id: stateId++,
    ...currentState
  };

  // Only log if state has changed
  const lastState = battleLog[battleLog.length - 1];
  const currentStateString = JSON.stringify(currentState);
  const lastStateString = lastState ? JSON.stringify({
    ...lastState,
    id: stateWithId.id
  }) : null;

  if (!lastState || currentStateString !== lastStateString) {
    console.log('New battle state:', JSON.stringify(stateWithId, null, 2));
    battleLog.push(JSON.parse(JSON.stringify(stateWithId)));
  }

  if (currentState.battleStatus === 'ENDED') {
    console.log('Battle has ended!');
    // Only write to file once at the end
    fs.writeFileSync('battleLog.json', JSON.stringify(battleLog, null, 2));
    clearInterval(pollingInterval);
  }
};

// Start polling
const pollingInterval = setInterval(recordBattleState, 2000);

