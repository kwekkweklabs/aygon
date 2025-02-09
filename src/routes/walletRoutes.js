import { authMiddleware } from "../middlewares/authMiddleware.js"
import { sendPrizeMoney } from "../visualization/utils/walletUtils.js";
import { createWalletClient, http, parseEther } from 'viem';
import { createViemAccount } from '@privy-io/server-auth/viem';
import { privy } from '../../lib/privy.js';
import { baseSepolia } from 'viem/chains';
import { ethers } from "ethers";

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const walletRoutes = (app, _, done) => {
  app.post('/withdraw', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const { amount, recipient } = request.body;

      console.log('withdrawing', request.user)
      console.log({
        amount,
        recipient
      })

      const account = await createViemAccount({
        walletId: request.user.privyWalletId,
        address: request.user.privyWalletAddress,
        privy: privy
      })

      const client = createWalletClient({
        account, // `Account` instance from above
        chain: baseSepolia,
        transport: http(),
      });

      const hash = await client.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      return reply.status(200).send({
        message: 'Withdrawal successful',
        error: null,
        data: {
          hash
        }
      });
    } catch (error) {
      console.log('Error in /wallet/withdraw:', error);
    }
  })

  done()
}