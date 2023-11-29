// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract UserMetadata {

    address public owner;
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

    /**
     * @dev Only allows the contract owner to execute the function.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev Only allows registered and authorized users to execute the function.
     */
    modifier onlyAuthorizedUser() {
        require(userMetadata[msg.sender].isAuthorized, "User not registered or unauthorized");
        _;
    }

    /**
     * @dev Constructor to register a new user.
     * @param _organization The organization of the user.
     * @param _country The country of the user.
     */
    constructor(address userAddress ,string memory _organization, string memory _country) {
        owner = userAddress;
        UserData storage newUser = userMetadata[userAddress];
        newUser.organization = _organization;
        newUser.country = _country;
        newUser.isAuthorized = true;

        emit UserRegistered(userAddress, _organization, _country);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @dev Gets the metadata of the user.
     * @return organization The organization of the user.
     * @return country The country of the user.
     * @return isAuthorized Whether the user is authorized.
     */
    function getUserMetadata() public view onlyOwner
        returns (string memory organization, string memory country, bool isAuthorized) {
        UserData storage user = userMetadata[owner];
        organization = user.organization;
        country = user.country;
        isAuthorized = user.isAuthorized;
    }

    /**
     * @dev Gets the files of the user.
     * @param fileName The name of the file.
     * @return name The name of the file.
     * @return IpfsHash The IPFS hash of the file.
     */
    function getUserFiles(string memory fileName) public view onlyOwner
        returns (string memory name, string memory IpfsHash) {
        FileDetails storage file = userMetadata[msg.sender].files[fileName];
        name = file.name;
        IpfsHash = file.IpfsHash;
    }

    /**
     * @dev Gets the group information of the user.
     * @return allGroupInfos Array of GroupInfo structures.
     */
    function getUserGroupInfo() public view onlyOwner
        returns (GroupInfo[] memory) {

        UserData storage user = userMetadata[msg.sender];
        uint256 groupCount = user.groupNames.length;

        GroupInfo[] memory allGroupInfos = new GroupInfo[](groupCount);

        for (uint256 i = 0; i < groupCount; i++) {
            string memory groupName = user.groupNames[i];
            allGroupInfos[i] = user.groupInfos[groupName];
        }

        return allGroupInfos;
    }

    /**
     * @dev Uploads files for the user.
     * @param fileDetails Array of FileDetails structures.
     */
    function uploadFiles(FileDetails[] memory fileDetails) public onlyOwner {
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


    /**
     * @dev adds the group details of the user selected to be associated with the group contract.
     * @param groupName name of the group to be associated with the user.
     * @param groupContractAddress contract address of the group to be associated with the user.
     */
    function associateToGroup(string memory groupName, address groupContractAddress) public onlyAuthorizedUser {
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
