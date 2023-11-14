// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract UserMetadata {

    struct FileDetails {
        string IpfsHash;
        string Timestamp;
        string name;
    }

    struct GroupInfo {
        string groupName;
        address groupContractAddress;
    }

    struct UserData {
        string organization;
        string country;
        bool isAuthorized;
        mapping(string => FileDetails) files;
        mapping(string => GroupInfo) groupInfos; // Mapping from groupName to GroupInfo
        string[] groupNames; // Array to store group names
    }

    mapping(address => UserData) private userMetadata;

    event UserRegistered(address indexed userAddress, string organization, string country);
    event FileUploaded(address indexed userAddress, string name, string IPFSHash);
    event UserAssociatedToGroup(address indexed userAddress, string groupName, address groupContractAddress);

    modifier onlyRegisteredUser(address userAddress) {
        require(
            msg.sender == userAddress, 
            "User not registered or unauthorized"
        );
        _;
    }

    constructor(address _userAddress, string memory _organization, string memory _country) {
        UserData storage newUser = userMetadata[_userAddress];
        newUser.organization = _organization;
        newUser.country = _country;
        newUser.isAuthorized = true;

        emit UserRegistered(_userAddress, _organization, _country);
        }


    function getUserMetadata(address userAddress) public view onlyRegisteredUser(userAddress)
        returns (string memory organization, string memory country, bool isAuthorized) {
        UserData storage user = userMetadata[userAddress];
        organization = user.organization;
        country = user.country;
        isAuthorized = user.isAuthorized;
    }

    function getUserFiles(address userAddress, string memory fileName) public view onlyRegisteredUser(userAddress)
        returns (string memory name, string memory IpfsHash) {
        FileDetails storage file = userMetadata[userAddress].files[fileName];
        name = file.name;
        IpfsHash = file.IpfsHash;
    }

   function getUserGroupInfo(address userAddress) public view onlyRegisteredUser(userAddress)
        returns (GroupInfo[] memory) {

        UserData storage user = userMetadata[userAddress];
        uint256 groupCount = user.groupNames.length;

        GroupInfo[] memory allGroupInfos = new GroupInfo[](groupCount);

        for (uint256 i = 0; i < groupCount; i++) {
            string memory groupName = user.groupNames[i];
            allGroupInfos[i] = user.groupInfos[groupName];
        }

        return allGroupInfos;
    }


    function uploadFiles(FileDetails[] memory fileDetails) public onlyRegisteredUser(msg.sender) {
    for (uint256 i = 0; i < fileDetails.length; i++) {
        string memory IpfsHash = fileDetails[i].IpfsHash;
        string memory Timestamp = fileDetails[i].Timestamp;
        string memory name = fileDetails[i].name;

        // Ensure unique file names

        userMetadata[msg.sender].files[name] = FileDetails({
            name: name,
            IpfsHash: IpfsHash,
            Timestamp: Timestamp
        });

        emit FileUploaded(msg.sender, name, IpfsHash);
    }
}

    function associateToGroup(string memory groupName, address groupContractAddress) public onlyRegisteredUser(msg.sender) {
        require(bytes(groupName).length > 0, "Group name cannot be empty");

        UserData storage user = userMetadata[msg.sender];

        // Check if the user is already associated with this group
        require(user.groupInfos[groupName].groupContractAddress == address(0), "User is already associated with this group");

        // Add group information to the mapping and array
        user.groupInfos[groupName] = GroupInfo({
            groupName: groupName,
            groupContractAddress: groupContractAddress
        });
        user.groupNames.push(groupName);

        emit UserAssociatedToGroup(msg.sender, groupName, groupContractAddress);
    }
}
