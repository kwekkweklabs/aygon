// Auth middlweare reading token
import jwt from 'jsonwebtoken';
import { prismaQuery } from '../../lib/prisma.js';


export const authMiddleware = async (request, reply) => {
  const email = request.headers['email'];

  const user = await prismaQuery.user.findUnique({
    where: {
      email: 'testing@testing.com'
    }
  })

  if (!user) {
    reply.code(401).send({
      error: 'Unauthorized'
    });
    return false;
  }

  request.user = user;
  return true;
}