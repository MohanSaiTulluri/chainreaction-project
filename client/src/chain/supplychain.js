// Minimal ABI for FoodSupplyChain used in Week 1 dashboard
export const SUPPLYCHAIN_ABI = [
  {
    type: "function",
    name: "createBatch",
    stateMutability: "nonpayable",
    inputs: [
      {
        components: [
          { name: "product", type: "string" },
          { name: "origin", type: "string" },
          { name: "quantity", type: "uint256" },
          { name: "unit", type: "string" },
          { name: "batchId", type: "string" },
        ],
        name: "input",
        type: "tuple",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "regulatorDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "batchId", type: "string" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setDestination",
    stateMutability: "nonpayable",
    inputs: [
      { name: "batchId", type: "string" },
      { name: "destinationRetailer", type: "string" },
      { name: "shipDate", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "retailerReceive",
    stateMutability: "nonpayable",
    inputs: [
      { name: "batchId", type: "string" },
      { name: "priceWei", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listMyBatchIds",
    stateMutability: "view",
    inputs: [{ name: "farmer", type: "address" }],
    outputs: [{ name: "", type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "getBatch",
    stateMutability: "view",
    inputs: [{ name: "batchId", type: "string" }],
    outputs: [
      {
        components: [
          { name: "product", type: "string" },
          { name: "origin", type: "string" },
          { name: "quantity", type: "uint256" },
          { name: "unit", type: "string" },
          { name: "batchId", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "farmer", type: "address" },
          { name: "destination", type: "string" },
          { name: "shipDate", type: "uint256" },
          { name: "priceWei", type: "uint256" },
          { name: "regulatorReviewed", type: "bool" },
          { name: "regulatorApproved", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
  {
    type: "event",
    name: "BatchCreated",
    inputs: [
      { name: "batchId", type: "string", indexed: false },
      { name: "farmer", type: "address", indexed: true },
      { name: "at", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BatchShipped",
    inputs: [
      { name: "batchId", type: "string", indexed: false },
      { name: "to", type: "string", indexed: false },
      { name: "at", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BatchRetailApproved",
    inputs: [
      { name: "batchId", type: "string", indexed: false },
      { name: "priceWei", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BatchRegulatorReviewed",
    inputs: [
      { name: "batchId", type: "string", indexed: false },
      { name: "approved", type: "bool", indexed: false },
    ],
  },
];

export const STATUS_TEXT = ["Created", "Approved", "Shipped", "Received"];
