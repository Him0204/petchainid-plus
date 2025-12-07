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
const NETWORK_CHAIN_ID = "0xaa36a7"; // Change to "0xaa36a7" for Sepolia

function App() {
  const [account, setAccount] = useState(null);
  const [petContract, setPetContract] = useState(null);
  const [medicalContract, setMedicalContract] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [role, setRole] = useState(null); // "owner" | "vet" | "admin" | null
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
        console.log("Admin address from contract:", adminAddr);
        console.log("Current account:", selected);
        console.log("Is admin?", adminAddr && adminAddr.toLowerCase() === selected.toLowerCase());
      } catch (e) {
        console.error("admin check error:", e);
      }
      
      const isAdminCheck = adminAddr && adminAddr.toLowerCase() === selected.toLowerCase();
      setIsAdmin(isAdminCheck);

      console.log("Setting isAdmin to:", isAdminCheck);

      setStatusMessage(
        `Wallet and contracts connected successfully. ${
          vetApproved ? "(Approved Vet) " : ""
        }${isAdminCheck ? "(Admin) " : ""}`
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
              👤 Owner
            </button>
            <button
              className={`secondary-btn ${role === "vet" ? "active-role" : ""}`}
              type="button"
              onClick={() => setRole("vet")}
            >
              ⚕️ Vet
            </button>
            {isAdmin && (
              <button
                className={`secondary-btn ${role === "admin" ? "active-role" : ""}`}
                type="button"
                onClick={() => setRole("admin")}
              >
                👑 Admin
              </button>
            )}
          </div>

          <button
            className="wallet-button"
            onClick={handleConnectWallet}
            type="button"
          >
            {account ? (
              <>
                <span className="wallet-dot" /> {formatAddress(account)}
                {isVetApproved && <span style={{ marginLeft: '6px', fontSize: '0.9rem' }}>⚕️</span>}
                {isAdmin && <span style={{ marginLeft: '6px', fontSize: '0.9rem' }}>👑</span>}
              </>
            ) : (
              "🔌 Connect Wallet"
            )}
          </button>
        </div>
      </header>

      {role === "admin" ? (
        <main className="app-main">
          <section className="hero-card">
            <div className="section-header">
              <span className="section-icon">👑</span>
              <h2>Admin Dashboard</h2>
            </div>
            <p>
              Manage veterinarian approvals and oversee the PetChainID+ system.
            </p>
            {statusMessage && (
              <p className="status-message">{statusMessage}</p>
            )}
          </section>
          <section className="cards-column">
            <AdminPanel
              isAdmin={isAdmin}
              medicalContract={medicalContract}
              account={account}
              setStatusMessage={setStatusMessage}
            />
            
            <div className="info-card">
              <div className="section-header">
                <span className="section-icon">ℹ️</span>
                <h2>Admin Privileges</h2>
              </div>
              <p>
                As an admin, you can approve or revoke veterinarian access to the medical records system.
                Only approved vets can add medical records for pets.
              </p>
            </div>
          </section>
        </main>
      ) : role === "vet" ? (
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

      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()} PetChainID+ · Built with React &amp; Solidity · 
          {account && <span style={{ marginLeft: '8px' }}>Connected: {formatAddress(account)}</span>}
        </span>
      </footer>
    </div>
  );
}

export default App;
