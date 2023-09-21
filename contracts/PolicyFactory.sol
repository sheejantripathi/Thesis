// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./EnforceablePolicy.sol";

contract SmartContractFactory {
    event NewSmartContract(address indexed creator, address smartContractAddress, address indexed dataRequester, string permission, uint256 startTime, uint256 endTime);

    struct Policy {
        address user;
        string permission;
        uint256 startTime;
        uint256 endTime;
    }

    Policy[] public policies;

    function addPolicy(address user, string memory permission, uint256 startTime, uint256 endTime) public {
        policies.push(Policy(user, permission, startTime, endTime));
    }

    function createSmartContracts() public {
        // Validate the Ethereum address
        require(validateEthereumAddress(dataRequester), "Invalid Ethereum address");
        
        for (uint256 i = 0; i < policies.length; i++) {
            Policy memory policy = policies[i];
            EnforceableSmartContract newSmartContract = new EnforceableSmartContract(policy.user, policy.permission, policy.startTime, policy.endTime);
            emit NewSmartContract(msg.sender, address(newSmartContract), policy.user, policy.permission, policy.startTime, policy.endTime);
        }
    }
}