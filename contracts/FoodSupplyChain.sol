// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FoodSupplyChain (streamlined for demos)
/// @notice Minimal, academic-friendly traceability contract with no role gating.
/// Flow: farmer creates batch -> regulator approves -> distributor sets destination/date -> retailer sets price.
contract FoodSupplyChain {

    enum Status { Created, Approved, Shipped, Received }

    struct Batch {
        string product;
        string origin;
        uint256 quantity;
        string unit;
        string batchId; // human readable id
        uint256 createdAt;
        Status status;
        address farmer;
        string destination; // retailer or physical address
        uint256 shipDate; // unix seconds
        uint256 priceWei; // retailer price
        bool regulatorReviewed;
        bool regulatorApproved;
    }

    struct CreateBatchInput {
        string product;
        string origin;
        uint256 quantity;
        string unit;
        string batchId;
    }

    // storage
    mapping(bytes32 => Batch) private _batches;
    mapping(address => bytes32[]) private _farmerBatches; // index for convenience

    // events
    event BatchCreated(string batchId, address indexed farmer, uint256 at);
    event BatchShipped(string batchId, string to, uint256 at);
    event BatchRetailApproved(string batchId, uint256 priceWei);
    event BatchRegulatorReviewed(string batchId, bool approved);

    constructor() {}

    function _idOf(string memory batchId) internal pure returns (bytes32) {
        return keccak256(bytes(batchId));
    }

    /// @notice Create a new batch (no role checks for simplicity)
    function createBatch(CreateBatchInput calldata input) external {
        require(bytes(input.batchId).length > 0, "batchId required");
        require(bytes(input.product).length > 0, "product required");
        require(bytes(input.unit).length > 0, "unit required");
        require(input.quantity > 0, "qty > 0");

        bytes32 id = _idOf(input.batchId);
        require(_batches[id].createdAt == 0, "batch exists");

        Batch storage b = _batches[id];
        b.product = input.product;
        b.origin = input.origin;
        b.quantity = input.quantity;
        b.unit = input.unit;
        b.batchId = input.batchId;
        b.createdAt = block.timestamp;
        b.status = Status.Created;
        b.farmer = msg.sender;

        _farmerBatches[msg.sender].push(id);
        emit BatchCreated(input.batchId, msg.sender, block.timestamp);
    }

    /// @notice Regulator approves or rejects a batch
    function regulatorDecision(string calldata batchId, bool approved) external {
        bytes32 id = _idOf(batchId);
        Batch storage b = _batches[id];
        require(b.createdAt != 0, "not found");
        b.regulatorReviewed = true;
        b.regulatorApproved = approved;
        if (approved && b.status != Status.Received) {
            b.status = Status.Approved;
        }
        emit BatchRegulatorReviewed(batchId, approved);
    }

    /// @notice Distributor sets destination retailer and date (after regulator approval)
    function setDestination(string calldata batchId, string calldata destinationRetailer, uint256 shipDate) external {
        bytes32 id = _idOf(batchId);
        Batch storage b = _batches[id];
        require(b.createdAt != 0, "not found");
        require(b.regulatorApproved, "regulator not approved");
        // Allow calling even if already shipped to avoid demo lockups
        b.status = Status.Shipped;
        b.destination = destinationRetailer;
        b.shipDate = shipDate;
        emit BatchShipped(batchId, destinationRetailer, shipDate);
    }

    /// @notice Retailer receives batch and sets price
    function retailerReceive(string calldata batchId, uint256 priceWei) external {
        bytes32 id = _idOf(batchId);
        Batch storage b = _batches[id];
        require(b.createdAt != 0, "not found");
        require(priceWei > 0, "price required");
        // Permit from Approved or Shipped to keep demos simple
        b.status = Status.Received;
        b.priceWei = priceWei;
        emit BatchRetailApproved(batchId, priceWei);
    }

    // views
    function getBatch(string calldata batchId) external view returns (Batch memory) {
        bytes32 id = _idOf(batchId);
        return _batches[id];
    }

    function listMyBatchIds(address farmer) external view returns (bytes32[] memory) {
        return _farmerBatches[farmer];
    }
}
