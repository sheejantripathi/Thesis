var Migrations = artifacts.require("../contracts/PolicyManager.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
