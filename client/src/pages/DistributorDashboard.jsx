import { useEffect, useState } from "react";
import { useSupplyChainContract } from "../chain/useSupplyChainContract.js";
import { STATUS_TEXT } from "../chain/supplychain.js";

const STORAGE_KEY = "ft-contract";
const RECENT_KEY = "ft-recent-batchIds";

export default function DistributorDashboard() {
  const [contractAddress, setContractAddress] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [batchId, setBatchId] = useState("");
  const [destination, setDestination] = useState("");
  const [shipDate, setShipDate] = useState("");
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
      const queue = [];
      for (const id of ids) {
        try {
          const data = await c.getBatch(id);
          if (data?.batchId && data.regulatorApproved) queue.push(data);
        } catch (err) {
          console.warn("Failed to load batch", id, err);
        }
      }
      setAvailable(queue);
    } catch (err) {
      console.warn("Unable to load cached batches", err);
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

  const confirmShipment = async (e) => {
    e.preventDefault();
    if (!contract || !batchId || !destination) {
      setFeedback("Provide contract, batch ID, and destination.");
      return;
    }
    try {
      setFeedback("Submitting transaction...");
      const shipTs = shipDate ? Math.floor(new Date(shipDate).getTime() / 1000) : 0;
      const tx = await contract.setDestination(batchId, destination, shipTs);
      await tx.wait();
      cacheBatch(batchId);
      await loadAvailable();
      setFeedback(`Shipment recorded (tx: ${tx.hash.substring(0, 10)}...)`);
      setBatchId("");
      setDestination("");
      setShipDate("");
    } catch (err) {
      console.error(err);
      setFeedback(err?.shortMessage || err?.message || "Failed to confirm shipment.");
    }
  };

  useEffect(() => {
    if (!contract) {
      setAvailable([]);
      return;
    }
    loadAvailable(contract);
  }, [contract]);

  const fmtDate = (ts) => {
    const n = Number(ts ?? 0);
    if (!Number.isFinite(n) || n === 0) return "-";
    return new Date(n * 1000).toLocaleDateString();
    };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="chip">Distributor Console</span>
          <h1>Assign Destination</h1>
          <p>See regulator-approved batches, set the retailer destination, and log a ship date.</p>
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
          <h2>Assign Destination</h2>
          <form style={{ display: "grid", gap: 12 }} onSubmit={confirmShipment}>
            <label>
              Batch ID
              <input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="FARM-2025-001" />
            </label>
            <label>
              Destination (retailer address or location)
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Main St, NY or 0x..." />
            </label>
            <label>
              Ship Date (optional)
              <input type="date" value={shipDate} onChange={(e) => setShipDate(e.target.value)} />
            </label>
            <button className="cta" type="submit" disabled={!contract}>
              Set destination
            </button>
          </form>
          {feedback && <p className="meta-line">{feedback}</p>}
        </section>

        <section className="dashboard-card">
          <h2>Regulator-Approved Batches</h2>
          {available.length === 0 && <p>No approved batches yet. Ask regulator to approve.</p>}
          {available.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Batch</th>
                  <th style={{ textAlign: "left" }}>Product</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Destination</th>
                  <th style={{ textAlign: "left" }}>Ship Date</th>
                </tr>
              </thead>
              <tbody>
                {available.map((b) => (
                  <tr key={b.batchId}>
                    <td><code>{b.batchId}</code></td>
                    <td>{b.product}</td>
                    <td>{STATUS_TEXT[Number(b.status)] ?? Number(b.status)}</td>
                    <td>{b.destination || "-"}</td>
                    <td>{fmtDate(b.shipDate)}</td>
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
