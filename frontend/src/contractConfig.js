// src/contractConfig.js

// 1. Copy the ABI array from backend/artifacts/.../PetRegistry.json
export const PET_REGISTRY_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "petId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "lostMode",
				"type": "bool"
			}
		],
		"name": "LostModeUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "petId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "PetRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "species",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "breed",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "birthYear",
				"type": "uint256"
			}
		],
		"name": "registerPet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "petId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "lostMode",
				"type": "bool"
			}
		],
		"name": "setLostMode",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "petId",
				"type": "uint256"
			}
		],
		"name": "getPet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "species",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "breed",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "birthYear",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "lostMode",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "ownerAddr",
				"type": "address"
			}
		],
		"name": "getPetsOfOwner",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// 2. Paste the address printed by `node scripts/deploy.js`
export const PET_REGISTRY_ADDRESS = "0x4FC9C88C4FA89743e9d3Ede3AE35018cf2E53044";
