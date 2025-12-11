import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { SUPPLYCHAIN_ABI } from "./supplychain.js";

export function useSupplyChainContract(address) {
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setContract(null);
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (!(window)?.ethereum) {
          throw new Error("MetaMask is not detected.");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const code = await provider.getCode(address);
        if (!code || code === "0x") {
          throw new Error("Address is not a contract on this chain.");
        }
        const signer = await provider.getSigner();
        const instance = new ethers.Contract(address, SUPPLYCHAIN_ABI, signer);
        if (!cancelled) {
          setContract(instance);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(err?.message || "Failed to init contract.");
          setContract(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { contract, error, loading };
}
