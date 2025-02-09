import { prismaQuery } from "../../lib/prisma.js";
import { BattleRegistry } from "../battle/BattleRegistry.js";
import { AIProvider } from "../core/AIProvider.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAlphanumericId } from "../utils/miscUtils.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const battleRoutes = (app, _, done) => {
  const battleRegistry = new BattleRegistry();

  app.post('/:roomId/start', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const room = await prismaQuery.room.findUnique({
        where: {
          id: request.params.roomId
        },
        include: {
          hero1: true,
          hero2: true
        }
      });

      console.log('Starting battle between', {
        hero1: room.hero1,
        hero2: room.hero2
      });

      const battleId = `battle-${room.id}-${getAlphanumericId(5)}`;

      const heroes = {
        hero1: {
          name: room.hero1.name,
          description: room.hero1.description,
          hp: 100,
        },
        hero2: {
          name: room.hero2.name,
          description: room.hero2.description,
          hp: 100,
        }
      };

      // const aiProvider = new AIProvider('ollama', {
      //   model: 'llama3.2:latest'
      // });
      const aiProvider = new AIProvider('openai', {
        model: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY
      });
      // const aiProvider = new AIProvider('gaia', {
      // });


      // Create battle and get the battle instance
      const battle = battleRegistry.createBattle(
        battleId,
        heroes,
        aiProvider,
        {
          turnDelay: 3000
        }
      );

      // Create battle record in database
      await prismaQuery.battle.create({
        data: {
          id: battleId,
          hero1Id: room.hero1.id,
          hero2Id: room.hero2.id,
          winnerHeroId: null,
          status: 'PENDING'
        }
      });

      // Start battle in background using the battle instance
      Promise.resolve().then(async () => {
        try {
          console.log(`Starting battle ${battleId} in background`);
          await battle.startBattle(); // Call startBattle on the battle instance

          // Update battle status to ONGOING once started
          await prismaQuery.battle.update({
            where: { id: battleId },
            data: { status: 'ONGOING' }
          });

          console.log(`Battle ${battleId} started successfully`);
        } catch (error) {
          console.error(`Error starting battle ${battleId}:`, error);

          // Update battle status to ERROR if start fails
          await prismaQuery.battle.update({
            where: { id: battleId },
            data: {
              status: 'ERROR',
              errorMessage: error.message
            }
          });
        }
      });

      // Return response immediately with battle details
      return reply.status(200).send({
        battleId: battleId,
        status: 'INITIALIZED',
        room: room.name,
        hero1: room.hero1,
        hero2: room.hero2,
      });

    } catch (error) {
      console.error('Error in /battle/start:', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error.message,
        data: null,
      });
    }
  });


  app.get('/:battleId/states', async (request, reply) => {
    try {
      const battleId = request.params.battleId;
      console.log('Getting battle states for', battleId);

      const battleStates = await prismaQuery.battleState.findMany({
        where: {
          battleId: battleId
        },
        orderBy: {
          turnIndex: 'asc'
        }
      });

      return reply.status(200).send(battleStates);


    } catch (error) {
      console.error('Error in /battle/states:', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error.message,
        data: null,
      });
    }
  })


  done();
}