# Food Traceability DIDLab DApp

This repo contains the FoodSupplyChain smart contract plus the React dashboard that now targets the DIDLab EVM test network (chain ID 252501). The default deployer account matches the MetaMask account you provided (`0xf39F...266`).

## Prerequisites
- Node.js 18+
- pnpm/npm (examples below use npm)
- MetaMask configured with the DIDLab network:
  - RPC: `https://eth.didlab.org`
  - Chain ID: `252501`
  - Currency symbol: `ETH`
  - Explorer: `https://explorer.didlab.org`

## Environment
Copy `.env` (already filled with the DIDLab RPC + private key you shared) or customize the following variables:

```
DIDLAB_RPC_URL=https://eth.didlab.org
DIDLAB_DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

All Hardhat tasks/scripts read `DIDLAB_RPC_URL` / `DIDLAB_DEPLOYER_KEY` first and fall back to `RPC_URL` / `DEPLOYER_KEY` so you can keep using existing workflows if you prefer.

## Install
```
npm install
cd client && npm install
```

## Deploy FoodSupplyChain to DIDLab
```
npx hardhat compile
npx hardhat run --network didlab scripts/deploy_supplychain.js
```
The deploy script logs the RPC, deployer address, transaction hash, and the resulting contract address. Use those values inside the dashboard and copy them into your DIDLab project report.

## Run the React client
```
cd client
npm run dev
```
Open the printed URL (default `http://127.0.0.1:5173`). Connect MetaMask, approve the DIDLab chain switch, and proceed with the farmer role flow.

## Role flows (demo scope)
- **Farmer** – `/farmer/dashboard` after logging in with `farmer / farmer@123`. Create batches, attach documents, and hand them off to distributors.
- **Distributor** – `/distributor`. Paste the contract address, batch ID, and destination retailer address to confirm custody.
- **Retailer** – `/retailer`. Approve an incoming batch and add a customer-facing price (ETH).
- **Regulator** – `/regulator`. Record a simple approve/reject decision with an optional note.

## Notes
- The deploy script defaults to the supplied private key for convenience; replace it in `.env` if you rotate wallets.
- No additional role/permission logic was added, per the educational scope requirement. The priority is demonstrating a DIDLab deployment end-to-end.
- Use the DIDLab faucet and explorer to fund the wallet and verify your transactions/contracts.
