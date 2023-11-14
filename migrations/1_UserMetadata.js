let migrations = artifacts.require("../contracts/UserMetadataFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(migrations);
};
