# ChainReaction – Semester Project Repository

Welcome to the official Git repository for the **ChainReaction** team project.

## 🧑‍🤝‍🧑 Team Members
- Mohan – Backend/API (gateway, QR endpoints, IoT ingestion)  
- Dinesh – Smart Contract / Chaincode (Fabric chaincode & tests)  
- Aasritha – Frontend / UX (consumer portal, QR scan UI)  
- Srija – PM / Scrum + DevOps & Testing (network setup, CI, test orchestration)  

## 📚 Project Overview
This repository hosts our semester-long project on **Trusted Traceability for Food Supply Chains**.  
We aim to design and implement a blockchain-based system (using **Hyperledger Fabric**) that enables farm-to-shelf provenance, rapid recall, and consumer verification.

Inspired by the IBM–Walmart Food Trust use case, our system will allow:
- Farmers, distributors, and retailers to record product lifecycle events (create, ship, receive, sell).  
- Consumers to scan a QR/NFC tag and instantly verify the provenance of their food items.  
- Regulators to audit the chain of custody in seconds instead of days.  

## 🚀 Key Features
- Batch lifecycle management with on-chain traceability.  
- QR/NFC codes for consumer verification via a simple web portal.  
- Role-based access control enforced by Fabric endorsement policies.  
- (Stretch Goal) IoT sensor integration to detect and log temperature breaches.  
- (Stretch Goal) Analytics dashboard for KPIs (e.g., verification success rate, breach rate).  

## 📂 Repository Structure
- `docs/` → Proposal, diagrams, and documentation  
- `chaincode/` → Hyperledger Fabric chaincode implementation  
- `backend/` → Node.js backend (gateway APIs, QR scan, IoT ingestion)  
- `frontend/` → Consumer-facing portal (QR verification UI)  
- `tests/` → Unit and integration tests  
- `.github/workflows/` → CI/CD pipeline config  

## 📅 Timeline
Project milestones follow the weekly plan (Weeks 6–14) defined in our proposal.  
Details: [docs/PROPOSAL.md](./docs/PROPOSAL.md)

---

📌 **Demo Goal (60 seconds):** Scan a QR code → consumer portal shows the batch path (Farmer → Distributor → Retailer) with timestamps and signatures. If a temperature breach occurred, it is flagged immediately.
