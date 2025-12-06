// src/contractConfig.js

// 1. Copy the ABI array from backend/artifacts/.../PetRegistry.json
export const PET_REGISTRY_ABI = [
  // 🔽 Replace this comment and everything below with your real ABI 🔽
  // Example structure only:
  // {
  //   "inputs": [...],
  //   "name": "registerPet",
  //   "outputs": [...],
  //   "stateMutability": "nonpayable",
  //   "type": "function"
  // },
  // ...
];

// 2. Paste the address printed by `node scripts/deploy.js`
export const PET_REGISTRY_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
