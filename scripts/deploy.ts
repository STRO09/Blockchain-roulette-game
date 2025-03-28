import { ethers } from "hardhat";

async function main() {
  const WheelBet = await ethers.getContractFactory("WheelBet");
  const wheelBet = await WheelBet.deploy();

  console.log("Deploying contract...");
  await wheelBet.waitForDeployment();
  console.log("Contract deployed to:", await wheelBet.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
