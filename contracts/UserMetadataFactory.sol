// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./UserMetadata.sol";

contract UserMetadataFactory {
    mapping(address => address) public userToMetadataContract;
    address[] public userContracts;

    event UserContractCreated(address indexed userAddress, address userContract);

    function createUserContract(string memory organization, string memory country) public {
        require(userToMetadataContract[msg.sender] == address(0), "User contract already exists");

        UserMetadata newUserContract = new UserMetadata(msg.sender, organization, country);
        userToMetadataContract[msg.sender] = address(newUserContract);
        userContracts.push(address(newUserContract));

        emit UserContractCreated(msg.sender, address(newUserContract));
    }

    function getUserContracts() public view returns (address[] memory) {
        return userContracts;
    }

    function getUserContractAddress() public view returns (address) {
        return userToMetadataContract[msg.sender];
    }
}
