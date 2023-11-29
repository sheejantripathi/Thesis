// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./UserMetadata.sol";

contract UserMetadataFactory {
    mapping(address => address) public userToMetadataContract;
    mapping(address => bool) public isUserContractExist; // New mapping to track contract existence

    event UserContractCreated(address indexed userAddress, address userContract);

    function createUserContract(address userAddress, string memory organization, string memory country) public {
        require(!isUserContractExist[userAddress], "User contract already exists");

        UserMetadata newUserContract = new UserMetadata(userAddress, organization, country);
        userToMetadataContract[userAddress] = address(newUserContract);
        isUserContractExist[userAddress] = true; // Mark the contract as existing

        emit UserContractCreated(userAddress, address(newUserContract));
    }

    function getUserContractAddress() public view returns (address) {
        return userToMetadataContract[msg.sender];
    }

    // New function to check if the user contract exists for a given address
    function doesUserContractExist(address userAddress) public view returns (bool) {
        return isUserContractExist[userAddress];
    }
}
