import { ethers } from "ethers";
import WheelBetABI from "../abis/WheelBet.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; 
console.log("Contract Address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is undefined! Make sure you set NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
  }
  
export const getContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, WheelBetABI.abi, providerOrSigner);
};
