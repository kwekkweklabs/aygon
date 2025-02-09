import fastify from "fastify";
import { privy } from "../../lib/privy.js";
import { prismaQuery } from "../../lib/prisma.js";
import { validateRequiredFields } from "../utils/miscUtils.js";
import { ethers } from "ethers";
import { handleSendSponsorGas } from "../visualization/utils/walletUtils.js";


/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const authRoutes = (app, _, done) => {
  app.post('/login', async (request, reply) => {
    try {
      const token = request.headers.authorization.split(' ')[1];

      let authData = null;

      try {
        const verifiedClaims = await privy.verifyAuthToken(token);
        authData = verifiedClaims;
      } catch (error) {
        console.log(`Token verification failed with error ${error}.`);
        return reply.code(401).send({
          error: 'Invalid token'
        });
      }

      const user = await prismaQuery.user.findFirst({
        where: {
          id: authData.userId
        },
        select: {
          id: true,
          email: true,
          privyWalletAddress: true,
          createdAt: true
        }
      })

      if (!user) {
        await validateRequiredFields(request.body, ['email'], reply);
        const email = request.body.email;

        // Create Privy's Server Wallet
        const { id, address, chainType } = await privy.walletApi.create({
          chainType: "ethereum",
        })

        console.log('User not found, creating new user');

        // TODO: Transfer 0.1 ETH to the user (Base Sepolia Testnet)
        await handleSendSponsorGas(address, 0.1);

        // Create new user 
        const newUser = await prismaQuery.user.create({
          data: {
            id: authData.userId,
            email: email,
            privyWalletId: id,
            privyWalletAddress: address,
          },
          select: {
            id: true,
            email: true,
            privyWalletAddress: true,
            createdAt: true
          }
        })

        return reply.status(200).send(newUser);
      } else {
        return reply.status(200).send(user);
      }
    } catch (error) {
      console.log('Error on /login', error);
      return reply.status(500).send({
        message: 'Internal server error',
        error: error,
        data: null,
      });
    }
  })






  done();
}