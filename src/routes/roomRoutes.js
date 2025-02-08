import { prismaQuery } from '../../lib/prisma.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateRequiredFields } from '../utils/miscUtils.js';

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const roomRoutes = (app, _, done) => {
  app.get('/list', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const rooms = await prismaQuery.room.findMany({
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          name: true,
          hero1: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  address: true
                }
              }
            }
          },
          hero2: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  address: true
                }
              }
            }
          },
          state: true,
          currentBattleId: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return reply.status(200).send(rooms);
    } catch (error) {
      console.log('error on /room/list', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error,
        data: null,
      });
    }
  })

  // TODO: should be a websocket
  app.post('/:roomId/join', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    
  })

  done();
}