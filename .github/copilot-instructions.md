This repository contains two small DApp projects in one workspace: a minimal single-file ERC-20 web DApp (root `index.html`) and a React/Vite front-end in `client/` that demonstrates a food traceability UI wired to MetaMask and a local Hardhat chain.

Quick context (what matters):
- Contracts: `contracts/MyToken.sol` (OpenZeppelin ERC20). Deployment logic in `scripts/deploy.js` uses Hardhat's ethers plugin.
- Hardhat config: `hardhat.config.js` targets a local DIDLab/Hardhat node (RPC: `http://100.114.157.9:8545`, chainId `31337`) and uses the `@nomicfoundation/hardhat-ethers` plugin.
- Root single-file DApp: `index.html` is a standalone example (serve over http:// to avoid ESM import restrictions).
- React app: `client/` is a Vite React app (run with `npm run dev` from `client/`) and contains the main UI in `client/src/`.

What to do first (developer flows an AI agent will need):
- Local dev web server for the root DApp: run `npx http-server -p 8000` from the repository root and open `http://localhost:8000`.
- Run React dev server: `cd client && npm install && npm run dev` (Vite). The app mounts at `/src/main.jsx` and expects `window.ethereum` (MetaMask).
- Deploy token locally with Hardhat: set env vars `TOKEN_NAME`, `TOKEN_SYMBOL`, `TOKEN_INITIAL` as desired and run `npx hardhat run scripts/deploy.js --network hardhat` (Hardhat network must be reachable at the configured RPC). The deploy script prints the token address.

Project-specific conventions & patterns for code edits:
- Chain/Network: Code expects a Hardhat/local chain with chainId 31337 expressed as hex `0x7a69` in the front-end. See `client/src/components/WalletConnect.jsx` for the exact `HARDHAT_NETWORK` object and `localStorage` keys.
- MetaMask UX: The app programmatically calls `wallet_switchEthereumChain` and falls back to `wallet_addEthereumChain` when chain 0x7a69 is missing. Adopt the same approach when adding network helpers.
- Persistence keys: role is persisted with `localStorage` key `ft-role`. Respect this key when changing role-related code.
- Balance format: `client/src/utils.js` uses `ethers.formatEther` and returns human-friendly strings like `0.0000` or `x.xxxx`; new code that displays balances should reuse `formatBalance` for consistency.

Files to inspect for examples (quick links):
- `contracts/MyToken.sol` - ERC20 minting pattern (constructor multiplies by decimals).
- `scripts/deploy.js` - Hardhat deploy example and how it prints metadata.
- `hardhat.config.js` - network types and the RPC host used by the UI.
- `client/src/components/WalletConnect.jsx` - canonical pattern for MetaMask connect, chain switching, account and chain listeners, balance refresh.
- `client/src/components/RolePicker.jsx` - localStorage usage for `ft-role` and role-driven UI.

Integration points & external deps:
- OpenZeppelin ERC20 (`@openzeppelin/contracts`) is used by the contract.
- `ethers` is used in both scripts and the client (v6 API: BrowserProvider, formatEther, getAddress). Use v6 signatures when writing code; see existing usages in `client/src`.
- Vite React dev flow in `client/` vs the static `index.html` example — do not try to bundle or mix them; they are separate demos.

Testing & debugging notes (what worked in repository):
- No automated tests included. Quick smoke tests:
  - Serve `index.html` and connect MetaMask; paste token address from `scripts/deploy.js` output into the UI.
  - In `client/`, run Vite dev server and use browser devtools to view console logs from `WalletConnect.jsx`.

What NOT to change unless necessary:
- `hardhat.config.js` network values. Many UI defaults reference the exact RPC URL and chainId; changing them will require updating `WalletConnect.jsx` and README instructions.
- `MyToken.sol` decimals/initialSupply multiplication: the contract mints `initialSupply * 10 ** decimals()`; if you change decimals, keep the mint math consistent.

When adding code, follow these small habits used in the repo:
- Use ESM imports and the v6 `ethers` API patterns shown across `client/src`.
- Preserve UX around wallet prompts: call `wallet_switchEthereumChain` first and handle the 4902 case by adding the chain.
- Persist user-facing selection keys exactly (`ft-role`) to avoid breaking user state between pages.

If you need more context or a different format (longer agent playbook, task templates, or sample PR messages), tell me which parts to expand and I'll iterate.

---
If this file existed before, I merged top-level facts and kept project-specific values from `client/src/components/WalletConnect.jsx`, `hardhat.config.js`, and `scripts/deploy.js`.
