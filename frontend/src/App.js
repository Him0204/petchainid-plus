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

function App() {
  const [web3, setWeb3] = useState(null);
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
      setWeb3(web3Instance);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      console.log("Connected chainId:", chainId);
      setStatusMessage(`Wallet connected on chainId ${chainId}.`);

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

      try {
        const approved = await medical.methods.isVet(selected).call();
        setIsVetApproved(approved);
      } catch (err) {
        console.error("isVet check error:", err);
      }

      try {
        const adminAddr = await medical.methods.admin().call();
        setIsAdmin(
          adminAddr.toLowerCase() === selected.toLowerCase()
        );
      } catch (err) {
        console.error("admin check error:", err);
        setIsAdmin(false);
      }
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
