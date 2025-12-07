// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PetRegistry {
    struct Pet {
        uint256 id;
        string name;
        string species;
        string breed;
        uint256 birthYear;
        address primaryOwner;
        address[] coOwners;
        bool lostMode;
    }

    uint256 private _nextPetId = 1;

    mapping(uint256 => Pet) private _pets;
    mapping(address => uint256[]) private _ownerPets; // primary + co-owners

    event PetRegistered(uint256 indexed petId, address indexed owner, string name);
    event LostModeUpdated(uint256 indexed petId, bool lostMode);
    event CoOwnerAdded(uint256 indexed petId, address indexed newOwner);
    event CoOwnerRemoved(uint256 indexed petId, address indexed removedOwner);

    // ---------- internal helpers ----------

    function _isOwner(address user, uint256 petId) internal view returns (bool) {
        Pet storage p = _pets[petId];
        if (p.primaryOwner == user) {
            return true;
        }
        for (uint256 i = 0; i < p.coOwners.length; i++) {
            if (p.coOwners[i] == user) {
                return true;
            }
        }
        return false;
    }

    // ---------- core owner actions ----------

    function registerPet(
        string memory name,
        string memory species,
        string memory breed,
        uint256 birthYear
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(species).length > 0, "Species required");
        require(birthYear > 1900 && birthYear <= (block.timestamp / 365 days + 1970), "Invalid birth year");

        uint256 petId = _nextPetId;
        _nextPetId += 1;

        Pet storage p = _pets[petId];
        p.id = petId;
        p.name = name;
        p.species = species;
        p.breed = breed;
        p.birthYear = birthYear;
        p.primaryOwner = msg.sender;
        p.lostMode = false;

        _ownerPets[msg.sender].push(petId);

        emit PetRegistered(petId, msg.sender, name);
        return petId;
    }

    function setLostMode(uint256 petId, bool lostMode) external {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        require(_isOwner(msg.sender, petId), "Not a pet owner");

        p.lostMode = lostMode;
        emit LostModeUpdated(petId, lostMode);
    }

    // ---------- multi-owner management ----------

    function addCoOwner(uint256 petId, address newOwner) external {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        require(_isOwner(msg.sender, petId), "Not a pet owner");
        require(newOwner != address(0), "Invalid new owner");
        require(!_isOwner(newOwner, petId), "Already owner");

        p.coOwners.push(newOwner);
        _ownerPets[newOwner].push(petId);

        emit CoOwnerAdded(petId, newOwner);
    }

    function removeCoOwner(uint256 petId, address ownerToRemove) external {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        require(msg.sender == p.primaryOwner, "Only primary owner");
        require(ownerToRemove != address(0), "Invalid address");
        require(ownerToRemove != p.primaryOwner, "Cannot remove primary");

        // remove from coOwners
        uint256 len = p.coOwners.length;
        bool found = false;
        for (uint256 i = 0; i < len; i++) {
            if (p.coOwners[i] == ownerToRemove) {
                p.coOwners[i] = p.coOwners[len - 1];
                p.coOwners.pop();
                found = true;
                break;
            }
        }
        require(found, "Not a co-owner");

        // remove from _ownerPets[ownerToRemove]
        uint256[] storage list = _ownerPets[ownerToRemove];
        uint256 l2 = list.length;
        for (uint256 j = 0; j < l2; j++) {
            if (list[j] == petId) {
                list[j] = list[l2 - 1];
                list.pop();
                break;
            }
        }

        emit CoOwnerRemoved(petId, ownerToRemove);
    }

    // ---------- views ----------

    /// Backwards-compatible: single owner return (primaryOwner)
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
        )
    {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        return (
            p.id,
            p.name,
            p.species,
            p.breed,
            p.birthYear,
            p.primaryOwner,
            p.lostMode
        );
    }

    /// New: expose all owners for UI / access decisions
    function getPetOwners(
        uint256 petId
    ) external view returns (address primaryOwner, address[] memory coOwners) {
        Pet storage p = _pets[petId];
        require(p.id != 0, "Pet does not exist");
        return (p.primaryOwner, p.coOwners);
    }

    function getPetsOfOwner(address ownerAddr) external view returns (uint256[] memory) {
        return _ownerPets[ownerAddr];
    }

    function isOwner(address user, uint256 petId) external view returns (bool) {
        return _isOwner(user, petId);
    }
}
