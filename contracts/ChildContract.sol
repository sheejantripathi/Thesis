// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract ChildContract {

    string public userAttribute;
    address public dataOwnerAddress;
    string public permissions;
    uint256 public accessFrom;
    uint256 public accessTo;

    struct FileDetails {
        string IPFSHash;
        string name;
    }

    // Mapping to store user EOA addresses to this child contract address
    mapping(address => bool) public userToContract;
    // Mapping to store IPFS hashes of the files shared with this contract
    mapping(string => bool) public sharedIPFSHashes;
    // Define the storage array to store FileDetails objects
    FileDetails[] public addedFileDetails;

    event success (string reason);



    constructor(
        string memory _userAttribute,
        address _dataOwnerAddress,
        string memory _permissions,
        uint256 _accessFrom,
        uint256 _accessTo
    ) {
        userAttribute = _userAttribute;
        dataOwnerAddress = _dataOwnerAddress;
        permissions = _permissions;
        accessFrom = _accessFrom;
        accessTo = _accessTo;
    }

    function getContractDetails() public view returns (
        string memory,
        address,
        string memory,
        uint256,
        uint256
    ) {
        return (
            userAttribute,
            dataOwnerAddress,
            permissions,
            accessFrom,
            accessTo
        );
    }

    // Function to associate a specific EOA address with this contract
   

   function associateUsersToGroup(address[] memory userAddresses) public {
    for (uint256 i = 0; i < userAddresses.length; i++) {
        address userAddress = userAddresses[i];
        require(userAddress != address(0), "Invalid user address");
        userToContract[userAddress] = true;
        emit success("Transaction successful");
    }
   }

    function isUserAssociated(address userAddress) public view returns (bool) {
        return userToContract[userAddress];
    }

    function addFilesToGroup(FileDetails[] memory fileDetails) public {
        for (uint256 i = 0; i < fileDetails.length; i++) {
            FileDetails memory fDetail = fileDetails[i];
            string memory IPFSHash = fDetail.IPFSHash;
            require(bytes(IPFSHash).length > 0, "Invalid IPFS hash");
            require(!sharedIPFSHashes[IPFSHash], "IPFS hash already shared with this contract");
            sharedIPFSHashes[IPFSHash] = true;
            addedFileDetails.push(fDetail);
            emit success("Transaction successful");
        }
    }

    // Function to get all IPFS hashes within this contract
    function getAddedFileDetails() public view returns (FileDetails[] memory) {
        return addedFileDetails;
    }

    // Function to check if an IPFS hash is shared
    function isIPFSHashShared(string memory ipfsHash) public view returns (bool) {
        return sharedIPFSHashes[ipfsHash];
    }
}
