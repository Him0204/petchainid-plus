# 🐾 PetChainID - Frontend Application

## Overview

PetChainID is a decentralized application (dApp) built with React that provides a Web3 interface for blockchain-based pet identification and medical records management. The application connects to Ethereum smart contracts to enable pet registration, ownership management, lost pet recovery, and cross-clinic medical record sharing.

## Features

### 👤 Pet Owner Dashboard
- **Pet Registration**: Register pets with unique on-chain identities
- **Ownership Management**: Add/remove co-owners for shared pet custody
- **Lost Pet Mode**: Mark pets as lost with QR code generation
- **Lost Pet Finder**: Search for lost pets by ID or QR code scan (no wallet required)
- **Medical Records**: View complete cross-clinic medical history
- **QR Code Generation**: Generate scannable QR codes for each pet

### ⚕️ Veterinarian Dashboard
- **Medical Record Creation**: Add immutable treatment records to blockchain
- **Patient History**: View complete medical records for any pet
- **Cross-Clinic Access**: Access records from other veterinary clinics
- **Treatment Documentation**: Record diagnoses, treatments, and procedures

### 👑 Admin Dashboard
- **Vet Approval Management**: Approve or revoke veterinarian access
- **System Oversight**: Manage the medical records authorization system

## Technology Stack

- **Frontend Framework**: React 19.2.1
- **Blockchain Integration**: Web3.js 4.16.0
- **Wallet Connection**: MetaMask
- **QR Code**: qrcode.react 4.2.0
- **QR Scanner**: html5-qrcode 2.3.8
- **Styling**: Custom CSS with CSS Variables
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: React Testing Library

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template with 🐾 PetChainID branding
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO configuration
├── src/
│   ├── App.js              # Main application component & routing
│   ├── App.css             # Application styling
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   ├── contractConfig.js   # Smart contract ABIs and addresses
│   └── components/
│       ├── OwnerDashboard.jsx    # Pet owner interface
│       ├── VetDashboard.jsx      # Veterinarian interface
│       └── AdminPanel.jsx        # Admin management interface
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **npm** (v6 or higher)
   ```bash
   npm --version
   ```

3. **MetaMask** browser extension
   - Install from: https://metamask.io
   - Create wallet or import existing one
   - Add Sepolia testnet to MetaMask

4. **Sepolia Testnet ETH**
   - Get free testnet ETH from: https://sepoliafaucet.com
   - Minimum 0.1 ETH recommended for transactions

## Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

Expected packages:
- react, react-dom (UI framework)
- web3 (Ethereum interaction)
- qrcode.react (QR code generation)
- html5-qrcode (QR code scanning)
- Testing libraries

### Step 2: Configure Smart Contracts

Edit `src/contractConfig.js` with your deployed contract addresses:

```javascript
// Update these addresses after deploying smart contracts
export const PET_REGISTRY_ADDRESS = "PET_REGISTRY_ADDRESS";
export const MEDICAL_RECORDS_ADDRESS = "MEDICAL_RECORDS_ADDRESS";

// ABIs are already included in the file
export const PET_REGISTRY_ABI = [...];
export const MEDICAL_RECORDS_ABI = [...];
```

### Step 3: Configure Network

In `src/App.js`, verify the network configuration:

```javascript
// For Sepolia testnet: 0xaa36a7 (11155111 in decimal)
const NETWORK_CHAIN_ID = "0xaa36a7";
```

## Running the Application

### Development Mode

```bash
npm start
```

The application will open at `http://localhost:3000`

Features in development mode:
- Hot reloading enabled
- Console warnings and errors visible
- React Developer Tools compatible
- Source maps disabled for faster builds

### Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder:
- Minified JavaScript and CSS
- Optimized for performance
- Ready for deployment
- Source maps disabled

### Running Tests

```bash
npm test
```

Launches test runner in interactive watch mode.

## Usage Guide

### For Pet Owners

