import { ethers } from "ethers";
import { prismaQuery } from "../../../lib/prisma.js";
import { privy } from "../../../lib/privy.js";
import { baseSepolia } from "viem/chains";
import { createWalletClient, http, parseEther } from 'viem';
import { createViemAccount } from '@privy-io/server-auth/viem';

export const handleSendSponsorGas = async (recipient, amount) => {
  try {
    console.log(`Sending ${amount} ETH to ${recipient}`);
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(process.env.SPONSOR_PK, provider);

    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther(amount.toString())
    });

    console.log('Transaction:', tx);
  } catch (error) {
    console.log('Error on sendSponsorGas', error);
  }
}

// TODO: Send prize money
export const sendPrizeMoney = async ({
  battleId,
  winnerUserId,
  loserUserId,
  amount = 0.01
}) => {
  try {
    console.log(`Sending ${amount} ETH to ${winnerUserId} from ${loserUserId}`);

    const winnerUser = await prismaQuery.user.findUnique({
      where: { id: winnerUserId }
    });

    const loserUser = await prismaQuery.user.findUnique({
      where: { id: loserUserId }
    })

    const account = await createViemAccount({
      walletId: loserUser.privyWalletId,
      address: loserUser.privyWalletAddress,
      privy: privy
    })

    const client = createWalletClient({
      account, // `Account` instance from above
      chain: baseSepolia,
      transport: http(),
    });

    const hash = await client.sendTransaction({
      to: winnerUser.privyWalletAddress,
      value: ethers.parseEther(amount),
    });

    console.log("Prize money sent:", hash);

    await prismaQuery.battle.update({
      where: {
        id: battleId
      },
      data: {
        prizeTxHash: hash,
      }
    })
  } catch (error) {
    console.log('Error on sendPrizeMoney', error);
  }
}