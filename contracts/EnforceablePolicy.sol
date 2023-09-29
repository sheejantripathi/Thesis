// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract EnforceableSmartContract {
    address public owner;
    address public dataRequester;
    string public permission;
    uint256 public access_from;
    uint256 public access_to;
    string public location;
    bool accessGranted;

     struct AssetRequester{
        string name;
        address ethereumAddress;
        string designation;
        bool isRegistered;
        string permissions;
    }

    mapping(address=>AssetRequester) public assetrequesters;
    AssetRequester[] public RequesterList;

    constructor(address _dataRequester, string memory _permission, uint256 _accessfrom, uint256 _accessto) {
        dataRequester = _dataRequester;
        permission = _permission;
        access_from = _accessfrom;
        access_to = _accessto;
    }

   event UserRegistered(string name, address ethereumAddress, string designation, string permissions);
    event PermissionsUpdated(address indexed ethereumAddress, string permissions);

    function registerUser(string memory _name, address _ethereumAddress, string memory _designation, string memory _permissions) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_ethereumAddress != address(0), "Invalid Ethereum address");
        require(bytes(_designation).length > 0, "Designation cannot be empty");

        assetrequesters[_ethereumAddress] = AssetRequester(_name, _ethereumAddress, _designation, true, _permissions);
        emit UserRegistered(_name, _ethereumAddress, _designation, _permissions);
    }

    function isRegisteredUser(address _ethereumAddress) public view returns (bool) {
        return assetrequesters[_ethereumAddress].isRegistered;
    }

    function getPermissions(address _ethereumAddress) public view returns (string memory) {
        return assetrequesters[_ethereumAddress].permissions;
    }

    function updatePermissions(string memory _permissions) public {
        require(assetrequesters[msg.sender].isRegistered, "User is not registered");
        assetrequesters[msg.sender].permissions = _permissions;
        emit PermissionsUpdated(msg.sender, _permissions);
    }

    // function whitelistUsers() private {

    // }

    function enforcePermission() public view returns (bool) {
        uint256 currentTime = block.timestamp;
        return (currentTime >= access_from && currentTime <= access_to);
    }
}