1. **Connect Wallet**
   - Click "🔌 Connect Wallet" button
   - Approve MetaMask connection
   - Switch to "👤 Owner" tab

2. **Register a Pet**
   - Fill in pet details (name, species, breed, birth year)
   - Click "✅ Register Pet"
   - Confirm transaction in MetaMask
   - Click "🔄 Refresh My Pets" to see your pet

3. **Mark Pet as Lost**
   - Find your pet in "My Pets" list
   - Click "Mark as Lost" button
   - Confirm transaction
   - Share the QR code or Pet ID

4. **View Medical Records**
   - Click "📋 View Records" on any pet
   - See complete medical history from all clinics

5. **Add Co-Owner**
   - Enter co-owner's Ethereum address
   - Click "➕ Add" button
   - Confirm transaction

### For Veterinarians

1. **Get Approved**
   - Contact system admin with your wallet address
   - Wait for approval confirmation

2. **Connect Wallet**
   - Click "🔌 Connect Wallet"
   - Switch to "⚕️ Vet" tab

3. **Add Medical Record**
   - Enter Pet ID
   - Fill in record title and treatment details
   - Click "💾 Add Record"
   - Confirm transaction

4. **View Patient Records**
   - Enter Pet ID in "View Patient Records" section
   - Click "🔍 View Medical History"
   - See complete medical history

### For System Admins

1. **Connect Wallet** (must be contract deployer)
   - Admin tab appears automatically for authorized address

2. **Approve Veterinarian**
   - Enter vet's Ethereum address
   - Click "✅ Approve Vet"
   - Confirm transaction

3. **Revoke Vet Access**
   - Enter vet's Ethereum address
   - Click "🚫 Revoke Vet"
   - Confirm transaction

### Lost Pet Finder (No Wallet Required)

1. Click "🔍 Lost a pet?" button
2. Enter Pet ID or click "📱 Scan QR Code"
3. View pet information if marked as lost
4. Contact owner at displayed address

## Configuration Files

### contractConfig.js

Contains smart contract ABIs and addresses. Update after deploying contracts:

```javascript
export const PET_REGISTRY_ADDRESS = "0x...";
export const MEDICAL_RECORDS_ADDRESS = "0x...";
export const PET_REGISTRY_ABI = [...];
export const MEDICAL_RECORDS_ABI = [...];
```

### App.js

Main application logic:
- Wallet connection handling
- Contract initialization
- Role management (Owner/Vet/Admin)
- Network verification
- Component routing

## Troubleshooting

### Issue: "MetaMask not detected"
**Solution**: Install MetaMask browser extension from https://metamask.io

### Issue: "Wrong network" error
**Solution**: 
- Open MetaMask
- Switch to Sepolia testnet
- Verify chain ID matches `NETWORK_CHAIN_ID` in App.js

### Issue: "Insufficient funds" error
**Solution**: Get testnet ETH from https://sepoliafaucet.com

### Issue: Transactions fail silently
**Solution**:
- Check contract addresses in `contractConfig.js`
- Verify contracts are deployed on current network
- Check gas limit and wallet balance

### Issue: "Failed to load medical records"
**Solution**:
- Ensure wallet is connected
- Verify you're the pet owner or approved vet
- Check contract has correct PetRegistry address

### Issue: QR scanner not working
**Solution**:
- Ensure HTTPS connection (required for camera access)
- Grant camera permissions in browser
- Use localhost for development testing

### Issue: Pets not loading after registration
**Solution**:
- Wait for transaction confirmation (~15 seconds on Sepolia)
- Click "🔄 Refresh My Pets" button
- Check transaction on Sepolia Etherscan

## Security Considerations

- **Never commit private keys** or seed phrases
- **Always verify** contract addresses before transactions
- **Use testnet** for development and testing
- **Double-check** transaction details in MetaMask
- **Keep MetaMask** updated to latest version

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in CI Mode
```bash
CI=true npm test
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## License

GPL-3.0 License - See backend contracts for details
