// SPDX-License-Identifier: MIT
const { expect } = require('chai');

const UserMetadata = artifacts.require('UserMetadata');
const UserMetadataFactory = artifacts.require('UserMetadataFactory');

contract('UserMetadataFactory', (accounts) => {
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const organization = 'TestOrg';
  const country = 'TestCountry';

  beforeEach(async () => {
    this.userMetadataFactory = await UserMetadataFactory.new();
  });

  it('should create a user contract', async () => {
    await this.userMetadataFactory.createUserContract(organization, country, { from: '0xDF0C69Cce3853e488081b7A663763Bd50a24d3e5' });

    const userContractAddress = await this.userMetadataFactory.getUserContractAddress({ from: '0xDF0C69Cce3853e488081b7A663763Bd50a24d3e5' });
    const userContract = await UserMetadata.at(userContractAddress);
    const ownerOfContract = await userContract.getOwner();
 // Check if this matches user1
    const userMetadata = await userContract.getUserMetadata({ from: ownerOfContract });
    expect(userMetadata.organization).to.equal(organization);
    expect(userMetadata.country).to.equal(country);
    expect(userMetadata.isAuthorized).to.equal(true);
  });

  it('should create unique user contracts for different users', async () => {
    await this.userMetadataFactory.createUserContract(organization, country, { from: user1 });
    await this.userMetadataFactory.createUserContract(organization, country, { from: user2 });

    const userContractAddress1 = await this.userMetadataFactory.getUserContractAddress({ from: user1 });
    const userContractAddress2 = await this.userMetadataFactory.getUserContractAddress({ from: user2 });

    expect(userContractAddress1).to.not.equal(userContractAddress2);
  });

  it('should not allow creating multiple user contracts for the same user', async () => {
    await this.userMetadataFactory.createUserContract(organization, country, { from: user1 });

    try {
      await this.userMetadataFactory.createUserContract(organization, country, { from: user1 });
      // If the above line doesn't throw an error, the test should fail
      expect.fail('Expected an error');
    } catch (error) {
      expect(error.message).to.include('User contract already exists');
    }
  });
});
