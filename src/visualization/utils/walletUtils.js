import { ethers } from "ethers";

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
  winnerUserId,
  loserUserId,
  amount = 0.001
}) => {
  try {
    
  } catch (error) {
    
  }
}