import { Link } from "react-router-dom";
import RolePicker, { ROLE_INFO } from "../components/RolePicker.jsx";
import WalletConnect from "../components/WalletConnect.jsx";

function getRoleHeadline(role) {
  const roleMeta = ROLE_INFO.find((r) => r.id === role);
  return roleMeta?.headline ?? "";
}

export default function LandingPage({
  connectedAccount,
  connectedBalance,
  onConnected,
  onDisconnected,
  onChainStatusChange,
  onBalanceChange,
  activeRole,
  onRoleChange
}) {
  return (
    <div className="page">
      <section className="hero">
        <span className="chip">DIDLab Deployment</span>
        <h1>Food Traceability Portal</h1>
        <div className="hero-highlights">
          <div className="highlight">MetaMask SSO</div>
          <div className="highlight">Role-Based UI</div>
          <div className="highlight">On-chain Provenance</div>
          <div className="highlight">Consumer QR Proof</div>
        </div>
      </section>

      <section className="login-card">
        <div className="badge">Stakeholder Login</div>
        <h2>Sign in with MetaMask</h2>

        <WalletConnect
          onConnected={onConnected}
          onDisconnected={onDisconnected}
          onChainStatusChange={onChainStatusChange}
          onBalanceChange={onBalanceChange}
        />

        <RolePicker initial={activeRole} onChange={onRoleChange} />

        <div className="meta">
          <strong>Current wallet</strong>
          <span className="meta-line">
            Connected:{" "}
            <b>{connectedAccount ? "Yes" : "No"}</b>
          </span>
          <span className="meta-line">
            Account:
            {connectedAccount ? <code>{connectedAccount}</code> : "-"}
          </span>
          <span className="meta-line">
            Balance:{" "}
            {connectedBalance != null ? <code>{connectedBalance} ETH</code> : "-"}
          </span>
          <span className="meta-line">
            Active role: <b>{activeRole}</b> - {getRoleHeadline(activeRole)}.
          </span>
        </div>

        <Link className="cta secondary" to="/farmer/login">
          Farmer login
        </Link>

        <div className="meta" style={{ marginTop: 16 }}>
          <strong>Operational consoles</strong>
          <div className="meta-line">
            <Link to="/distributor" className="link-inline">Distributor</Link>
            {" | "}
            <Link to="/retailer" className="link-inline">Retailer</Link>
            {" | "}
            <Link to="/regulator" className="link-inline">Regulator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
