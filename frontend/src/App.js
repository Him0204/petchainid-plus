// src/App.js
import React, { useState } from "react";
import Web3 from "web3";
import "./App.css";
import {
  PET_REGISTRY_ABI,
  PET_REGISTRY_ADDRESS,
  MEDICAL_RECORDS_ABI,
  MEDICAL_RECORDS_ADDRESS,
} from "./contractConfig";

import OwnerDashboard from "./components/OwnerDashboard";
import VetDashboard from "./components/VetDashboard";
import AdminPanel from "./components/AdminPanel";

// Network configuration
// For Sepolia testnet: 0xaa36a7 (11155111 in decimal)
// For local Hardhat: 0x7a69 (31337 in decimal)
const NETWORK_CHAIN_ID = "0x7a69"; // Change to "0xaa36a7" for Sepolia

function App() {
  const [account, setAccount] = useState(null);
  const [petContract, setPetContract] = useState(null);
  const [medicalContract, setMedicalContract] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [role, setRole] = useState(null); // "owner" | "vet" | null
  const [isVetApproved, setIsVetApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatusMessage("MetaMask not detected. Please install it.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const selected = accounts[0];
      setAccount(selected);

      const web3Instance = new Web3(window.ethereum);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      console.log("Connected chainId:", chainId);

      // Check if on correct network
      if (chainId !== NETWORK_CHAIN_ID) {
        setStatusMessage(
          `Wrong network. Please switch MetaMask to the correct network (chainId ${NETWORK_CHAIN_ID}).`
        );
        setPetContract(null);
        setMedicalContract(null);
        return;
      }

      const pet = new web3Instance.eth.Contract(
        PET_REGISTRY_ABI,
        PET_REGISTRY_ADDRESS
      );
      setPetContract(pet);

      const medical = new web3Instance.eth.Contract(
        MEDICAL_RECORDS_ABI,
        MEDICAL_RECORDS_ADDRESS
      );
      setMedicalContract(medical);

      // Check vet status
      let vetApproved = false;
      try {
        vetApproved = await medical.methods.isVet(selected).call();
      } catch (e) {
        console.error("isVet check error:", e);
      }
      setIsVetApproved(vetApproved);

      // Check admin status
      let adminAddr = null;
      try {
        adminAddr = await medical.methods.admin().call();
      } catch (e) {
        console.error("admin check error:", e);
      }
      setIsAdmin(
        adminAddr && adminAddr.toLowerCase() === selected.toLowerCase()
      );

      setStatusMessage(
        `Wallet and contracts connected successfully. ${
          vetApproved ? "(Approved Vet) " : ""
        }${adminAddr && adminAddr.toLowerCase() === selected.toLowerCase() ? "(Admin) " : ""}`
      );
    } catch (err) {
      console.error("Wallet connect error:", err);
      setStatusMessage("Failed to connect wallet.");
    }
  };

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">
          🐾 PetChainID<span className="plus">+</span>
        </div>

        <div className="header-right">
          <div className="role-switch">
            <button
              className={`secondary-btn ${role === "owner" ? "active-role" : ""}`}
              type="button"
              onClick={() => setRole("owner")}
            >
              Owner
            </button>
            <button
              className={`secondary-btn ${role === "vet" ? "active-role" : ""}`}
              type="button"
              onClick={() => setRole("vet")}
            >
              Vet
            </button>
          </div>

          <button
            className="wallet-button"
            onClick={handleConnectWallet}
            type="button"
          >
            {account ? (
              <>
                <span className="wallet-dot" /> {formatAddress(account)}
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      </header>

      {role === "vet" ? (
        <VetDashboard
          account={account}
          medicalContract={medicalContract}
          isVetApproved={isVetApproved}
          setStatusMessage={setStatusMessage}
        />
      ) : (
        <OwnerDashboard
          account={account}
          petContract={petContract}
          medicalContract={medicalContract}
          statusMessage={statusMessage}
          setStatusMessage={setStatusMessage}
        />
      )}

      {/* Admin Panel always lives on the right column area;
          OwnerDashboard renders main content; we just append AdminPanel
          at the bottom of the page */}
      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()} PetChainID+ · Built with React &amp; Solidity
        </span>
      </footer>

      {/* You can render AdminPanel above footer or integrate into cards-column. */}
      <div className="admin-panel-wrapper">
        <AdminPanel
          isAdmin={isAdmin}
          medicalContract={medicalContract}
          account={account}
          setStatusMessage={setStatusMessage}
        />
      </div>
    </div>
  );
}

export default App;
