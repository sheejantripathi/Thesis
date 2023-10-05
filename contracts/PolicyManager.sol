// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./ChildContract.sol";

contract PolicyManager {

    address public owner;

    struct User {
        address userAddress;
        bool hasAccess;
        string access_type;
        string permissions;
        uint256 access_from;
        uint256 access_to;
    }

    mapping(address => uint) public users;
    User[] public userList;

    struct DataRequester {
        bool registered;
        bool hasAccess;
    }

    event success(string msg);

    event NewSmartContract(
        address indexed creator,
        address smartContractAddress,
        address indexed dataRequester,
        string permission,
        uint256 access_from,
        uint256 access_to
    );

    mapping(address => DataRequester) public dataRequesterList;

    constructor() {
        owner = msg.sender;
    }

    function registerUsers(
        string memory _permissions,
        uint256 _access_from,
        uint256 _access_to,
        string memory _accessType,
        bool _hasAccess,
        address _userAddress
    ) public {
        require(msg.sender == owner, "Only owner can register User");
        require(_userAddress != owner, "Owner cannot be a user");
        require(users[_userAddress] == 0, "Data Requester already registered");
        User memory user = User({
            userAddress: _userAddress,
            hasAccess: _hasAccess,
            permissions: _permissions,
            access_from: _access_from,
            access_to: _access_to,
            access_type: _accessType
        });

        if (userList.length == 0) {
            userList.push(); // not pushing any user at location zero
        }
        users[_userAddress] = userList.length;
        userList.push(user);
        emit success("Data Requester successfully registered and whitelisted");
    }

    // function spawnChildContract() public {
    //     require(msg.sender == owner, "Only owner can spawn child contract");

    //     ChildContract childContract = new ChildContract();

    //     // You can further interact with the child contract if needed

    //     emit NewSmartContract(msg.sender, address(childContract), address(0), "", 0, 0);
    // }

    //  function getChildContractPolicy(address childAddress, address userAddress) public view returns (ChildContract.PolicyData memory) {
    //     return ChildContract(childAddress).getPolicy(userAddress);
    // }

    // function validateChildContractAccess(address childAddress, address userAddress) public view returns (bool) {
    //     return ChildContract(childAddress).validateAccess(userAddress);
    // }
}
