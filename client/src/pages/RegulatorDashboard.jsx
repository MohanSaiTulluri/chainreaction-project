import { useEffect, useState } from "react";
import { useSupplyChainContract } from "../chain/useSupplyChainContract.js";
import { STATUS_TEXT } from "../chain/supplychain.js";

const STORAGE_KEY = "ft-contract";
const RECENT_KEY = "ft-recent-batchIds";

export default function RegulatorDashboard() {
  const [contractAddress, setContractAddress] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [batchId, setBatchId] = useState("");
  const [decision, setDecision] = useState("approve");
  const [feedback, setFeedback] = useState("");
  const [available, setAvailable] = useState([]);
  const { contract, error: contractError, loading: contractLoading } = useSupplyChainContract(contractAddress);

  const cacheBatch = (id) => {
    try {
      const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (!list.includes(id)) list.unshift(id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 20)));
    } catch {
      // ignore
    }
  };

  const loadAvailable = async (instance) => {
    const c = instance || contract;
    if (!c) return;
    try {
      const ids = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const rows = [];
      for (const id of ids) {
        try {
          const data = await c.getBatch(id);
          if (data?.batchId) rows.push(data);
        } catch (err) {
          console.warn("Failed to load batch", id, err);
        }
      }
      setAvailable(rows);
    } catch (err) {
      console.warn("Unable to read cached batches", err);
      setAvailable([]);
    }
  };

  const handleAddressChange = (value) => {
    setContractAddress(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!contract || !batchId) {
      setFeedback("Provide contract and batch ID.");
      return;
    }
    try {
      setFeedback("Submitting decision...");
      const approved = decision === "approve";
      const tx = await contract.regulatorDecision(batchId, approved);
      await tx.wait();
      cacheBatch(batchId);
      await loadAvailable();
      setFeedback(`Decision recorded (tx: ${tx.hash.substring(0, 10)}...)`);
      setBatchId("");
    } catch (err) {
      console.error(err);
      setFeedback(err?.shortMessage || err?.message || "Failed to record decision.");
    }
  };

  useEffect(() => {
    if (!contract) {
      setAvailable([]);
      return;
    }
    loadAvailable(contract);
  }, [contract]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="chip">Regulator Console</span>
          <h1>Review Batch</h1>
          <p>Approve or reject batches before distributors can set destinations.</p>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-card">
          <h2>Contract</h2>
          <input
            value={contractAddress}
            onChange={(e) => handleAddressChange(e.target.value.trim())}
            placeholder="0x..."
          />
          {contractLoading && <p>Checking contract...</p>}
          {contractError && <p className="error">{contractError}</p>}
        </section>

        <section className="dashboard-card">
          <h2>Decision</h2>
          <form style={{ display: "grid", gap: 12 }} onSubmit={submitDecision}>
            <label>
              Batch ID
              <input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="FARM-2025-001" />
            </label>
            <label>
              Outcome
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </label>
            <button className="cta" type="submit" disabled={!contract}>
              Submit decision
            </button>
          </form>
          {feedback && <p className="meta-line">{feedback}</p>}
        </section>

        <section className="dashboard-card">
          <h2>Available Batches</h2>
          {available.length === 0 && <p>No cached batches yet.</p>}
          {available.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Batch</th>
                  <th style={{ textAlign: "left" }}>Product</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Regulator</th>
                </tr>
              </thead>
              <tbody>
                {available.map((b) => (
                  <tr key={b.batchId}>
                    <td><code>{b.batchId}</code></td>
                    <td>{b.product}</td>
                    <td>{STATUS_TEXT[Number(b.status)] ?? Number(b.status)}</td>
                    <td>{b.regulatorReviewed ? (b.regulatorApproved ? "Approved" : "Rejected") : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
