import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Expose Vite on all interfaces for LAN/Tailscale access and
// point HMR/origin at the Tailscale IP.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    origin: "http://100.114.157.9:5173",
    hmr: { host: "100.114.157.9" }
  }
});
