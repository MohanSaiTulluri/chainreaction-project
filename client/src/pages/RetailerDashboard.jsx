import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useSupplyChainContract } from "../chain/useSupplyChainContract.js";
import { STATUS_TEXT } from "../chain/supplychain.js";

const STORAGE_KEY = "ft-contract";
const RECENT_KEY = "ft-recent-batchIds";

export default function RetailerDashboard() {
  const [contractAddress, setContractAddress] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [batchId, setBatchId] = useState("");
  const [price, setPrice] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
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
          console.warn("Failed to fetch batch", id, err);
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

  const receiveBatch = async (e) => {
    e.preventDefault();
    if (!contract || !batchId || !price) {
      setFeedback("Provide contract, batch ID, and price.");
      return;
    }
    try {
      setFeedback("Submitting transaction...");
      const priceWei = ethers.parseEther(price);
      const tx = await contract.retailerReceive(batchId, priceWei);
      await tx.wait();
      cacheBatch(batchId);
      await loadAvailable();
      setFeedback(`Price saved (tx: ${tx.hash.substring(0, 10)}...)`);
      setBatchId("");
      setPrice("");
    } catch (err) {
      console.error(err);
      setFeedback(err?.shortMessage || err?.message || "Failed to receive batch.");
    }
  };

  useEffect(() => {
    if (!contract) {
      setAvailable([]);
      return;
    }
    loadAvailable(contract);
    // attempt to prefill destination filter with connected wallet
    (async () => {
      try {
        if (!window?.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setDestinationFilter(addr);
      } catch {
        // ignore
      }
    })();
  }, [contract]);

  const formatPrice = (val) => {
    try {
      const num = Number.parseFloat(ethers.formatEther(val ?? 0n));
      if (!Number.isFinite(num) || num === 0) return "-";
      return `${num.toPrecision(4)} ETH`;
    } catch {
      return "-";
    }
  };

  const matchesDestination = (b) => {
    if (!destinationFilter) return true;
    return (b.destination || "").toLowerCase().includes(destinationFilter.toLowerCase());
  };

  const receivedBatches = available.filter(
    (b) => Number(b.status) === 3 && matchesDestination(b)
  );
  const incomingBatches = available.filter(
    (b) =>
      matchesDestination(b) &&
      (Number(b.status) === 2 || (b.regulatorApproved && Number(b.status) === 1))
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="chip">Retailer Console</span>
          <h1>Receive & Price</h1>
          <p>Receive distributor shipments and set the customer-facing price.</p>
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
          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            <label>Filter by destination (retailer address)</label>
            <input
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value.trim())}
              placeholder="0x..."
            />
          </div>
        </section>

        <section className="dashboard-card">
          <h2>Receive Batch</h2>
          <form style={{ display: "grid", gap: 12 }} onSubmit={receiveBatch}>
            <label>
              Batch ID
              <input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="FARM-2025-001" />
            </label>
            <label>
              Price (ETH)
              <input type="number" min="0" step="0.0001" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.25" />
            </label>
            <button className="cta" type="submit" disabled={!contract}>
              Save price
            </button>
          </form>
          {feedback && <p className="meta-line">{feedback}</p>}
        </section>

        <section className="dashboard-card">
          <h2>Incoming (Shipped/Approved)</h2>
          {incomingBatches.length === 0 && <p>No incoming batches yet.</p>}
          {incomingBatches.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Batch</th>
                  <th style={{ textAlign: "left" }}>Product</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Destination</th>
                </tr>
              </thead>
              <tbody>
                {incomingBatches.map((b) => (
                  <tr key={b.batchId}>
                    <td><code>{b.batchId}</code></td>
                    <td>{b.product}</td>
                    <td>{STATUS_TEXT[Number(b.status)] ?? Number(b.status)}</td>
                    <td>{b.destination || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Received History</h2>
          {receivedBatches.length === 0 && <p>No received batches yet.</p>}
          {receivedBatches.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Batch</th>
                  <th style={{ textAlign: "left" }}>Product</th>
                  <th style={{ textAlign: "left" }}>Destination</th>
                  <th style={{ textAlign: "left" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {receivedBatches.map((b) => (
                  <tr key={b.batchId}>
                    <td><code>{b.batchId}</code></td>
                    <td>{b.product}</td>
                    <td>{b.destination || "-"}</td>
                    <td>{formatPrice(b.priceWei)}</td>
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
