// Auth middlweare reading token
import jwt from 'jsonwebtoken';
import { prismaQuery } from '../../lib/prisma.js';
import { privy } from '../../lib/privy.js';

export const authMiddleware = async (request, reply) => {
  const token = request.headers.authorization.split(' ')[1];
  console.log('Token:', token);

  let authData = null;
  try {
    const verifiedClaims = await privy.verifyAuthToken(token);
    console.log('Verified claims:', verifiedClaims);

    authData = verifiedClaims;
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`);
    return reply.code(401).send({
      error: 'Invalid token'
    });
  }

  const user = await prismaQuery.user.findUnique({
    where: {
      id: authData.userId
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

  // const user = await prismaQuery.user.findUnique({
  //   where: {
  //     email: 'testing@testing.com'
  //   }
  // })

  // request.user = user;
  // return true;
}