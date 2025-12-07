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
        <h1>Veterinarian Dashboard</h1>
        <p>
          Add on-chain medical records for any registered pet by ID. Records
          become part of the pet&apos;s cross-clinic history.
        </p>

        {!isVetApproved && (
          <p className="lost-finder-text" style={{ marginTop: 8 }}>
            This wallet is <strong>not an approved vet</strong>. Ask the system
            admin to approve your address.
          </p>
        )}

        {isVetApproved && (
          <div className="register-card" style={{ marginTop: 16 }}>
            <h2>Add Medical Record</h2>
            <form onSubmit={handleAddMedicalRecord} className="register-form">
              <div className="form-row">
                <label>Pet ID</label>
                <input
                  type="number"
                  value={vetPetId}
                  onChange={(e) => setVetPetId(e.target.value)}
                  placeholder="Existing Pet ID"
                />
              </div>
              <div className="form-row">
                <label>Title</label>
                <input
                  type="text"
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g. Vaccination, Checkup"
                />
              </div>
              <div className="form-row">
                <label>Details</label>
                <input
                  type="text"
                  value={recordDetails}
                  onChange={(e) => setRecordDetails(e.target.value)}
                  placeholder="Short description of treatment"
                />
              </div>
              <button className="primary-btn" type="submit">
                Add Record
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="cards-column">
        <div className="info-card">
          <h2>For Clinics &amp; Vets</h2>
          <p>
            Log treatments and diagnoses as immutable records. Other clinics can
            read these with the owner&apos;s consent for safer, coordinated care.
          </p>
        </div>
      </section>
    </main>
  );
}

export default VetDashboard;
