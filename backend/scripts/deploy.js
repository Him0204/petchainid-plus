import Web3 from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Little helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // 1. Connect to the local Hardhat node
  const web3 = new Web3("http://127.0.0.1:8545");

  // 2. Load the compiled artifact (ABI + bytecode)
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "PetRegistry.sol",
    "PetRegistry.json"
  );
  const artifactRaw = fs.readFileSync(artifactPath, "utf-8");
  const artifact = JSON.parse(artifactRaw);

  const { abi, bytecode } = artifact;

  // 3. Get accounts from the local node (Hardhat gives many)
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];

  console.log("Deploying PetRegistry from account:", deployer);

  // 4. Create contract instance and deploy
  const contract = new web3.eth.Contract(abi);

  const deployed = await contract
    .deploy({ data: bytecode })
    .send({
      from: deployer,
      gas: 5_000_000, // simple gas limit; adjust if needed
    });

  console.log("✅ PetRegistry deployed to:", deployed.options.address);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
