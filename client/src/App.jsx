import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import FarmerLoginPage from "./pages/FarmerLoginPage.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import DistributorDashboard from "./pages/DistributorDashboard.jsx";
import RetailerDashboard from "./pages/RetailerDashboard.jsx";
import RegulatorDashboard from "./pages/RegulatorDashboard.jsx";

export default function App() {
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [chainState, setChainState] = useState({ chainId: null, isDidlab: false });
  const [activeRole, setActiveRole] = useState(() => {
    try {
      return window.localStorage.getItem("ft-role") ?? "Farmer";
    } catch (err) {
      return "Farmer";
    }
  });
  const [isFarmerAuthenticated, setIsFarmerAuthenticated] = useState(false);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role !== "Farmer") {
      setIsFarmerAuthenticated(false);
    }
  };

  const handleConnected = (addr) => {
    setConnectedAccount(addr);
    if (!addr) {
      setAccountBalance(null);
      setIsFarmerAuthenticated(false);
    }
  };

  const handleDisconnected = () => {
    setConnectedAccount(null);
    setAccountBalance(null);
    setIsFarmerAuthenticated(false);
  };

  const handleChainStatusChange = (status) => {
    setChainState({ chainId: status?.chainId ?? null, isDidlab: !!status?.isDidlab });
  };

  const handleBalanceChange = (value) => {
    setAccountBalance(value);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            connectedAccount={connectedAccount}
            connectedBalance={accountBalance}
            onConnected={handleConnected}
            onDisconnected={handleDisconnected}
            onChainStatusChange={handleChainStatusChange}
            onBalanceChange={handleBalanceChange}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
          />
        }
      />
      <Route
        path="/farmer/login"
        element={
          <FarmerLoginPage
            connectedAccount={connectedAccount}
            balance={accountBalance}
            isDidlabChain={chainState.isDidlab}
            chainId={chainState.chainId}
            onAuthSuccess={() => setIsFarmerAuthenticated(true)}
          />
        }
      />
      <Route
        path="/farmer/dashboard"
        element={
          isFarmerAuthenticated ? (
            <FarmerDashboard
              connectedAccount={connectedAccount}
              balance={accountBalance}
              onLogout={() => setIsFarmerAuthenticated(false)}
            />
          ) : (
            <Navigate to="/farmer/login" replace />
          )
        }
      />
      <Route path="/distributor" element={<DistributorDashboard />} />
      <Route path="/retailer" element={<RetailerDashboard />} />
      <Route path="/regulator" element={<RegulatorDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
