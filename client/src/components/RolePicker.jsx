import { useEffect, useState } from "react";

export const ROLE_INFO = [
  {
    id: "Farmer",
    headline: "Record harvest lots",
    blurb: "Log crop batches with harvest metadata and origin tags."
  },
  {
    id: "Distributor",
    headline: "Validate logistics",
    blurb: "Confirm pickup + destination before retailers receive lots."
  },
  {
    id: "Retailer",
    headline: "Verify shelf inventory",
    blurb: "Approve batches, post prices, and prep consumer QR records."
  },
  {
    id: "Regulator",
    headline: "Audit traceability",
    blurb: "Record simple approve/reject decisions after spot checks."
  }
];

export default function RolePicker({ initial = "Farmer", onChange }) {
  const [role, setRole] = useState(initial);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ft-role");
      if (saved) {
        setRole(saved);
        onChange?.(saved);
      }
    } catch (err) {
      console.warn("Unable to read role from localStorage", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ft-role", role);
    } catch (err) {
      console.warn("Unable to persist role", err);
    }
    onChange?.(role);
  }, [role, onChange]);

  return (
    <div className="card-section">
      <div className="role-grid">
        {ROLE_INFO.map((info) => (
          <button
            key={info.id}
            type="button"
            className={`role-tile${role === info.id ? " active" : ""}`}
            onClick={() => setRole(info.id)}
          >
            <strong>{info.id}</strong>
            <span>{info.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
