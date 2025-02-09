import { prismaQuery } from "../../lib/prisma.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateRequiredFields } from "../utils/miscUtils.js";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const heroRoutes = (app, _, done) => {
  app.get('/my-hero', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const heroes = await prismaQuery.hero.findMany({
        where: {
          userId: request.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      for (let i = 0; i < heroes.length; i++) {
        console.log('hero', heroes[i]);

        const allBattles = await prismaQuery.battle.findMany({
          where: {
            OR: [
              {
                hero1Id: heroes[i].id
              },
              {
                hero2Id: heroes[i].id
              }
            ],
            status: 'FINISHED'
          },
          select: {
            id: true,
            winnerHeroId: true
          }
        })

        // Where .winnerHeroId = heroes[i].id
        const winBattleCount = allBattles.filter(battle => battle.winnerHeroId === heroes[i].id).length;
        const loseBattleCount = allBattles.filter(battle => battle.winnerHeroId !== heroes[i].id).length;

        heroes[i].winBattleCount = winBattleCount;
        heroes[i].loseBattleCount = loseBattleCount;
      }

      return reply.status(200).send(heroes);
    } catch (error) {
      console.log('error on /hero/my-hero', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error,
        data: null,
      });
    }
  })

  app.post('/create', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      await validateRequiredFields(request.body,
        ['name', 'description', 'imageUrl'],
        reply
      );
      const hero = await prismaQuery.hero.create({
        data: {
          name: request.body.name,
          description: request.body.description,
          image: request.body.imageUrl,
          userId: request.user.id,
        }
      })

      return reply.status(200).send(hero);
    } catch (error) {
      console.log('error on /hero/create', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error,
        data: null,
      });
    }
  })

  app.post('/update', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      await validateRequiredFields(request.body,
        ['heroId', 'name', 'description', 'imageUrl'],
        reply
      );
      const hero = await prismaQuery.hero.update({
        where: {
          id: request.body.heroId,
          userId: request.user.id
        },
        data: {
          name: request.body.name,
          description: request.body.description,
          image: request.body.imageUrl,
        }
      })

      return reply.status(200).send(hero);
    } catch (error) {
      console.log('error on /hero/update', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error,
        data: null,
      });
    }
  })

  done();
}