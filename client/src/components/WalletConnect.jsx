import { useEffect, useState } from "react";
import { ethers } from "ethers";

const DIDLAB_NETWORK = {
  chainId: "0x3da55", // 252501
  chainName: "DIDLab Network",
  nativeCurrency: {
    name: "Test ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://eth.didlab.org"],
  blockExplorerUrls: ["https://explorer.didlab.org"]
};

const DIDLAB_CHAIN_DEC = parseInt(DIDLAB_NETWORK.chainId, 16);

async function ensureDidlabChain(ethereum) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: DIDLAB_NETWORK.chainId }]
    });
  } catch (switchError) {
    if (switchError?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: DIDLAB_NETWORK.chainId,
            chainName: DIDLAB_NETWORK.chainName,
            rpcUrls: DIDLAB_NETWORK.rpcUrls,
            nativeCurrency: DIDLAB_NETWORK.nativeCurrency
          }
        ]
      });
      return;
    }
    throw switchError;
  }
}

const formatDecimalChain = (cid) => {
  if (!cid) return "—";
  try {
    return parseInt(cid, 16);
  } catch (err) {
    return "?";
  }
};

const formatBalance = (weiValue) => {
  try {
    const numeric = Number.parseFloat(ethers.formatEther(weiValue));
    if (!Number.isFinite(numeric)) return null;
    if (numeric === 0) return "0.0000";
    if (numeric >= 1) return numeric.toFixed(4);
    return numeric.toPrecision(4);
  } catch (err) {
    return null;
  }
};

export default function WalletConnect({
  onConnected,
  onDisconnected,
  onChainStatusChange,
  onBalanceChange
}) {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isDidlabChain, setIsDidlabChain] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const clearAccountState = () => {
    setAccount(null);
    setBalance(null);
    onConnected?.(null);
    onBalanceChange?.(null);
    onDisconnected?.();
  };

  const refreshBalance = async (addr) => {
    if (!addr) {
      setBalance(null);
      onBalanceChange?.(null);
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const raw = await provider.getBalance(addr);
      const formatted = formatBalance(raw);
      setBalance(formatted);
      onBalanceChange?.(formatted);
    } catch (err) {
      console.error("Failed to fetch balance", err);
      setBalance(null);
      onBalanceChange?.(null);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) {
      setHasMetaMask(false);
      return;
    }

    setHasMetaMask(true);

    const syncChain = (cid) => {
      const matches = cid?.toLowerCase() === DIDLAB_NETWORK.chainId;
      setChainId(cid);
      setIsDidlabChain(matches);
      onChainStatusChange?.({ chainId: cid, isDidlab: matches });
      if (account) {
        refreshBalance(account);
      }
    };

    const handleAccountsChanged = async (accounts) => {
      if (accounts?.length) {
        const addr = ethers.getAddress(accounts[0]);
        setAccount(addr);
        setError("");
        onConnected?.(addr);
        await refreshBalance(addr);
      } else {
        clearAccountState();
      }
    };

    const handleChainChanged = (cid) => {
      syncChain(cid);
    };

    ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts?.length) {
          const addr = ethers.getAddress(accounts[0]);
          setAccount(addr);
          onConnected?.(addr);
          await refreshBalance(addr);
        }
      })
      .catch((err) => console.error("Failed to fetch accounts", err));

    ethereum
      .request({ method: "eth_chainId" })
      .then((cid) => {
        syncChain(cid);
      })
      .catch(() => {
        setChainId(null);
        setIsDidlabChain(false);
        onChainStatusChange?.({ chainId: null, isDidlab: false });
      });

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (!ethereum?.removeListener) return;
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, onConnected, onDisconnected, onChainStatusChange, onBalanceChange]);

  useEffect(() => {
    if (account) {
      refreshBalance(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError("");
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("MetaMask is not detected. Please install the browser extension.");
      }

      try {
        await ensureDidlabChain(ethereum);
      } catch (err) {
        if (err?.code === 4001) {
          throw new Error("Please approve the DIDLab network request in MetaMask to continue.");
        }
        throw err;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts?.length) {
        const addr = ethers.getAddress(accounts[0]);
        setAccount(addr);
        onConnected?.(addr);
        await refreshBalance(addr);
      }

      const cid = await ethereum.request({ method: "eth_chainId" });
      const matches = cid?.toLowerCase() === DIDLAB_NETWORK.chainId;
      setChainId(cid);
      setIsDidlabChain(matches);
      onChainStatusChange?.({ chainId: cid, isDidlab: matches });
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Unable to connect to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToDidlab = async () => {
    try {
      setIsSwitching(true);
      setError("");
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("MetaMask is not detected.");
      }
      await ensureDidlabChain(ethereum);
      const cid = await ethereum.request({ method: "eth_chainId" });
      const matches = cid?.toLowerCase() === DIDLAB_NETWORK.chainId;
      setChainId(cid);
      setIsDidlabChain(matches);
      onChainStatusChange?.({ chainId: cid, isDidlab: matches });
      if (account) {
        await refreshBalance(account);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Unable to switch network");
    } finally {
      setIsSwitching(false);
    }
  };

  if (!hasMetaMask) {
    return (
      <div className="card-section">
        <p className="error">
          MetaMask is not detected. Install the extension and refresh to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="card-section">
      <div className={`network-pill ${isDidlabChain ? "ok" : "warn"}`}>
        {isDidlabChain ? "Connected to DIDLab (252501)" : "Not on DIDLab chain"}
        {!isDidlabChain && (
          <button className="pill-action" type="button" onClick={switchToDidlab} disabled={isSwitching}>
            {isSwitching ? "Switching..." : "Switch to DIDLab"}
          </button>
        )}
      </div>

      <div>
        <button className="cta" onClick={connect} disabled={!!account || isConnecting}>
          {account ? "Wallet Connected" : isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="status">
        <span>
          <b>Connected</b>
          {account ? "Yes" : "No"}
        </span>
        <span>
          <b>Account</b>
          {account ? (
            <code className="status-address" title={account}>{account}</code>
          ) : (
            "—"
          )}
        </span>
        <span>
          <b>Balance</b>
          {balance != null ? `${balance} ETH` : "—"}
        </span>
        <span>
          <b>Chain</b>
          {chainId ? `${chainId} (${formatDecimalChain(chainId)})` : "—"}
        </span>
        <span>
          <b>Expected</b>
          {`${DIDLAB_NETWORK.chainId} (${DIDLAB_CHAIN_DEC})`}
        </span>
      </div>
    </div>
  );
}

