# PetChainID+

PetChainID+ is an Ethereum-based dApp for giving pets a portable on-chain identity and a shared medical history. Pet owners can register pets, manage co-owners, and publish lost-pet status. Approved veterinarians can add immutable medical records, while owners and approved vets can read the relevant history.

## Features

- Register pets with a name, species, breed, and birth year
- Manage primary and co-owners
- Enable or disable lost-pet mode
- Generate and scan QR codes for lost-pet lookup
- Add and view cross-clinic medical records
- Admin approval and revocation of veterinarian wallets
- MetaMask wallet connection on the Sepolia testnet

## Repository layout

```text
backend/
  contracts/       Solidity contracts
  artifacts/       Contract artifacts and metadata
frontend/
  src/             React application and Web3 integration
  public/          Static web assets
vercel.json        Vercel deployment configuration
```

## Smart contracts

- `PetRegistry.sol` stores pet identities, ownership, and lost mode.
- `MedicalRecords.sol` stores medical records and controls veterinarian access.

Both contracts use Solidity `^0.8.20` and are licensed under GPL-3.0. Deploy `PetRegistry` first, then pass its address to the `MedicalRecords` constructor.

## Deployed Sepolia contracts

The frontend is currently configured for Sepolia (`0xaa36a7`, chain ID `11155111`):

| Contract | Address |
| --- | --- |
| PetRegistry | `0x7d7e917b3D5a44f4CEdd6E2969208D43274A993f` |
| MedicalRecords | `0xE551657117C10Ce38f85b0101714499Fa14e5Df1` |

Verify these addresses before using the application. They are configured in `frontend/src/contractConfig.js`.

## Run locally

### Prerequisites

- Node.js 14 or newer
- npm
- MetaMask
- Sepolia test ETH for transactions

### Install and start

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000`, connect MetaMask, and switch to Sepolia. Camera access for QR scanning requires HTTPS in deployed environments; localhost is supported during development.

### Production build

```bash
cd frontend
npm run build
```

The production output is written to `frontend/build`.

## Deploying

The included `vercel.json` builds the frontend from the repository root:

```bash
vercel deploy
```

For a new contract deployment, update both addresses in `frontend/src/contractConfig.js` and ensure the ABI matches the deployed contracts. Never commit private keys, seed phrases, or RPC credentials.

## Known limitations

- Contract addresses and ABIs are currently compiled into the frontend.
- Medical record contents are stored on a public blockchain; do not write sensitive personal information to the contracts.
- The application currently targets Sepolia rather than Ethereum mainnet.

## License

GPL-3.0. See the SPDX headers in `backend/contracts`.

