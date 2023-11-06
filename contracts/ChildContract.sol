// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract ChildContract {
    struct ContractDetails {
        string groupName;
        address groupOwnerAddress;
        string permissions;
        string[] organizations;
        string[] countries;
    }

    struct FileDetails {
        string id;
        string IPFSHash;
        string name;
    }

    struct UserAccess {
        address eoaAddress;
        uint accessFrom;
        uint accessTo;
        // Add more fields as needed
    }

    mapping(string => bool) sharedIPFSHashes;
    mapping(address => bool) userToContract;
    FileDetails[] public addedFileDetails;
    ContractDetails public contractDetails;

    mapping(address => UserAccess) public userToGroupAccess; // User to group access mapping

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

    function getChildContractDetails() public view returns (ContractDetails memory) {
         return contractDetails;
    }

    function setUserAccess(address eoaAddress, uint accessFrom, uint accessTo) public {
        userToGroupAccess[eoaAddress] = UserAccess(eoaAddress, accessFrom, accessTo);
    }
    
    function getUserAccess(address eoaAddress) public view returns (uint, uint) {
        return (
            userToGroupAccess[eoaAddress].accessFrom,
            userToGroupAccess[eoaAddress].accessTo
        );
    }

    function associateUsersToGroup(UserAccess[] calldata users) public {
        for (uint i = 0; i < users.length; i++) {
            setUserAccess(users[i].eoaAddress, users[i].accessFrom, users[i].accessTo);
        }
        emit Success("Users successfully added to the group");
    }

   // Function to check if user access is set
    function isUserAccessSet(address _userAddress) public view returns (bool) {
        return userToGroupAccess[_userAddress].eoaAddress == _userAddress;
    }

    function addFilesToGroup(FileDetails[] memory fileDetails) public {
        for (uint256 i = 0; i < fileDetails.length; i++) {
            FileDetails memory fDetail = fileDetails[i];
            string memory IPFSHash = fDetail.IPFSHash;
            require(bytes(IPFSHash).length > 0, "Invalid IPFS hash");
            require(!sharedIPFSHashes[IPFSHash], "IPFS hash already shared with this contract");
            sharedIPFSHashes[IPFSHash] = true;
            addedFileDetails.push(fDetail);
            emit Success("Transaction successful");
        }
    }

    function getAddedFileDetails() public view returns (FileDetails[] memory) {
        return addedFileDetails;
    }

    function isIPFSHashShared(string memory ipfsHash) public view returns (bool) {
        return sharedIPFSHashes[ipfsHash];
    }
}
