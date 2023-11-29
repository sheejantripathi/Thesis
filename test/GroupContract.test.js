const GroupContract = artifacts.require("GroupContract");

contract("GroupContract", (accounts) => {
  let groupContract;

  const groupName = "TestGroup";
  const groupOwner = accounts[0];
  const permissions = "Read";
  const organizations = ["Org1", "Org2"];
  const countries = ["Country1", "Country2"];

  beforeEach(async () => {
    groupContract = await GroupContract.new(
      groupName,
      groupOwner,
      permissions,
      organizations,
      countries
    );
  });

  it("should set and get user access details", async () => {
    const userAddress = accounts[1];
    const accessFrom = Math.floor(Date.now() / 1000);
    const accessTo = accessFrom + 3600;

    // Set user access details by the group owner
    await groupContract.setUserAccess(userAddress, accessFrom, accessTo);

    // Get user access details
    const userAccessInfo = await groupContract.getUserAccessInfo(userAddress);

    assert.equal(userAccessInfo[0], accessFrom, "AccessFrom should match");
    assert.equal(userAccessInfo[1], accessTo, "AccessTo should match");
    assert.equal(userAccessInfo[2], true, "isAuthorized should be true");
  });

  it("should remove user access details", async () => {
    const userAddress = accounts[1];

    // Set user access details by the group owner
    await groupContract.setUserAccess(userAddress, 0, 0);

    // Remove user access details by the group owner
    await groupContract.removeUserAccess(userAddress);

    // Check if user access is removed
    const isUserAccessSet = await groupContract.isUserAccessSet(userAddress);
    assert.equal(isUserAccessSet, false, "User access should be removed");
  });

  it("should associate users to the group", async () => {
    const users = [
      {
        eoaAddress: accounts[1],
        accessFrom: 0,
        accessTo: 0,
      },
      {
        eoaAddress: accounts[2],
        accessFrom: 0,
        accessTo: 0,
      },
    ];

    // Associate users to the group by the group owner
    await groupContract.associateUsersToGroup(users);

    // Check if user access is set for each user
    for (const user of users) {
      const isUserAccessSet = await groupContract.isUserAccessSet(user.eoaAddress);
      assert.equal(isUserAccessSet, true, "User access should be set");
    }
  });

  it("should add and get file details", async () => {
    const fileDetails = [
      {
        IPFSHash: "QmTest1",
        name: "File1",
      },
      {
        IPFSHash: "QmTest2",
        name: "File2",
      },
    ];

    // Add files to the group
    await groupContract.addFilesToGroup(fileDetails);

    // Get added file details
    const addedFileDetails = await groupContract.getAddedFileDetails();

    assert.equal(addedFileDetails.length, 2, "Should have two added files");
    assert.equal(addedFileDetails[0].IPFSHash, fileDetails[0].IPFSHash, "IPFSHash should match");
    assert.equal(addedFileDetails[0].name, fileDetails[0].name, "Name should match");
    assert.equal(addedFileDetails[1].IPFSHash, fileDetails[1].IPFSHash, "IPFSHash should match");
    assert.equal(addedFileDetails[1].name, fileDetails[1].name, "Name should match");
  });

  it("should check if IPFS hash is shared", async () => {
    const ipfsHash = "QmTest";

    // Add IPFS hash to the group
    await groupContract.addFilesToGroup([{ IPFSHash: ipfsHash, name: "TestFile" }]);

    // Check if IPFS hash is shared
    const isIPFSHashShared = await groupContract.isIPFSHashShared(ipfsHash);
    assert.equal(isIPFSHashShared, true, "IPFS hash should be shared");
  });
});
