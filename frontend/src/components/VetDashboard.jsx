// src/components/VetDashboard.jsx
import React, { useState } from "react";

function VetDashboard({ account, medicalContract, isVetApproved, setStatusMessage }) {
  const [vetPetId, setVetPetId] = useState("");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDetails, setRecordDetails] = useState("");
  
  // View medical records
  const [viewPetId, setViewPetId] = useState("");
  const [viewedRecords, setViewedRecords] = useState(null);

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleAddMedicalRecord = async (e) => {
    e.preventDefault();
    if (!medicalContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!isVetApproved) {
      setStatusMessage("This wallet is not approved as a vet.");
      return;
    }
    if (!vetPetId || !recordTitle || !recordDetails) {
      setStatusMessage("Fill pet ID, title and details.");
      return;
    }

    try {
      setStatusMessage("Sending transaction to add medical record...");
      await medicalContract.methods
        .addRecord(Number(vetPetId), recordTitle, recordDetails)
        .send({ from: account });

      setStatusMessage("Medical record added.");
      setVetPetId("");
      setRecordTitle("");
      setRecordDetails("");
      
      // If viewing records for the same pet, refresh them
      if (viewPetId === vetPetId) {
        await handleViewRecords(vetPetId);
      }
    } catch (err) {
      console.error("addRecord error:", err);
      setStatusMessage(
        `Failed to add record: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
  };

  const handleViewRecords = async (petId) => {
    const idToView = petId || viewPetId;
    
    if (!medicalContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!isVetApproved) {
      setStatusMessage("You must be an approved vet to view records.");
      return;
    }
    if (!idToView) {
      setStatusMessage("Enter a Pet ID to view records.");
      return;
    }

    try {
      setStatusMessage(`Loading medical records for Pet #${idToView}...`);
      
      const ids = await medicalContract.methods
        .getRecordIdsForPet(Number(idToView))
        .call({ from: account });

      if (ids.length === 0) {
        setViewedRecords({ petId: idToView, records: [] });
        setStatusMessage(`No medical records found for Pet #${idToView}.`);
        return;
      }

      const recPromises = ids.map(async (id) => {
        const r = await medicalContract.methods.getRecord(id).call({ from: account });
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
      setViewedRecords({ petId: idToView, records: recs });
      setStatusMessage(`Loaded ${recs.length} medical record(s) for Pet #${idToView}.`);
    } catch (err) {
      console.error("viewRecords error:", err);
      const errorMsg = err?.message || "Unknown error";
      if (errorMsg.includes("Not authorized")) {
        setStatusMessage(`Not authorized to view records for Pet #${idToView}.`);
      } else if (errorMsg.includes("execution reverted")) {
        setStatusMessage(`Failed to load records: ${errorMsg.split('execution reverted:')[1] || 'Transaction reverted'}`);
      } else {
        setStatusMessage(`Failed to load records: ${errorMsg}`);
      }
      setViewedRecords(null);
    }
  };

  const handleViewRecordsSubmit = async (e) => {
    e.preventDefault();
    await handleViewRecords();
  };

  return (
    <main className="app-main">
      <section className="hero-card">
        <div className="section-header">
          <span className="section-icon">⚕️</span>
          <h2>Veterinarian Dashboard</h2>
        </div>
        <p>
          Add on-chain medical records for any registered pet by ID. Records
          become part of the pet&apos;s cross-clinic history.
        </p>

        {!isVetApproved && (
          <div className="lost-error-text" style={{ marginTop: 16 }}>
            <strong>⚠️ Not Approved:</strong> This wallet is not an approved vet. 
            Ask the system admin to approve your address to add medical records.
          </div>
        )}

        {isVetApproved && (
          <div className="register-card" style={{ marginTop: 16 }}>
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h2>Add Medical Record</h2>
            </div>
            <form onSubmit={handleAddMedicalRecord} className="register-form">
              <div className="form-row">
                <label>🔢 Pet ID *</label>
                <input
                  type="number"
                  value={vetPetId}
                  onChange={(e) => setVetPetId(e.target.value)}
                  placeholder="Enter existing Pet ID (e.g. 1, 2, 3)"
                  min="1"
                  required
                />
              </div>
              <div className="form-row">
                <label>📋 Record Title *</label>
                <input
                  type="text"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g. Annual Vaccination, Health Checkup"
                  required
                />
              </div>
              <div className="form-row">
                <label>💬 Treatment Details *</label>
                <input
                  type="text"
                  value={recordDetails}
                  onChange={(e) => setRecordDetails(e.target.value)}
                  placeholder="Brief description of diagnosis and treatment"
                  required
                />
              </div>
              <button className="primary-btn" type="submit">
                💾 Add Record
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="cards-column">
        <div className="info-card">
          <div className="section-header">
            <span className="section-icon">🏥</span>
            <h2>For Clinics &amp; Vets</h2>
          </div>
          <p>
            Log treatments and diagnoses as immutable records. Other clinics can
            read these with the owner&apos;s consent for safer, coordinated care.
          </p>
        </div>

        {isVetApproved && (
          <div className="info-card subtle">
            <div className="section-header" style={{ borderColor: 'var(--accent-soft-hover)' }}>
              <span className="section-icon">📋</span>
              <h2>View Patient Records</h2>
            </div>
            <form onSubmit={handleViewRecordsSubmit} style={{ marginTop: '12px' }}>
              <div className="form-row">
                <label>🔢 Pet ID</label>
                <input
                  type="number"
                  value={viewPetId}
                  onChange={(e) => setViewPetId(e.target.value)}
                  placeholder="Enter Pet ID to view records"
                  min="1"
                  required
                />
              </div>
              <button className="primary-btn" type="submit" style={{ width: '100%' }}>
                🔍 View Medical History
              </button>
            </form>

            {viewedRecords && (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Pet #{viewedRecords.petId} - Medical History
                </h3>
                {viewedRecords.records.length === 0 ? (
                  <div style={{ 
                    padding: '12px', 
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    📋 No medical records yet for this pet.
                  </div>
                ) : (
                  <ul className="record-list">
                    {viewedRecords.records.map((r) => (
                      <li key={r.id} className="record-item">
                        <div className="record-title">📄 {r.title}</div>
                        <div className="record-meta">
                          🩺 By {formatAddress(r.vet)} · 📅{" "}
                          {new Date(r.timestamp * 1000).toLocaleDateString()}
                        </div>
                        <div className="record-details">
                          💬 {r.details}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="info-card subtle">
          <div className="section-header" style={{ borderColor: 'var(--accent-soft-hover)' }}>
            <span className="section-icon">ℹ️</span>
            <h2>How It Works</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Get approved by the admin first</li>
            <li>Enter the Pet ID and record details</li>
            <li>Submit to blockchain (immutable)</li>
            <li>View complete medical history for any pet</li>
            <li>Owners can view all records for their pets</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default VetDashboard;
