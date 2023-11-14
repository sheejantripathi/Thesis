// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract GroupContract {
    struct ContractDetails {
        string groupName;
        address groupOwnerAddress;
        string permissions;
        string[] organizations;
        string[] countries;
    }

    struct FileDetails {
        string IPFSHash;
        string name;
    }

    struct UserAccess {
        uint accessFrom;
        uint accessTo;
        bool isAuthorized;
    }

    struct UserInput {
        address eoaAddress;
        uint accessFrom;
        uint accessTo;
    }

    mapping(address => UserAccess) public userToGroupAccess; // User to group access mapping

    mapping(string => bool) sharedIPFSHashes;
    FileDetails[] public addedFileDetails;
    ContractDetails public contractDetails;


    event Success(string message);

    constructor(
        string memory _groupName,
        address _groupOwnerAddress,
        string memory _permissions,
        string[] memory _organizations,
        string[] memory _countries
    ) {
        contractDetails = ContractDetails({
            groupName: _groupName,
            groupOwnerAddress: _groupOwnerAddress,
            permissions: _permissions,
            organizations: _organizations,
            countries: _countries
        });
    }

    modifier onlyGroupOwner() {
        require(msg.sender == contractDetails.groupOwnerAddress, "Only group owner can call this function");
        _;
    }

    modifier onlyGroupMembers() {
        require(msg.sender == contractDetails.groupOwnerAddress, "Only group owner can call this function");
        _;
    }

    function getContractDetails() public view returns (ContractDetails memory) {
         return contractDetails;
    }

    function setUserAccess(address eoaAddress, uint accessFrom, uint accessTo) public onlyGroupOwner {
        userToGroupAccess[eoaAddress] = UserAccess(accessFrom, accessTo, true);
    }

    function removeUserAccess(address eoaAddress) public onlyGroupOwner {
        delete userToGroupAccess[eoaAddress];
    }
    
    function getUserAccessInfo(address _userAddress) public view returns (uint, uint, bool) {
        return (
            userToGroupAccess[_userAddress].accessFrom,
            userToGroupAccess[_userAddress].accessTo,
            userToGroupAccess[_userAddress].isAuthorized
        );
    }

    function associateUsersToGroup(UserInput[] memory users) public onlyGroupOwner{
        for (uint i = 0; i < users.length; i++) {
            setUserAccess(users[i].eoaAddress, users[i].accessFrom, users[i].accessTo);
        }
        emit Success("Users successfully added to the group");
    }

   // Function to check if user access is set
    function isUserAccessSet(address _userAddress) public view returns (bool) {
        return userToGroupAccess[_userAddress].isAuthorized == true;
    }

    function addFilesToGroup(FileDetails[] memory fileDetails) public {
        for (uint256 i = 0; i < fileDetails.length; i++) {
            FileDetails memory fDetail = fileDetails[i];
            string memory IPFSHash = fDetail.IPFSHash;
            // require(sharedIPFSHashes[IPFSHash], "IPFS hash already shared with this contract");
            sharedIPFSHashes[IPFSHash] = true;
            addedFileDetails.push(fDetail);
            emit Success("Files successfullly shared in the group");
        }
    }

    function getAddedFileDetails() public view returns (FileDetails[] memory) {
        return addedFileDetails;
    }

    function isIPFSHashShared(string memory ipfsHash) public view returns (bool) {
        return sharedIPFSHashes[ipfsHash];
    }
}
