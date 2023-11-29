// SPDX-License-Identifier: MIT
const { expect } = require('chai');

const UserMetadata = artifacts.require('UserMetadata');

contract('UserMetadata', (accounts) => {
  const owner = accounts[0];
  const unauthorizedUser = accounts[1];
  const groupName = 'TestGroup';
  const groupContractAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(async () => {
    this.userMetadata = await UserMetadata.new('TestOrg', 'TestCountry', { from: owner });
  });

  it('should register a user and retrieve metadata', async () => {
    const metadata = await this.userMetadata.getUserMetadata({ from: owner });
    expect(metadata.organization).to.equal('TestOrg');
    expect(metadata.country).to.equal('TestCountry');
    expect(metadata.isAuthorized).to.equal(true);
  });

  it('should fail to retrieve metadata for unauthorized user', async () => {
    try {
      await this.userMetadata.getUserMetadata({ from: unauthorizedUser });
      // If the above line doesn't throw an error, the test should fail
      expect.fail('Expected an error');
    } catch (error) {
      expect(error.message).to.include('User not registered or unauthorized');
    }
  });

  it('should upload files for the user', async () => {
    const fileDetails = [
      {
        IpfsHash: 'TestHash',
        Timestamp: 'TestTimestamp',
        name: 'TestFile',
      },
    ];

    await this.userMetadata.uploadFiles(fileDetails, { from: owner });

    const uploadedFile = await this.userMetadata.getUserFiles('TestFile', { from: owner });
    expect(uploadedFile.name).to.equal('TestFile');
    expect(uploadedFile.IpfsHash).to.equal('TestHash');
  });

  it('should associate user to a group', async () => {
    await this.userMetadata.associateToGroup(groupName, groupContractAddress, { from: owner });

    const userGroupInfo = await this.userMetadata.getUserGroupInfo({ from: owner });
    expect(userGroupInfo.length).to.equal(1);
    expect(userGroupInfo[0].groupName).to.equal(groupName);
    expect(userGroupInfo[0].groupContractAddress).to.equal(groupContractAddress);
  });

  it('should fail to associate user to a group with empty group name', async () => {
    try {
      await this.userMetadata.associateToGroup('', groupContractAddress, { from: owner });
      // If the above line doesn't throw an error, the test should fail
      expect.fail('Expected an error');
    } catch (error) {
      expect(error.message).to.include('Group name cannot be empty');
    }
  });

  it('should fail to associate user to the same group twice', async () => {
    await this.userMetadata.associateToGroup(groupName, groupContractAddress, { from: owner });

    try {
      await this.userMetadata.associateToGroup(groupName, groupContractAddress, { from: owner });
      // If the above line doesn't throw an error, the test should fail
      expect.fail('Expected an error');
    } catch (error) {
      expect(error.message).to.include('User is already associated with this group');
    }
  });
});
