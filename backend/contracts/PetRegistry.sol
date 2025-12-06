// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PetRegistry {
    struct Pet {
        uint256 id;
        string name;
        string species;
        string breed;
        uint256 birthYear;
        address owner;
        bool lostMode;
    }

    uint256 private _nextPetId = 1;

    mapping(uint256 => Pet) private _pets;
    mapping(address => uint256[]) private _ownerPets;

    event PetRegistered(uint256 indexed petId, address indexed owner, string name);
    event LostModeUpdated(uint256 indexed petId, bool lostMode);

    // --- Core functions ---

    function registerPet(
        string memory name,
        string memory species,
        string memory breed,
        uint256 birthYear
    ) external returns (uint256) {
        uint256 petId = _nextPetId;
        _nextPetId += 1;

        _pets[petId] = Pet({
            id: petId,
            name: name,
            species: species,
            breed: breed,
            birthYear: birthYear,
            owner: msg.sender,
            lostMode: false
        });

        _ownerPets[msg.sender].push(petId);

        emit PetRegistered(petId, msg.sender, name);
        return petId;
    }

    function setLostMode(uint256 petId, bool lostMode) external {
        require(_pets[petId].id != 0, "Pet does not exist");
        require(_pets[petId].owner == msg.sender, "Not pet owner");

        _pets[petId].lostMode = lostMode;
        emit LostModeUpdated(petId, lostMode);
    }

    // --- Read functions (view) ---

    function getPet(uint256 petId) external view returns (
        uint256 id,
        string memory name,
        string memory species,
        string memory breed,
        uint256 birthYear,
        address owner,
        bool lostMode
    ) {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        return (p.id, p.name, p.species, p.breed, p.birthYear, p.owner, p.lostMode);
    }

    function getPetsOfOwner(address ownerAddr) external view returns (uint256[] memory) {
        return _ownerPets[ownerAddr];
    }
}
