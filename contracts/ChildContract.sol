// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract ChildContract {
    address public parentContract;
    
    // Define a struct to store policy data
    struct PolicyData {
        bool hasAccess;
        string accessType;
        uint256 accessFrom;
        uint256 accessTo;
    }
    
    // Mapping to store policy data for each user
    mapping(address => PolicyData) public userPolicies;

    constructor() {
        parentContract = msg.sender;
    }

    modifier onlyParentContract() {
        require(msg.sender == parentContract, "Only the parent contract can call this function");
        _;
    }

    function setPolicy(
        address userAddress,
        bool hasAccess,
        string memory accessType,
        uint256 accessFrom,
        uint256 accessTo
    ) public onlyParentContract {
        PolicyData memory policy = PolicyData({
            hasAccess: hasAccess,
            accessType: accessType,
            accessFrom: accessFrom,
            accessTo: accessTo
        });

        userPolicies[userAddress] = policy;
    }

    function getPolicy(address userAddress) public view returns (PolicyData memory) {
        return userPolicies[userAddress];
    }

    function validateAccess(address userAddress) public view returns (bool) {
        PolicyData memory policy = userPolicies[userAddress];

        // Validate the policy based on specific conditions
        // Here, you would implement your access validation logic

        // For simplicity, always grant access if hasAccess is true
        return policy.hasAccess;
    }
}
