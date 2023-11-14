// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./GroupContract.sol";

contract PolicyManager {
    mapping(address => address[]) private ownerToGroupContracts;

    event GroupContractCreated(string indexed group, address childContract, string message);

    function createGroupContract(
        string memory _groupName,
        string memory _permissions,
        string[] memory _organizations,
        string[] memory _countries
    ) external {
        require(msg.sender != address(0), "Invalid data owner address");
        require(bytes(_groupName).length > 0, "Group name cannot be empty");

        GroupContract groupContract = new GroupContract(
            _groupName,
            msg.sender,
            _permissions,
            _organizations,
            _countries
        );

        ownerToGroupContracts[msg.sender].push(address(groupContract));

        emit GroupContractCreated(_groupName, address(groupContract), "Group contract created successfully!!");
    }

    function getGroupContractAddresses(address ownerAddress) public view returns (address[] memory) {
        return ownerToGroupContracts[ownerAddress];
    }
}
