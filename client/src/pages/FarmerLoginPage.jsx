import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FARMER_USERNAME = "farmer";
const FARMER_PASSWORD = "farmer@123";

export default function FarmerLoginPage({
  connectedAccount,
  balance,
  isDidlabChain,
  chainId,
  onAuthSuccess
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!connectedAccount) {
      setError("Connect MetaMask on the previous screen before logging in as Farmer.");
      return;
    }

    if (!isDidlabChain) {
      setError("Switch MetaMask to the DIDLab (252501) network to continue.");
      return;
    }

    if (username !== FARMER_USERNAME || password !== FARMER_PASSWORD) {
      setError("Invalid farmer credentials. Use farmer / farmer@123.");
      return;
    }

    setError("");
    onAuthSuccess?.();
    navigate("/farmer/dashboard", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <Link className="back-link" to="/">
            Back to portal
          </Link>
          <h1>Farmer Login</h1>
          <p>
            Enter the DIDLab demo credentials after confirming your wallet is connected to
            DIDLab Network (chain 252501).
          </p>
        </div>

        <div className="auth-status">
          <div>
            <span className="label">Wallet</span>
            <code>{connectedAccount ?? "Not connected"}</code>
          </div>
          <div>
            <span className="label">Balance</span>
            <code>{balance != null ? `${balance} ETH` : "-"}</code>
          </div>
          <div>
            <span className="label">Network</span>
            <code>{chainId ?? "-"}</code>
            <span className={`chip-small ${isDidlabChain ? "good" : "bad"}`}>
              {isDidlabChain ? "DIDLab" : "Mismatch"}
            </span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="farmer"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="farmer@123"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="error auth-error">{error}</div>}

          <button type="submit" className="cta wide">
            Login as Farmer
          </button>
        </form>

        <p className="auth-note">
          Demo credentials: <code>farmer</code> / <code>farmer@123</code>. Wallet auth plus
          password emulate a two-step stakeholder check for DIDLab training purposes.
        </p>
      </div>
    </div>
  );
}