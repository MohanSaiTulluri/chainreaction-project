import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { SUPPLYCHAIN_ABI, STATUS_TEXT } from "../chain/supplychain.js";

export default function FarmerDashboard({ connectedAccount, balance, onLogout }) {
  const navigate = useNavigate();

  const [contractAddress, setContractAddress] = useState(() => {
    try { return localStorage.getItem("ft-contract") ?? ""; } catch { return ""; }
  });
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [product, setProduct] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [origin, setOrigin] = useState("");

  const [batches, setBatches] = useState([]);
  const canTransact = useMemo(() => connectedAccount && contract, [connectedAccount, contract]);
  useEffect(() => {
    if (!contractAddress) { setContract(null); return; }
    try { localStorage.setItem("ft-contract", contractAddress); } catch {}
    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const c = new ethers.Contract(contractAddress, SUPPLYCHAIN_ABI, signer);
        // sanity check: call a cheap view to verify this is our contract
        try {
          await c.listMyBatchIds(ethers.ZeroAddress);
        } catch (viewErr) {
          throw new Error("The provided address does not look like a FoodSupplyChain contract.");
        }
        setError("");
        setContract(c);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to init contract. Check address.");
        setContract(null);
      }
    })();
  }, [contractAddress]);

  async function refreshBatches() {
    if (!contract || !connectedAccount) return;
    try {
      setLoading(true);
      setError("");
      const out = [];
      const recent = JSON.parse(localStorage.getItem("ft-recent-batchIds") || "[]");
      for (const bid of recent) {
        try {
          const b = await contract.getBatch(bid);
          if (b && b.farmer !== ethers.ZeroAddress) out.push(b);
        } catch {}
      }
      setBatches(out);
    } catch (e) {
      console.error(e);
      setError(e?.shortMessage || e?.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshBatches(); }, [contract, connectedAccount]);

  const handleSignOut = () => {
    onLogout?.();
    navigate("/farmer/login", { replace: true });
  };

  async function createBatch(e) {
    e?.preventDefault();
    if (!canTransact) return;
    if (!product || !batchId || !quantity || !unit) { setError("Fill required fields"); return; }
    try {
      setLoading(true); setError("");
      const qty = BigInt(String(quantity));
      const tx = await contract.createBatch({ product, origin, quantity: qty, unit, batchId });
      await tx.wait();
      try {
        const list = JSON.parse(localStorage.getItem("ft-recent-batchIds") || "[]");
        if (!list.includes(batchId)) list.unshift(batchId);
        localStorage.setItem("ft-recent-batchIds", JSON.stringify(list.slice(0, 20)));
      } catch {}
      await refreshBatches();
      setProduct(""); setBatchId(""); setQuantity(""); setUnit("kg"); setOrigin("");
    } catch (e) {
      console.error(e);
      setError(e?.shortMessage || e?.message || "Create failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="chip">Farmer Workspace</span>
          <h1>Harvest Batch Console</h1>
          <p>
            Connected <code>{connectedAccount ?? "—"}</code> · Balance <code>{balance ?? "—"} ETH</code>
          </p>
        </div>
        <div className="dashboard-actions">
          <div className="wallet-pill">
            <span className="label">Wallet</span>
            <code>{connectedAccount ?? "Not connected"}</code>
            <span className="label">Balance</span>
            <code>{balance != null ? `${balance} ETH` : "—"}</code>
          </div>
          <button type="button" className="cta outline" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      {error && <div className="error" style={{marginTop: 8}}>{error}</div>}

      <main className="dashboard-grid">
        <section className="dashboard-card">
          <h2>Connect Contract</h2>
          <p style={{marginTop: 0}}>Paste your deployed FoodSupplyChain address:</p>
          <input
            value={contractAddress}
            onChange={(e)=>setContractAddress(e.target.value.trim())}
            placeholder="0x..."
            style={{width: "100%", padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.22)", background:"rgba(12,20,34,0.75)", color:"#fff"}}
          />
        </section>

        <section className="dashboard-card">
          <h2>Create Batch</h2>
          <form onSubmit={createBatch} style={{display:"grid", gap:12}}>
            <div style={{display:"grid", gap:8}}>
              <label>Product</label>
              <input value={product} onChange={(e)=>setProduct(e.target.value)} placeholder="Tomatoes" />
            </div>
            <div style={{display:"grid", gap:8}}>
              <label>Batch ID</label>
              <input value={batchId} onChange={(e)=>setBatchId(e.target.value)} placeholder="FARM-2025-001" />
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 140px", gap:12}}>
              <div style={{display:"grid", gap:8}}>
                <label>Quantity</label>
                <input value={quantity} onChange={(e)=>setQuantity(e.target.value)} placeholder="1000" />
              </div>
              <div style={{display:"grid", gap:8}}>
                <label>Unit</label>
                <input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="kg" />
              </div>
            </div>
            <div style={{display:"grid", gap:8}}>
              <label>Origin (farm)</label>
              <input value={origin} onChange={(e)=>setOrigin(e.target.value)} placeholder="Green Valley Farm" />
            </div>
            <div>
              <button className="cta">Create Batch</button>
            </div>
          </form>
        </section>

        <section className="dashboard-card">
          <h2>My Batches</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left", paddingBottom:8}}>BatchID</th>
                  <th style={{textAlign:"left", paddingBottom:8}}>Product</th>
                  <th style={{textAlign:"left", paddingBottom:8}}>Quantity</th>
                  <th style={{textAlign:"left", paddingBottom:8}}>Status</th>
                  <th style={{textAlign:"left", paddingBottom:8}}>Regulator</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} style={{paddingTop:8}}>Loading…</td></tr>}
                {!loading && batches.length === 0 && (
                  <tr><td colSpan={5} style={{paddingTop:8, color:"rgba(240,244,255,0.75)"}}>No batches yet. Create one above.</td></tr>
                )}
                {batches.map((b) => (
                  <tr key={b.batchId}>
                    <td><code>{b.batchId}</code></td>
                    <td>{b.product}</td>
                    <td>{String(b.quantity)} {b.unit}</td>
                    <td>{STATUS_TEXT[b.status] ?? b.status}</td>
                    <td>
                      {b.regulatorReviewed ? (
                        <div style={{display:"grid", gap:4}}>
                          <span className={`chip-small ${b.regulatorApproved ? "good" : "bad"}`}>
                            {b.regulatorApproved ? "Approved" : "Rejected"}
                          </span>
                        </div>
                      ) : (
                        "Pending review"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-card">
          <h2>Help</h2>
          <ul>
            <li>Paste the deployed FoodSupplyChain address (see DIDLab deploy output).</li>
            <li>Batch IDs are user-defined; ensure uniqueness. Contract enforces it.</li>
          </ul>
          <Link className="link-inline" to="/">Back to landing page</Link>
        </section>
      </main>

    </div>
  );
}
