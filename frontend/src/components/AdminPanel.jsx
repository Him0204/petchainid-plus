// src/components/AdminPanel.jsx
import React from "react";

function AdminPanel({ isAdmin, medicalContract, account, setStatusMessage }) {
  const [vetAddress, setVetAddress] = React.useState("");
  const [mode, setMode] = React.useState("approve"); 

  const handleSetVet = async (e) => {
    e.preventDefault();
    if (!medicalContract || !account) {
      setStatusMessage("Connect wallet first.");
      return;
    }
    if (!isAdmin) {
      setStatusMessage("This wallet is not the MedicalRecords admin.");
      return;
    }
    const addr = vetAddress.trim();
    if (!addr) {
      setStatusMessage("Enter a vet address.");
      return;
    }

    try {
      const approve = mode === "approve";
      setStatusMessage(
        `Sending transaction to ${
          approve ? "approve" : "revoke"
        } vet...`
      );
      await medicalContract.methods
        .setVet(addr, approve)
        .send({ from: account });

      setStatusMessage(
        `Vet ${approve ? "approved" : "revoked"} successfully.`
      );
      setVetAddress("");
    } catch (err) {
      console.error("setVet error:", err);
      setStatusMessage(
        `Failed to update vet status: ${
          err?.message || "transaction rejected or failed"
        }`
      );
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="info-card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '2px solid #fbbf24' }}>
      <div className="section-header" style={{ borderColor: '#fbbf24' }}>
        <span className="section-icon">🏥</span>
        <h2>Vet Management</h2>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Approve or revoke veterinarian wallet addresses. Only approved vets can add medical records to the system.
      </p>

      <form onSubmit={handleSetVet} className="register-form" style={{ marginTop: 12 }}>
        <div className="form-row">
          <label>🏥 Veterinarian Wallet Address *</label>
          <input
            type="text"
            value={vetAddress}
            onChange={(e) => setVetAddress(e.target.value)}
            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
            required
          />
        </div>

        <div className="form-row">
          <label>⚙️ Action *</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="coowner-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="approve">✅ Approve as Vet</option>
            <option value="revoke">❌ Revoke Vet Access</option>
          </select>
        </div>

        <button className="primary-btn" type="submit" style={{ width: '100%' }}>
          🔄 Update Vet Status
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
