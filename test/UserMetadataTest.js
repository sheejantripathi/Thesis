// Import the smart contract artifacts (ABIs and deployed addresses)
const UserMetadata = artifacts.require('UserMetadata');

contract('UserMetadata', (accounts) => {
    let userMetadataInstance;

    before(async () => {
        // Deploy the smart contract before running tests
        userMetadataInstance = await UserMetadata.new();
    });

    it('should register a user and retrieve metadata', async () => {
        const organization = 'ExampleOrg';
        const country = 'ExampleCountry';

        // Register a user
        await userMetadataInstance.registerUser(organization, country, { from: accounts[0] });

        // Retrieve user metadata
        const userMetadata = await userMetadataInstance.getUserMetadata(accounts[0]);

        // Assert that the user was registered with the correct metadata
        assert.equal(userMetadata.organization, organization, 'Organization does not match');
        assert.equal(userMetadata.country, country, 'Country does not match');
        assert.equal(userMetadata.isAuthorized, true, 'User not authorized');
    });

    it('should not allow retrieving metadata for a non-registered user', async () => {
        // Try to retrieve metadata for a non-registered user
        try {
            await userMetadataInstance.getUserMetadata(accounts[1]);
            // If we reach this point, the function call should have thrown an error
            assert.fail('Expected an error but did not encounter one');
        } catch (error) {
            // Assert that the error message is as expected
            assert.include(error.message, 'User not registered', 'Incorrect error message');
        }
    });

    // Add more test cases as needed for updating or querying user metadata.
});
