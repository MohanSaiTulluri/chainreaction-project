import hre from "hardhat";

async function main() {
  const name    = process.env.TOKEN_NAME   || "CampusCredit";
  const symbol  = process.env.TOKEN_SYMBOL || "CAMP";
  const initial = BigInt(process.env.TOKEN_INITIAL || "1000000");

  const { ethers } = await hre.network.connect();
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(name, symbol, initial);

  await token.waitForDeployment();
  const addr = await token.getAddress();

  console.log("Token deployed to:", addr);
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Decimals:", await token.decimals());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
