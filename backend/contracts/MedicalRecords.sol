// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

interface IPetRegistry {
    function getPet(
        uint256 petId
    )
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory species,
            string memory breed,
            uint256 birthYear,
            address owner,
            bool lostMode
        );

    function isOwner(address user, uint256 petId) external view returns (bool);
}

contract MedicalRecords {
    struct Record {
        uint256 id;
        uint256 petId;
        address vet;
        uint256 timestamp;
        string title;
        string details;
    }

    uint256 private _nextRecordId = 1;
    address public petRegistry;
    address public admin;

    mapping(address => bool) public isVet;
    mapping(uint256 => Record) private _records;
    mapping(uint256 => uint256[]) private _petRecordIds;

    event RecordAdded(uint256 indexed recordId, uint256 indexed petId, address indexed vet);
    event VetApprovalChanged(address indexed vet, bool approved);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyVet() {
        require(isVet[msg.sender], "Not approved vet");
        _;
    }

    constructor(address petRegistryAddress) {
        require(petRegistryAddress != address(0), "Invalid PetRegistry address");
        petRegistry = petRegistryAddress;
        admin = msg.sender;
    }

    // ---------- admin: manage vets ----------

    function setVet(address vet, bool approved) external onlyAdmin {
        require(vet != address(0), "Invalid vet address");
        isVet[vet] = approved;
        emit VetApprovalChanged(vet, approved);
    }

    // ---------- internal: view access ----------

    function _canViewRecords(address user, uint256 petId) internal view returns (bool) {
        if (isVet[user]) return true;

        bool ownerOk = IPetRegistry(petRegistry).isOwner(user, petId);
        return ownerOk;
    }

    // ---------- vet action: add record ----------

    function addRecord(
        uint256 petId,
        string calldata title,
        string calldata details
    ) external onlyVet returns (uint256) {
        require(petId != 0, "Invalid petId");
        require(bytes(title).length > 0, "Title required");

        IPetRegistry(petRegistry).getPet(petId); // reverts if pet not exist

        uint256 recordId = _nextRecordId;
        _nextRecordId += 1;

        _records[recordId] = Record({
            id: recordId,
            petId: petId,
            vet: msg.sender,
            timestamp: block.timestamp,
            title: title,
            details: details
        });

        _petRecordIds[petId].push(recordId);

        emit RecordAdded(recordId, petId, msg.sender);
        return recordId;
    }

    // ---------- views (restricted to vets/owners) ----------

    function getRecord(
        uint256 recordId
    )
        external
        view
        returns (
            uint256 id,
            uint256 petId,
            address vet,
            uint256 timestamp,
            string memory title,
            string memory details
        )
    {
        Record storage r = _records[recordId];
        require(r.id != 0, "Record does not exist");
        require(_canViewRecords(msg.sender, r.petId), "Not authorized to view");
        return (r.id, r.petId, r.vet, r.timestamp, r.title, r.details);
    }

    function getRecordIdsForPet(uint256 petId) external view returns (uint256[] memory) {
        require(_canViewRecords(msg.sender, petId), "Not authorized to view");
        return _petRecordIds[petId];
    }
}
