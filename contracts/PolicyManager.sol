// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./ChildContract.sol";
import "./FileContract.sol";

contract PolicyManager {
    address public owner;
    mapping(string => mapping(string => bool)) private groupToContractExists;
    ChildContract[] policies;
    ContractMetadata[] public deployedContracts;

    // ChildContract reference and other essential variables.
    // mapping(address => mapping(string => ChildContract)) public policies;

    struct ContractMetadata {
        address contractAddress;
    }

    event ChildContractCreated(string indexed group, address childContract);
    event Success(string message);

    //code to generate a new File contract
    event FileContractCreated(address indexed fileContractAddress, address indexed owner);

    function createFileContract(string memory _fileName, string memory _ipfsHash) public {
        FileContract newFileContract = new FileContract(_fileName, _ipfsHash, msg.sender);
        emit FileContractCreated(address(newFileContract), msg.sender);
    }

    //code to generate a new group contract

    function createChildContract(
        string memory _groupName,
        address _groupOwnerAddress,
        string memory _permissions,
        string[] memory _organizations,
        string[] memory _countries
    ) external {
        require(_groupOwnerAddress != address(0), "Invalid data owner address");
        require(!groupToContractExists[_groupName][_permissions], "Policy Contract already exists for this group, specific to this asset");

        ChildContract childContract = new ChildContract(
            _groupName,
            _groupOwnerAddress,
            _permissions,
            _organizations,
            _countries
        );

        policies.push(childContract);

        emit ChildContractCreated(_groupName, address(childContract));
        emit Success("User Policy Definitions registered successfully!!");
    }

    function getDeployedContractAddresses() public view returns (ChildContract[] memory) {
        // emit Debug("Inside getChildContractDetails"); // Add this line for debugging
        return policies;
    }

    function getChildContractAddresses() public view returns (address[] memory) {
        address[] memory childContractAddresses = new address[](policies.length);
        for (uint256 i = 0; i < policies.length; i++) {
            childContractAddresses[i] = address(policies[i]);
        }
        return childContractAddresses;
    }
     

    function getDeployedContractsCount() public view returns (uint256) {
        return deployedContracts.length;
    }

    function getContractMetadata(uint256 index) public view returns (address) {
        require(index < deployedContracts.length, "Invalid index");
        return deployedContracts[index].contractAddress;
    }
}
