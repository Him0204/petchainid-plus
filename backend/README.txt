# PetChainID - Smart Contracts Backend

## Overview

PetChainID is a blockchain-based pet identification and medical records management system built on Ethereum. This backend contains the core smart contracts that enable decentralized pet registration, ownership management, and cross-clinic medical record sharing.

## Architecture

The system consists of two main smart contracts:

### 1. PetRegistry.sol
Core contract for pet identity management with the following features:
- **Pet Registration**: Register pets with unique on-chain identities
- **Ownership Management**: Support for primary owners and co-owners
- **Lost Pet Mode**: Toggle lost status for community-driven pet recovery
- **Access Control**: Owner-only functions for pet management

### 2. MedicalRecords.sol
Medical records management contract with role-based access:
- **Veterinarian Approval**: Admin-controlled vet authorization system
- **Medical Record Creation**: Approved vets can add immutable medical records
- **Cross-Clinic Access**: Any approved vet can view complete medical history
- **Owner Access**: Pet owners can view their pets' complete medical records
- **Data Privacy**: Access restricted to authorized vets and owners only

## Contract Specifications

### PetRegistry.sol
- **License**: GPL-3.0
- **Solidity Version**: ^0.8.20
- **Key Functions**:
  - `registerPet()`: Register a new pet
  - `setLostMode()`: Mark pet as lost or found
  - `addCoOwner()`: Add co-owner to a pet
  - `removeCoOwner()`: Remove co-owner from a pet
  - `getPet()`: Retrieve pet information
  - `getPetsOfOwner()`: Get all pets owned by an address
  - `isOwner()`: Check if address is owner/co-owner of a pet

### MedicalRecords.sol
- **License**: GPL-3.0
- **Solidity Version**: ^0.8.20
- **Dependencies**: Requires deployed PetRegistry contract address
- **Key Functions**:
  - `setVet()`: Admin function to approve/revoke vet access
  - `addRecord()`: Approved vets add medical records
  - `getRecord()`: Retrieve specific medical record
  - `getRecordIdsForPet()`: Get all record IDs for a pet
  - `isVet()`: Check if address is an approved veterinarian

## Deployment Instructions

### Prerequisites
- Remix IDE (https://remix.ethereum.org) or Hardhat
- MetaMask wallet with testnet ETH (Sepolia recommended)
- Basic understanding of Solidity and smart contract deployment

### Deployment Steps

#### Using Remix IDE:

1. **Open Remix IDE**
   - Navigate to https://remix.ethereum.org
   - Create a new workspace or use existing

2. **Import Contracts**
   ```
   - Upload PetRegistry.sol to contracts folder
   - Upload MedicalRecords.sol to contracts folder
   ```

3. **Compile Contracts**
   - Select Solidity Compiler (0.8.20 or higher)
   - Enable optimization (200 runs recommended)
   - Compile PetRegistry.sol
   - Compile MedicalRecords.sol

4. **Deploy PetRegistry**
   - Switch to "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask" as environment
   - Connect to Sepolia testnet in MetaMask
   - Select "PetRegistry" contract
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - **Save the deployed contract address** (e.g., 0x123...)

5. **Deploy MedicalRecords**
   - Select "MedicalRecords" contract
   - Enter PetRegistry address in constructor parameter
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - **Save the deployed contract address**

6. **Export ABIs**
   - Go to Artifacts folder
   - Download `PetRegistry.json` and `MedicalRecords.json`
   - Copy ABI arrays to frontend/src/contractConfig.js

7. **Update Frontend Configuration**
   ```javascript
   // frontend/src/contractConfig.js
   export const PET_REGISTRY_ADDRESS = "0x<your-pet-registry-address>";
   export const MEDICAL_RECORDS_ADDRESS = "0x<your-medical-records-address>";
   ```

### Network Configuration

**Sepolia Testnet (Recommended)**
- Chain ID: 11155111 (0xaa36a7)
- RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Block Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

**Current Deployment (Example)**
- PetRegistry: 0x5b8C9EF92a7a72ACa4dEBe2e882C010f87Bee613
- MedicalRecords: 0xE551657117C10Ce38f85b0101714499Fa14e5Df1
- Network: Sepolia

## Smart Contract Testing

### Manual Testing via Remix:

1. **Test Pet Registration**
   ```
   - Call registerPet("Max", "Dog", "Golden Retriever", 2020)
   - Note the returned petId
   ```

2. **Test Lost Mode**
   ```
   - Call setLostMode(petId, true)
   - Verify lostMode is updated
   ```

3. **Test Co-Owner Management**
   ```
   - Call addCoOwner(petId, coOwnerAddress)
   - Call getPetOwners(petId) to verify
   ```

4. **Test Vet Approval (Admin only)**
   ```
   - Call setVet(vetAddress, true)
   - Verify with isVet(vetAddress)
   ```

5. **Test Medical Record Creation (Approved vet)**
   ```
   - Call addRecord(petId, "Annual Checkup", "Healthy, vaccines updated")
   - Call getRecordIdsForPet(petId) to verify
   ```

## Security Considerations

- **Access Control**: Only owners can modify their pets; only approved vets can add records
- **Data Immutability**: Medical records cannot be modified after creation
- **Admin Role**: MedicalRecords admin can approve/revoke vet access
- **Input Validation**: All functions validate inputs before execution
- **Gas Optimization**: Efficient data structures and minimal storage operations

## Events

### PetRegistry Events:
- `PetRegistered(uint256 petId, address owner, string name)`
- `LostModeUpdated(uint256 petId, bool lostMode)`
- `CoOwnerAdded(uint256 petId, address newOwner)`
- `CoOwnerRemoved(uint256 petId, address removedOwner)`

### MedicalRecords Events:
- `RecordAdded(uint256 recordId, uint256 petId, address vet)`
- `VetApprovalChanged(address vet, bool approved)`

## Troubleshooting

**Issue: Transaction fails with "Not authorized"**
- Ensure you're using the correct wallet address
- Verify ownership for pet operations
- Check vet approval status for medical records

**Issue: Cannot deploy MedicalRecords**
- Verify PetRegistry is deployed first
- Check PetRegistry address is correct
- Ensure sufficient gas limit

**Issue: Frontend cannot connect to contracts**
- Verify contract addresses in contractConfig.js
- Check network chain ID matches (Sepolia: 0xaa36a7)
- Ensure MetaMask is on correct network

## Gas Estimates

- Register Pet: ~150,000 gas
- Add Medical Record: ~120,000 gas
- Set Lost Mode: ~45,000 gas
- Add Co-Owner: ~80,000 gas

## License

GPL-3.0 License - See contract headers for details

## Support

For issues or questions:
- Check contract events for transaction details
- Review Sepolia Etherscan for transaction status
- Ensure all prerequisites are met before deployment
