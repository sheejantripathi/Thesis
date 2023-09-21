// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract EnforceableSmartContract {
    address public owner;
    // address public dataRequester;
    string public permission;
    uint256 public startTime;
    uint256 public endTime;
    string public location;
    bool accessGranted;

     struct AssetRequester{
        string name;
        uint designation;
        bool registered;
        string permission;
    }

    mapping(address=>AssetRequester) public assetrequesters;
    AssetRequester[] public RequesterList;

    constructor(address _dataRequester, string memory _permission, uint256 _startTime, uint256 _endTime) {
        dataRequester = _dataRequester;
        permission = _permission;
        startTime = _startTime;
        endTime = _endTime;
    }

    function registerUsers(string memory _name, string _designation,address _requesterAddress) public view {
        
    }

    function whitelistUsers() private {

    }

    function enforcePermission() public view returns (bool) {
        uint256 currentTime = block.timestamp;
        return (currentTime >= startTime && currentTime <= endTime);
    }
}
