import "dotenv/config";
import { JsonRpcProvider, Wallet, ContractFactory, parseUnits } from "ethers";
// Use createRequire to load JSON artifact without import assertions (works on wider Node versions)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const artifact = require("../artifacts/contracts/FoodSupplyChain.sol/FoodSupplyChain.json");

const DEFAULT_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC = process.env.DIDLAB_RPC_URL || process.env.RPC_URL || "https://eth.didlab.org";
const RAW_KEY = process.env.DIDLAB_DEPLOYER_KEY || process.env.DEPLOYER_KEY || DEFAULT_KEY;
const KEY = RAW_KEY && RAW_KEY.startsWith("0x") ? RAW_KEY : RAW_KEY ? `0x${RAW_KEY}` : "";
const GAS_LIMIT = Number(process.env.DIDLAB_GAS_LIMIT || 3_000_000);
const GAS_PRICE_GWEI = process.env.DIDLAB_GAS_PRICE_GWEI || "1.5";

async function main() {
  if (!KEY || KEY.length !== 66) {
    throw new Error("DEPLOYER_KEY missing/invalid. Provide a DIDLab key in .env (DEPLOYER_KEY=0x...).");
  }

  const provider = new JsonRpcProvider(RPC);
  const signer = new Wallet(KEY, provider);
  console.log("RPC:", RPC);
  console.log("Deployer:", signer.address);

  // Ensure artifact is present (run `npx hardhat compile` if not)
  const { abi, bytecode } = artifact;
  if (!abi || !bytecode) throw new Error("Artifact not found. Compile the contracts first.");

  const factory = new ContractFactory(abi, bytecode, signer);
  const overrides = {
    gasLimit: GAS_LIMIT,
    gasPrice: parseUnits(GAS_PRICE_GWEI, "gwei"),
    type: 0,
  };
  const contract = await factory.deploy(overrides);
  const deploymentTx = contract.deploymentTransaction();
  console.log("Deploy tx hash:", deploymentTx?.hash ?? "pending");
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("FoodSupplyChain deployed at:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
