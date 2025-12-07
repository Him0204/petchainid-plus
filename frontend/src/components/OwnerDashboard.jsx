// src/components/OwnerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";

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
  
  // QR Code states
  const [showQRCode, setShowQRCode] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

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

  // ----- QR Code Functions -----

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setLostSearchError("");

      // Check if HTTPS or localhost
      const isSecureContext = window.isSecureContext;
      if (!isSecureContext) {
        setLostSearchError(
          "Camera requires HTTPS. Please access via HTTPS URL or localhost."
        );
        setIsScanning(false);
        return;
      }

      // Check camera permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop test stream
      } catch (permError) {
        setLostSearchError(
          "Camera permission denied. Please enable camera access in your browser settings."
        );
        setIsScanning(false);
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setLostSearchId(decodedText);
          stopQRScanner();
          handleLostPetSearchById(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (normal when no QR detected)
        }
      );
    } catch (err) {
      console.error("QR Scanner error:", err);
      setLostSearchError(
        `Failed to start camera: ${err.message || "Unknown error"}. Make sure you're using HTTPS and have granted camera permissions.`
      );
      setIsScanning(false);
    }
  };

  const stopQRScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch((err) => {
        console.error("Failed to stop scanner:", err);
        setIsScanning(false);
      });
    }
  };

  const handleLostPetSearchById = async (petId) => {
    if (!petContract) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!petId) {
      setLostSearchError("Please enter a Pet ID.");
      setLostSearchResult(null);
      return;
    }

    try {
      setLostSearchError("");
      setLostSearchResult(null);
      setStatusMessage("Looking up pet on-chain...");

      const pet = await petContract.methods
        .getPet(Number(petId))
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

  const handleLostPetSearch = async (e) => {
    e.preventDefault();
    await handleLostPetSearchById(lostSearchId);
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ----- Render -----

  return (
    <main className="app-main">
      {/* Left column: hero + owner tools */}
      <section className="hero-card">
        <div className="section-header">
          <span className="section-icon">👤</span>
          <h2>Owner Dashboard</h2>
        </div>
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
          🔍 Lost a pet? <span>Find by Pet ID</span>
        </button>

        {statusMessage && (
          <p className="status-message">{statusMessage}</p>
        )}

        {showLostFinder && (
          <div className="lost-finder-card">
            <h2>Lost Pet Finder</h2>
            <p className="lost-finder-text">
              Enter a Pet ID or scan a QR code to see if it&apos;s marked as LOST and contact the owner.
            </p>

            {!isScanning ? (
              <>
                <form className="lost-finder-form" onSubmit={handleLostPetSearch}>
                  <div className="form-row">
                    <label>🔢 Pet ID</label>
                    <input
                      type="number"
                      value={lostSearchId}
                      onChange={(e) => setLostSearchId(e.target.value)}
                      placeholder="Enter Pet ID (e.g. 1, 2, 3...)"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="primary-btn" type="submit" style={{ flex: 1 }}>
                      🔍 Search Pet
                    </button>
                    <button 
                      className="secondary-btn" 
                      type="button"
                      onClick={startScanning}
                      style={{ flex: 1 }}
                    >
                      📷 Scan QR Code
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <div id="qr-reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                <button 
                  className="secondary-btn" 
                  type="button"
                  onClick={stopQRScanner}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  ❌ Stop Scanning
                </button>
              </div>
            )}

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

        <div className="divider"></div>

        {/* Register Pet */}
        <div className="register-card">
          <div className="section-header">
            <span className="section-icon">➕</span>
            <h2>Register a Pet</h2>
          </div>
          <form onSubmit={handleRegisterPet} className="register-form">
            <div className="form-row">
              <label>🏷️ Pet Name *</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Mochi, Buddy, Luna"
                required
              />
            </div>
            <div className="form-row">
              <label>🐾 Species *</label>
              <input
                type="text"
                value={petSpecies}
                onChange={(e) => setPetSpecies(e.target.value)}
                placeholder="e.g. Dog, Cat, Bird, Rabbit"
                required
              />
            </div>
            <div className="form-row">
              <label>🧬 Breed (optional)</label>
              <input
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="e.g. Shiba Inu, Persian, Mixed"
              />
            </div>
            <div className="form-row">
              <label>📅 Birth Year *</label>
              <input
                type="number"
                value={petBirthYear}
                onChange={(e) => setPetBirthYear(e.target.value)}
                placeholder="e.g. 2021"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <button className="primary-btn" type="submit">
              ✅ Register Pet
            </button>
          </form>
        </div>
      </section>

      {/* Right column: info + My Pets */}
      <section className="cards-column">
        <div className="info-card">
          <div className="section-header">
            <span className="section-icon">ℹ️</span>
            <h2>For Pet Owners</h2>
          </div>
          <p>
            Keep all your pets&apos; identities and medical histories in one
            tamper-proof place, accessible across clinics.
          </p>
        </div>

        <div className="info-card subtle">
          <div className="section-header" style={{ borderColor: 'var(--accent-soft-hover)' }}>
            <span className="section-icon">🐾</span>
            <h2>My Pets</h2>
          </div>
          <button
            className="primary-btn"
            type="button"
            onClick={loadMyPets}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            🔄 Refresh My Pets
          </button>

          {myPets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🐕‍🦺</div>
              <p className="empty-text">
                No pets loaded yet. Register a pet above and click &quot;Refresh My Pets&quot;.
              </p>
            </div>
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
                      ➕ Add
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ flex: 1 }}
                      onClick={() => loadRecordsForPet(pet.id)}
                    >
                      📋 <span>View Records</span>
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      style={{ flex: 1 }}
                      onClick={() => setShowQRCode(prev => ({ ...prev, [pet.id]: !prev[pet.id] }))}
                    >
                      {showQRCode[pet.id] ? '🔼' : '📱'} <span>{showQRCode[pet.id] ? 'Hide' : 'Show'} QR</span>
                    </button>
                  </div>

                  {showQRCode[pet.id] && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '16px', 
                      background: '#ffffff',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      border: '2px solid var(--accent-soft-hover)'
                    }}>
                      <QRCodeSVG 
                        value={pet.id.toString()} 
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Pet ID: <strong>#{pet.id}</strong>
                        <br />
                        <span style={{ fontSize: '0.75rem' }}>Scan this QR code to quickly find this pet</span>
                      </div>
                    </div>
                  )}

                  {recordsByPet[pet.id] &&
                    recordsByPet[pet.id].length > 0 && (
                      <ul className="record-list">
                        {recordsByPet[pet.id].map((r) => (
                          <li key={r.id} className="record-item">
                            <div className="record-title">📄 {r.title}</div>
                            <div className="record-meta">
                              🩺 By {formatAddress(r.vet)} · 📅{" "}
                              {new Date(
                                r.timestamp * 1000
                              ).toLocaleDateString()}
                            </div>
                            <div className="record-details">
                              💬 {r.details}
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
