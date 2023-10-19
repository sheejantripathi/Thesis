let migrations = artifacts.require("../contracts/PolicyManager.sol");

module.exports = function(deployer) {
  deployer.deploy(migrations);
};
