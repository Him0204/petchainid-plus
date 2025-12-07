// src/components/VetDashboard.jsx
import React, { useState } from "react";

function VetDashboard({ account, medicalContract, isVetApproved, setStatusMessage }) {
  const [vetPetId, setVetPetId] = useState("");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDetails, setRecordDetails] = useState("");

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
    } catch (err) {
      console.error("addRecord error:", err);
      setStatusMessage(
        `Failed to add record: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
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
        
        <div className="info-card subtle">
          <div className="section-header" style={{ borderColor: 'var(--accent-soft-hover)' }}>
            <span className="section-icon">ℹ️</span>
            <h2>How It Works</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li>Get approved by the admin first</li>
            <li>Enter the Pet ID and record details</li>
            <li>Submit to blockchain (immutable)</li>
            <li>Owners can view all records for their pets</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default VetDashboard;
