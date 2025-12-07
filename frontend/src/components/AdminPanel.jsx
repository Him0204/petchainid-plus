// src/components/AdminPanel.jsx
import React from "react";

function AdminPanel({ isAdmin, medicalContract, account, setStatusMessage }) {
  const [vetAddress, setVetAddress] = React.useState("");
  const [mode, setMode] = React.useState("approve"); // "approve" | "revoke"

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

  if (!isAdmin) return null;

  return (
    <div className="info-card">
      <h2>Admin: Vet Management</h2>
      <p className="empty-text">
        This wallet is the <strong>MedicalRecords admin</strong>. Approve or revoke
        vet addresses here.
      </p>

      <form onSubmit={handleSetVet} className="register-form" style={{ marginTop: 8 }}>
        <div className="form-row">
          <label>Vet Address</label>
          <input
            type="text"
            value={vetAddress}
            onChange={(e) => setVetAddress(e.target.value)}
            placeholder="0x1234..."
          />
        </div>

        <div className="form-row">
          <label>Action</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="coowner-input"
          >
            <option value="approve">Approve as Vet</option>
            <option value="revoke">Revoke Vet</option>
          </select>
        </div>

        <button className="primary-btn" type="submit">
          Update Vet Status
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
