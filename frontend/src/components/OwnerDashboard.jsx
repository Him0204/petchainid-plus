// src/components/OwnerDashboard.jsx
import React, { useState } from "react";

function OwnerDashboard({
  account,
  petContract,
  medicalContract,
  statusMessage,
  setStatusMessage,
}) {
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petBirthYear, setPetBirthYear] = useState("");

  const [myPets, setMyPets] = useState([]);
  const [recordsByPet, setRecordsByPet] = useState({});

  const [showLostFinder, setShowLostFinder] = useState(false);
  const [lostSearchId, setLostSearchId] = useState("");
  const [lostSearchResult, setLostSearchResult] = useState(null);
  const [lostSearchError, setLostSearchError] = useState("");

  const [coOwnerAddressInput, setCoOwnerAddressInput] = useState({});

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  // ----- Owner actions -----

  const handleRegisterPet = async (e) => {
    e.preventDefault();
    if (!petContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!petName || !petSpecies || !petBirthYear) {
      setStatusMessage("Fill in name, species, and birth year.");
      return;
    }

    try {
      setStatusMessage("Sending transaction to register pet...");
      await petContract.methods
        .registerPet(petName, petSpecies, petBreed || "", Number(petBirthYear))
        .send({ from: account });

      setStatusMessage("Pet registered. Reloading pets...");
      setPetName("");
      setPetSpecies("");
      setPetBreed("");
      setPetBirthYear("");

      await loadMyPets();
    } catch (err) {
      console.error("registerPet error:", err);
      setStatusMessage(
        `Failed to register pet: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
  };

  const loadMyPets = async () => {
    if (!petContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    try {
      setStatusMessage("Loading your pets...");
      const ids = await petContract.methods.getPetsOfOwner(account).call();

      const petPromises = ids.map(async (id) => {
        const pet = await petContract.methods.getPet(id).call();
        // [id, name, species, breed, birthYear, owner, lostMode]
        let owners = [];
        try {
          const ownersInfo = await petContract.methods
            .getPetOwners(id)
            .call();
          const primaryOwner = ownersInfo[0];
          const coOwners = ownersInfo[1];
          owners = [primaryOwner, ...coOwners];
        } catch {
          owners = [pet[5]];
        }

        return {
          id: pet[0],
          name: pet[1],
          species: pet[2],
          breed: pet[3],
          birthYear: pet[4],
          primaryOwner: pet[5],
          lostMode: pet[6],
          owners,
        };
      });

      const list = await Promise.all(petPromises);
      setMyPets(list);
      setStatusMessage(`Loaded ${list.length} pets.`);
    } catch (err) {
      console.error("loadMyPets error:", err);
      setStatusMessage("Failed to load pets.");
    }
  };

  const handleToggleLostMode = async (petId, current) => {
    if (!petContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    try {
      const newVal = !current;
      setStatusMessage(
        `Sending transaction to mark pet as ${
          newVal ? "LOST" : "NORMAL"
        }...`
      );
      await petContract.methods
        .setLostMode(petId, newVal)
        .send({ from: account });

      setStatusMessage("Lost mode updated. Reloading pets...");
      await loadMyPets();
    } catch (err) {
      console.error("setLostMode error:", err);
      setStatusMessage(
        `Failed to update lost mode: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
  };

  const handleAddCoOwner = async (petId) => {
    if (!petContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    const addr = (coOwnerAddressInput[petId] || "").trim();
    if (!addr) {
      setStatusMessage("Enter a co-owner address first.");
      return;
    }
    try {
      setStatusMessage("Sending transaction to add co-owner...");
      await petContract.methods.addCoOwner(petId, addr).send({ from: account });
      setStatusMessage("Co-owner added.");
      setCoOwnerAddressInput((prev) => ({ ...prev, [petId]: "" }));
      await loadMyPets();
    } catch (err) {
      console.error("addCoOwner error:", err);
      setStatusMessage(
        `Failed to add co-owner: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
  };

  // ----- Medical records (view) -----

  const loadRecordsForPet = async (petId) => {
    if (!medicalContract) {
      setStatusMessage("Medical contract not ready.");
      return;
    }
    try {
      const ids = await medicalContract.methods
        .getRecordIdsForPet(petId)
        .call();

      const recPromises = ids.map(async (id) => {
        const r = await medicalContract.methods.getRecord(id).call();
        // [id, petId, vet, timestamp, title, details]
        return {
          id: r[0],
          petId: r[1],
          vet: r[2],
          timestamp: Number(r[3]),
          title: r[4],
          details: r[5],
        };
      });

      const recs = await Promise.all(recPromises);
      setRecordsByPet((prev) => ({ ...prev, [petId]: recs }));
    } catch (err) {
      console.error("loadRecordsForPet error:", err);
      setStatusMessage("Failed to load medical records.");
    }
  };

  // ----- Lost Pet Finder -----

  const handleLostPetSearch = async (e) => {
    e.preventDefault();
    if (!petContract) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!lostSearchId) {
      setLostSearchError("Please enter a Pet ID.");
      setLostSearchResult(null);
      return;
    }

    try {
      setLostSearchError("");
      setLostSearchResult(null);
      setStatusMessage("Looking up pet on-chain...");

      const pet = await petContract.methods
        .getPet(Number(lostSearchId))
        .call();

      const result = {
        id: pet[0],
        name: pet[1],
        species: pet[2],
        breed: pet[3],
        birthYear: pet[4],
        owner: pet[5],
        lostMode: pet[6],
      };

      if (!result.lostMode) {
        setLostSearchError(
          "This pet is not marked as LOST (Lost Pet Mode not enabled)."
        );
        setLostSearchResult(null);
      } else {
        setLostSearchResult(result);
      }

      setStatusMessage("");
    } catch (err) {
      console.error("Lost pet search error:", err);
      setLostSearchError("No pet found with that ID or call failed.");
      setLostSearchResult(null);
    }
  };

  // ----- Render -----

  return (
    <main className="app-main">
      {/* Left column: hero + owner tools */}
      <section className="hero-card">
        <h1>Owner Dashboard</h1>
        <p>
          Manage your pets&apos; identities, mark them as lost, and view
          cross-clinic medical records.
        </p>

        <button
          className="ghost-btn"
          type="button"
          onClick={() => {
            setShowLostFinder((prev) => !prev);
            setLostSearchResult(null);
            setLostSearchError("");
          }}
        >
          🐶 Lost a pet? <span>Find by Pet ID</span>
        </button>

        {statusMessage && (
          <p className="status-message">{statusMessage}</p>
        )}

        {showLostFinder && (
          <div className="lost-finder-card">
            <h2>Lost Pet Finder</h2>
            <p className="lost-finder-text">
              Enter a Pet ID to see if it&apos;s marked as LOST and contact the
              owner.
            </p>

            <form className="lost-finder-form" onSubmit={handleLostPetSearch}>
              <div className="form-row">
                <label>Pet ID</label>
                <input
                  type="number"
                  value={lostSearchId}
                  onChange={(e) => setLostSearchId(e.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
              <button className="secondary-btn" type="submit">
                Search
              </button>
            </form>

            {lostSearchError && (
              <p className="lost-error-text">{lostSearchError}</p>
            )}

            {lostSearchResult && (
              <div className="lost-result-card">
                <div className="lost-result-title">
                  {lostSearchResult.name}{" "}
                  <span className="pet-species">
                    {lostSearchResult.species}
                  </span>
                </div>
                <div className="lost-result-meta">
                  Pet ID #{lostSearchResult.id} · Born{" "}
                  {lostSearchResult.birthYear}
                </div>
                <div className="lost-result-status">
                  Status: <span className="lost-badge">LOST</span>
                </div>
                <div className="lost-result-contact">
                  Contact owner wallet:{" "}
                  <code>{formatAddress(lostSearchResult.owner)}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Register Pet */}
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

      {/* Right column: info + My Pets */}
      <section className="cards-column">
        <div className="info-card">
          <h2>For Pet Owners</h2>
          <p>
            Keep all your pets&apos; identities and medical histories in one
            tamper-proof place, accessible across clinics.
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
                    {pet.name}{" "}
                    <span className="pet-species">{pet.species}</span>
                  </div>
                  <div className="pet-meta">
                    ID #{pet.id} · Born {pet.birthYear} ·{" "}
                    {pet.lostMode ? "Status: LOST" : "Status: Normal"}
                  </div>

                  {pet.owners && pet.owners.length > 0 && (
                    <div className="owners-line">
                      Owners:{" "}
                      {pet.owners.map((o, idx) => (
                        <span key={o} className="owner-tag">
                          {idx === 0 ? "Primary" : "Co-owner"}:{" "}
                          {formatAddress(o)}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="lost-toggle-btn"
                    onClick={() =>
                      handleToggleLostMode(pet.id, pet.lostMode)
                    }
                  >
                    {pet.lostMode ? "Mark as Found" : "Mark as Lost"}
                  </button>

                  <div className="coowner-row">
                    <input
                      type="text"
                      className="coowner-input"
                      placeholder="Add co-owner address (0x...)"
                      value={coOwnerAddressInput[pet.id] || ""}
                      onChange={(e) =>
                        setCoOwnerAddressInput((prev) => ({
                          ...prev,
                          [pet.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleAddCoOwner(pet.id)}
                    >
                      Add Co-Owner
                    </button>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ marginTop: 6 }}
                    onClick={() => loadRecordsForPet(pet.id)}
                  >
                    View Medical Records
                  </button>

                  {recordsByPet[pet.id] &&
                    recordsByPet[pet.id].length > 0 && (
                      <ul className="record-list">
                        {recordsByPet[pet.id].map((r) => (
                          <li key={r.id} className="record-item">
                            <div className="record-title">{r.title}</div>
                            <div className="record-meta">
                              By {formatAddress(r.vet)} ·{" "}
                              {new Date(
                                r.timestamp * 1000
                              ).toLocaleString()}
                            </div>
                            <div className="record-details">
                              {r.details}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

export default OwnerDashboard;
