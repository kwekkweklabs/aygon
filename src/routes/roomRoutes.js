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
                  email: true,
                  privyWalletAddress: true
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
                  email: true,
                  privyWalletAddress: true
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

  app.get('/detail/:roomId', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const roomId = request.params.roomId;
      const room = await prismaQuery.room.findUnique({
        where: {
          id: roomId
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
                  email: true,
                  privyWalletAddress: true
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
                  email: true,
                  privyWalletAddress: true
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

      return reply.status(200).send(room);
    } catch (error) {
      console.log('error on /room/:roomId', error);
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
    try {
      const user = request.user;
      const roomId = request.params.roomId;
      const { heroId } = request.body;

      const room = await prismaQuery.room.findUnique({
        where: {
          id: roomId
        }
      })

      if (room.state === 'PLAYING') {
        return reply.status(400).send({
          message: 'Room is currently playing',
          error: null,
          data: null,
        });
      }

      if (room.hero1Id === heroId || room.hero2Id === heroId) {
        return reply.status(400).send({
          message: 'Hero already joined the room',
          error: null,
          data: null,
        });
      }

      if (!room.hero1Id) {
        await prismaQuery.room.update({
          where: { id: roomId },
          data: { hero1Id: heroId }
        })
      } else if (!room.hero2Id) {
        await prismaQuery.room.update({
          where: { id: roomId },
          data: { hero2Id: heroId }
        })
      } else {
        return reply.status(400).send({
          message: 'Room is full',
          error: null,
          data: null,
        });
      }

      return reply.status(200).send({
        message: 'Hero joined the room',
        error: null,
        data: null,
      });
    } catch (error) {
      console.log('error on /room/join', error);
    }
  })

  app.post('/:roomId/leave', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const user = request.user;
      const roomId = request.params.roomId;

      const room = await prismaQuery.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          hero1: {
            include: {
              user: true
            }
          },
          hero2: {
            include: {
              user: true
            }
          }
        }
      })

      if (room.state === 'PLAYING') {
        return reply.status(400).send({
          message: 'Room is currently playing',
          error: null,
          data: null,
        });
      }

      // Check by the hero owner user id
      if (room.hero1.user.id !== user.id && room.hero2.user.id !== user.id) {
        return reply.status(400).send({
          message: 'You are not the owner of the hero',
          error: null,
          data: null,
        });
      }

      if(room.hero1.user.id === user.id){
        await prismaQuery.room.update({
          where: { id: roomId },
          data: { hero1Id: null }
        })
      } else if(room.hero2.user.id === user.id){
        await prismaQuery.room.update({
          where: { id: roomId },
          data: { hero2Id: null }
        })
      }

      return reply.status(200).send({
        message: 'Hero left the room',
        error: null,
        data: null,
      });
    } catch (error) {
      console.log('error on /room/leave', error);
    }
  })

  done();
}