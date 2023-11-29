// SPDX-License-Identifier: MIT
const PolicyManager = artifacts.require("PolicyManager");
const GroupContract = artifacts.require("GroupContract");

contract("PolicyManager", (accounts) => {
  let policyManager;

  beforeEach(async () => {
    policyManager = await PolicyManager.new();
  });

  it("should create a group contract and get group contract addresses", async () => {
    const groupName = "TestGroup";
    const permissions = "Read";
    const organizations = ["Org1", "Org2"];
    const countries = ["Country1", "Country2"];

    // Create a group contract
    await policyManager.createGroupContract(groupName, permissions, organizations, countries);

    // Get group contract addresses for the account
    const groupContractAddresses = await policyManager.getGroupContractAddresses(accounts[0]);

    assert.equal(groupContractAddresses.length, 1, "Should have one group contract");

    const groupContract = await GroupContract.at(groupContractAddresses[0]);
    const groupDetails = await groupContract.getContractDetails();

    assert.equal(groupDetails.groupName, groupName);
    assert.equal(groupDetails.groupOwnerAddress, accounts[0]);
    assert.equal(groupDetails.permissions, permissions);
    assert.deepEqual(groupDetails.organizations, organizations);
    assert.deepEqual(groupDetails.countries, countries);
  });

  it("should get an empty array for a user without group contracts", async () => {
    // Get group contract addresses for an account with no created group contracts
    const groupContractAddresses = await policyManager.getGroupContractAddresses(accounts[1]);

    assert.equal(groupContractAddresses.length, 0, "Should have an empty array");
  });
});
