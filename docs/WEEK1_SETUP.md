# DIDLab Setup - Food Traceability Blockchain Project

## Goal
Run the FoodSupplyChain contract and farmer dashboard directly on DIDLab (chain ID 252501) instead of a local Hardhat node.

## Prerequisites
- Node.js v18+
- MetaMask with a DIDLab account imported (use the private key `0xac0974b...ff80` if you want the default wallet `0xf39F...266`)
- Git & npm

## Network Configuration
- RPC: `https://eth.didlab.org`
- Chain ID: `252501`
- Currency symbol: `ETH`
- Explorer: `https://explorer.didlab.org`
- Faucet: https://faucet.didlab.org (sign with the same wallet)

## Folder Layout
```
didlab-app/
|-- contracts/
|-- client/
|   `-- src/
|-- scripts/
`-- docs/
```

## Configure Environment
`.env` already points to DIDLab. Update it if you rotate wallets:
```
DIDLAB_RPC_URL=https://eth.didlab.org
DIDLAB_DEPLOYER_KEY=0x<your-private-key>
```

## Install Dependencies
```
npm install
cd client && npm install
```

## Deploy to DIDLab
```
npx hardhat compile
npx hardhat run --network didlab scripts/deploy_supplychain.js
```
Record the console output (deployer, tx hash, contract address). Paste the address into the farmer dashboard.

## Run the Frontend
```
cd client
npm run dev
```
Navigate to the printed URL, connect MetaMask, approve the DIDLab chain switch, then continue with the farmer login (`farmer` / `farmer@123`).

## Interaction Checklist
1. Ensure MetaMask shows DIDLab Network (252501).
2. Connect via the landing page and verify the wallet badge changes to DIDLab.
3. Visit `/farmer/login`, confirm the DIDLab badge, and log in with the demo credentials.
4. On the farmer dashboard, paste the DIDLab contract address, create a batch, and confirm the transaction on the explorer.
5. Open `/distributor`, `/retailer`, and `/regulator` for the simple custody → pricing → approval steps after a batch is created.

## Troubleshooting
- **Chain mismatch**: click "Switch to DIDLab" in the WalletConnect card.
- **Insufficient funds**: request test ETH from the DIDLab faucet using the deployed address.
- **Missing artifacts**: run `npx hardhat compile` before deploying.
