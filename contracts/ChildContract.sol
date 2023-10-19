// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract ChildContract {

    string public userAttribute;
    address public dataOwnerAddress;
    string public permissions;
    uint256 public accessFrom;
    uint256 public accessTo;
    string public assetCID;
    string public assetName;

    // Mapping to store user EOA addresses to this child contract address
    mapping(address => bool) public userToContract;
    event success (string reason);

    constructor(
        string memory _userAttribute,
        address _dataOwnerAddress,
        string memory _permissions,
        uint256 _accessFrom,
        uint256 _accessTo,
        string memory _assetCID,
        string memory _assetName
    ) {
        userAttribute = _userAttribute;
        dataOwnerAddress = _dataOwnerAddress;
        permissions = _permissions;
        accessFrom = _accessFrom;
        accessTo = _accessTo;
        assetCID = _assetCID;
        assetName = _assetName;
    }

    function getContractDetails() public view returns (
        string memory,
        address,
        string memory,
        uint256,
        uint256,
        string memory,
        string memory
    ) {
        return (
            userAttribute,
            dataOwnerAddress,
            permissions,
            accessFrom,
            accessTo,
            assetCID,
            assetName
        );
    }

    // Function to associate a specific EOA address with this contract
   

    function associateUserToContract(address userAddress) public {
        require(userAddress != address(0), "Invalid user address");
        userToContract[userAddress] = true;
        emit success("Transaction successful");
    }

    function isUserAssociated(address userAddress) public view returns (bool) {
        return userToContract[userAddress];
    }
}
