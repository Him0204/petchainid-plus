import React, { useState } from "react";
import Web3 from "web3";
import "./App.css";

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatusMessage("MetaMask not detected. Please install the extension.");
        return;
      }

      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      // Create Web3 instance using MetaMask provider
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      setStatusMessage("Wallet connected successfully.");
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to connect wallet.");
    }
  };

  // Helper: display a shorter version of account address
  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  return (
    <div className="app-root">
      {/* Top bar */}
      <header className="app-header">
        <div className="app-logo">
          🐾 PetChainID<span className="plus">+</span>
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
      </header>

      {/* Main content */}
      <main className="app-main">
        {/* Left: intro card */}
        <section className="hero-card">
          <h1>Decentralized Pet Identity &amp; Medical Records</h1>
          <p>
            PetChainID+ gives every pet a secure digital identity and lifelong
            medical history. Owners stay in control. Vets collaborate with
            trusted, verifiable records.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" type="button">
              I&apos;m a Pet Owner
            </button>
            <button className="secondary-btn" type="button">
              I&apos;m a Veterinarian
            </button>
          </div>

          <button className="ghost-btn" type="button">
            🐶 Lost a pet? <span>Find by Pet ID</span>
          </button>

          {statusMessage && (
            <p className="status-message">
              {statusMessage}
            </p>
          )}
        </section>

        {/* Right: info cards */}
        <section className="cards-column">
          <div className="info-card">
            <h2>For Pet Owners</h2>
            <p>
              Register your pets on-chain, manage their profiles, and share
              medical history securely with clinics you trust.
            </p>
          </div>

          <div className="info-card">
            <h2>For Clinics &amp; Vets</h2>
            <p>
              Add verified treatment records, view a pet&apos;s history (with
              permission), and improve continuity of care across clinics.
            </p>
          </div>

          <div className="info-card subtle">
            <h2>Lost Pet Mode</h2>
            <p>
              Enable public-safe profiles so anyone who finds your pet can scan
              a QR or enter an ID to see basic info and contact you.
            </p>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()} PetChainID+ · Built with Hardhat &amp; React
        </span>
      </footer>
    </div>
  );
}

export default App;
