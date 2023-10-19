// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./ChildContract.sol";


contract PolicyManager {

    address public owner;
    // mapping(address => address) public userToChildContract;
    mapping(string => mapping(string => mapping(string => bool))) private attributeToAssetToContractExists;
    ChildContract[] policies;

    // Array to store metadata about the deployed contracts
    struct ContractMetadata {
        address contractAddress;
        string assetName;
    }
  
    ContractMetadata[] public deployedContracts;

    event ChildContractCreated(string indexed attribute, address childContract);

    constructor() {
        owner = msg.sender;
    }

    event success(string msg);

    function createChildContract(
        string memory _userAttribute,
        address _dataOwnerAddress,
        string memory _permissions,
        uint256 _accessFrom,
        uint256 _accessTo,
        string memory _assetCID,
        string memory _assetName
    ) external {

        // Log additional information about the parameters
    // emit LogParameters(_userAddress, _dataOwnerAddress, _permissions, _accessFrom, _accessTo, _assetCID);

        require(_dataOwnerAddress != address(0), "Invalid data owner address");
        require(_dataOwnerAddress == owner, "Only owner can invoke the child contract creation");
        require(_accessFrom < _accessTo, "Invalid access time, accessFrom should be less than accessTo");
        // Check if a child contract already exists for this user and permissions
        require(!attributeToAssetToContractExists[_userAttribute][_permissions][_assetCID], "Policy Contract already exists for this attribute, specific to this asset");
        
        ChildContract childContract = new ChildContract(_userAttribute,
            _dataOwnerAddress,
            _permissions,
            _accessFrom,
            _accessTo,
            _assetCID,
            _assetName);

        policies.push(childContract);

        // Add metadata about the deployed contract
        //  deployedContracts.push(ContractMetadata({
        //     contractAddress: address(childContract),
        //     assetName: _assetName
        // }));

        // console.log("Child contract address: %s", address(childContract));
        // attributeToAssetToContractExists[_userAttribute][_permissions][_assetCID] = true;

        emit ChildContractCreated(_userAttribute, address(childContract));
        emit success('User Policy Definitions registered successfully!!');
        // return address(childContract);
    }

    // function validateAccess(string memory _userAttribute) public view returns (bool) {
    //     require(_userAddress != address(0), "Invalid user address");

    //     address childContractAddress = attributeToAssetToContractExists[_userAttribute];
    //     require(childContractAddress != address(0), "Child contract not found");

    //     return ChildContract(childContractAddress).validateAccess();
    // }

    function getPolicyCount(address _userAddress) public {
        require(_userAddress != address(0), "Invalid user address");
        emit success("Policy count, address found");
    }

    function getDeployedContractsCount() public view returns (uint256) {
        return deployedContracts.length;
    }

    function getContractMetadata(uint256 index) public view returns (address, string memory) {
        require(index < deployedContracts.length, "Invalid index");
        ContractMetadata memory metadata = deployedContracts[index];
        return (metadata.contractAddress, metadata.assetName);
    }

    // New function to retrieve metadata about deployed contracts
    // function getContractMetadata(uint256 index) public view returns (address, string memory) {
    //     require(index < deployedContracts.length, "Invalid index");
    //     return (deployedContracts[index].childContract, deployedContracts[index].assetName);
    // }
}


