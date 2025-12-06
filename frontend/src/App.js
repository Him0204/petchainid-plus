import React, { useState } from "react";
import Web3 from "web3";
import "./App.css";
import {
  PET_REGISTRY_ABI,
  PET_REGISTRY_ADDRESS,
} from "./contractConfig";

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Pet form state
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petBirthYear, setPetBirthYear] = useState("");

  // My pets
  const [myPets, setMyPets] = useState([]);

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatusMessage("MetaMask not detected. Please install the extension.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Create contract instance
      const petRegistry = new web3Instance.eth.Contract(
        PET_REGISTRY_ABI,
        PET_REGISTRY_ADDRESS
      );
      setContract(petRegistry);

      setStatusMessage("Wallet connected and contract ready.");
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to connect wallet.");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  // Register a new pet (writes to blockchain)
  const handleRegisterPet = async (e) => {
    e.preventDefault();
    if (!web3 || !account || !contract) {
      setStatusMessage("Connect wallet first.");
      return;
    }

    if (!petName || !petSpecies || !petBirthYear) {
      setStatusMessage("Please fill in at least name, species, and birth year.");
      return;
    }

    try {
      setStatusMessage("Sending transaction to register pet...");

      await contract.methods
        .registerPet(
          petName,
          petSpecies,
          petBreed || "",
          Number(petBirthYear)
        )
        .send({ from: account });

      setStatusMessage("Pet registered successfully! Reloading pets...");
      setPetName("");
      setPetSpecies("");
      setPetBreed("");
      setPetBirthYear("");

      await loadMyPets(); // refresh list
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to register pet (transaction rejected?).");
    }
  };

  // Read pets from the contract for this account
  const loadMyPets = async () => {
    if (!web3 || !account || !contract) {
      setStatusMessage("Connect wallet first.");
      return;
    }

    try {
      setStatusMessage("Loading your pets from the blockchain...");

      const ids = await contract.methods.getPetsOfOwner(account).call();

      const petPromises = ids.map(async (id) => {
        const pet = await contract.methods.getPet(id).call();
        // pet is [id, name, species, breed, birthYear, owner, lostMode]
        return {
          id: pet[0],
          name: pet[1],
          species: pet[2],
          breed: pet[3],
          birthYear: pet[4],
          owner: pet[5],
          lostMode: pet[6],
        };
      });

      const petList = await Promise.all(petPromises);
      setMyPets(petList);
      setStatusMessage(`Loaded ${petList.length} pets.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to load pets.");
    }
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
        {/* Left: intro + register pet */}
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
            <p className="status-message">{statusMessage}</p>
          )}

          {/* Register pet form */}
          <div className="register-card">
            <h2>Register a Pet</h2>
            <form onSubmit={handleRegisterPet} className="register-form">
              <div className="form-row">
                <label>Pet Name</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Mochi"
                />
              </div>
              <div className="form-row">
                <label>Species</label>
                <input
                  type="text"
                  value={petSpecies}
                  onChange={(e) => setPetSpecies(e.target.value)}
                  placeholder="e.g. Dog, Cat"
                />
              </div>
              <div className="form-row">
                <label>Breed (optional)</label>
                <input
                  type="text"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  placeholder="e.g. Shiba Inu"
                />
              </div>
              <div className="form-row">
                <label>Birth Year</label>
                <input
                  type="number"
                  value={petBirthYear}
                  onChange={(e) => setPetBirthYear(e.target.value)}
                  placeholder="e.g. 2021"
                />
              </div>
              <button className="primary-btn" type="submit">
                Register Pet
              </button>
            </form>
          </div>
        </section>

        {/* Right: info + My Pets list */}
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
            <h2>My Pets (on-chain)</h2>
            <button
              className="secondary-btn"
              type="button"
              onClick={loadMyPets}
            >
              Load My Pets
            </button>

            {myPets.length === 0 && (
              <p className="empty-text">
                No pets loaded yet. Register a pet and click &quot;Load My
                Pets&quot;.
              </p>
            )}

            {myPets.length > 0 && (
              <ul className="pet-list">
                {myPets.map((pet) => (
                  <li key={pet.id} className="pet-item">
                    <div className="pet-name">
                      {pet.name} <span className="pet-species">{pet.species}</span>
                    </div>
                    <div className="pet-meta">
                      ID #{pet.id} · Born {pet.birthYear} ·{" "}
                      {pet.lostMode ? "Lost" : "Normal"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
