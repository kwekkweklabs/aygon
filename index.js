import "./dotenv.js";

import Fastify from "fastify";
import FastifyCors from "@fastify/cors";

import fs from 'fs';
import { BattleManager } from './src/battle/BattleManager.js';
import { AIProvider } from './src/core/AIProvider.js';
import { coreRoutes } from "./src/routes/coreRoutes.js";
import { prismaQuery } from "./lib/prisma.js";
import { heroRoutes } from "./src/routes/heroRoutes.js";
import { roomRoutes } from "./src/routes/roomRoutes.js";
import { battleRoutes } from "./src/routes/battleRoutes.js";
import { authRoutes } from "./src/routes/authRoutes.js";
export { COMBAT_ACTIONS } from './src/constants/types.js';
export { BATTLE_EVENTS } from './src/constants/types.js';

console.log(
  "======================\n======================\nMY BACKEND SYSTEM STARTED!\n======================\n======================\n"
);

const fastify = Fastify({
  logger: false,
});

fastify.register(FastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", 'apass', 'dynamic-token', 'email'],
});

fastify.get("/", async (request, reply) => {
  return reply.status(200).send({
    message: "WELCOME YO AYGON! ",
    error: null,
    data: null,
  });
});

fastify.register(authRoutes, {
  prefix: '/auth',
})

fastify.register(heroRoutes, {
  prefix: '/hero',
})

fastify.register(roomRoutes, {
  prefix: '/room',
})

fastify.register(battleRoutes, {
  prefix: '/battle',
})

fastify.register(coreRoutes, {
  prefix: '/core',
})

// // Example usage:
// const heroes = {
//   hero1: {
//     name: 'Vitalik Buterin',
//     hp: 100,
//     description: 'Ethereum Co founder'
//   },
//   hero2: {
//     name: "Aygon",
//     hp: 100,
//     description: "An elemental god, conquers all elements. A master of fire, water, earth, air, light, and darkness."
//   }
// };

// // Create AI provider
// const aiProvider = new AIProvider('openai', {
//     apiKey: process.env.OPENAI_API_KEY,
//     model: 'gpt-4o'
// });
// // const aiProvider = new AIProvider('ollama', {
// //   model: 'llama3.2:latest'
// // });

// // Example of using terminal mode
// const terminalBattle = new BattleManager(heroes, aiProvider, {
//   visualizeMode: 'list', // 'terminal' or 'list'
//   turnDelay: 3000
// });

// // Start the battle
// terminalBattle.startBattle().catch(error => {
//   console.error('Battle Error:', error);
// });

// // Example of using list mode (for frontend)
// const listBattle = new BattleManager(heroes, aiProvider, {
//   visualizeMode: 'list',
//   turnDelay: 1000
// });

// // Start battle and poll for updates
// listBattle.startBattle().catch(error => {
//   console.error('Battle Error:', error);
// });


// let battleLog = [];
// let stateId = 1;

// const recordBattleState = () => {
//   const currentState = listBattle.getBattleState();

//   // Add ID to the state
//   const stateWithId = {
//     id: stateId++,
//     ...currentState
//   };

//   // Only log if state has changed
//   const lastState = battleLog[battleLog.length - 1];
//   const currentStateString = JSON.stringify(currentState);
//   const lastStateString = lastState ? JSON.stringify({
//     ...lastState,
//     id: stateWithId.id
//   }) : null;

//   if (!lastState || currentStateString !== lastStateString) {
//     console.log('New battle state:', JSON.stringify(stateWithId, null, 2));
//     battleLog.push(JSON.parse(JSON.stringify(stateWithId)));
//   }

//   if (currentState.battleStatus === 'ENDED') {
//     console.log('Battle has ended!');
//     // Only write to file once at the end
//     fs.writeFileSync('./temp/battleLog.json', JSON.stringify(battleLog, null, 2));
//     clearInterval(pollingInterval);
//   }
// };

// // Start polling
// const pollingInterval = setInterval(recordBattleState, 2000);


const seedData = async () => {
  // Upsert user
  const user = await prismaQuery.user.upsert({
    where: {
      email: 'testing@testing.com'
    },
    create: {
      email: 'testing@testing.com',
      name: 'testing',
      address: '0x6C62d74b46b5F8bB946b33588c68AF4cF7b812CC',
    },
    update: {}
  });

  const ROOM = [
    {
      id: 'room-1',
      name: 'Room 1',
      hero1Id: 'cm6wouzbg0001vdceovhwyfix',
      hero2Id: 'cm6wowgl60001vdbj6dvegzju',
    },
    {
      id: 'room-2',
      name: 'Room 2',
    },
    {
      id: 'room-3',
      name: 'Room 3',
    },
    {
      id: 'room-4',
      name: 'Room 4',
    },
  ]

  // upsert rooms 
  for (const room of ROOM) {
    await prismaQuery.room.upsert({
      where: {
        id: room.id
      },
      create: {
        id: room.id,
        name: room.name,
        hero1Id: room.hero1Id,
        hero2Id: room.hero2Id,
      },
      update: {}
    });
  }

  console.log('Seed data complete');
}

// seedData().catch(error => {
//   console.error('Seed data error:', error);
// });


const start = async () => {
  try {
    const port = process.env.APP_PORT || 3690;
    await fastify.listen({
      port: port,
      host: "0.0.0.0",
    });

    console.log(
      `Server started successfully on port ${fastify.server.address().port}`
    );
    console.log(`http://localhost:${fastify.server.address().port}`);
  } catch (error) {
    console.log("Error starting server: ", error);
    process.exit(1);
  }
};

start();