var MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
var REALtoken = artifacts.require("REAL");
var REALCrowdsale = artifacts.require("REALCrowdsaleMock");

var TeamTokensHolder = artifacts.require("TeamTokensHolderMock");
var MultiSigWallet = artifacts.require("MultiSigWallet")


module.exports = function(deployer) {
  const tokenController = "0x8a838b1722750ba185f189092833791adb98955f";

  const reserveWallet = "0x5f61a7da478e982bbd147201380c089e34543ab4";

  const multisig1 = "0x790d74d4a69a526b6c30401eca367dad499455dd";
  const multisig2 = "0x4522a965f4c12683a8ccaf2f43446a5e97c0364a";
  const multisig3 = "0x60971b70bef61aab41af496ed35e2e23ec8ff9ba";
  const multisigArray = [multisig1, multisig2, multisig3];

  // const startBlock = 1;
  // const endBlock = 50;
  const startBlock = 1451973;
  const endBlock = 1458973;

  deployer.deploy(MiniMeTokenFactory).then(function() {
    return MiniMeTokenFactory.deployed().then(function(tokenfactory) {
      console.log("minime deployed");
      return deployer.deploy(REALtoken, tokenfactory.address);
    }).then(function() {
      console.log("real deployed");
      return deployer.deploy(REALCrowdsale);
    }).then(function() {
      console.log("crowdsale deployed");
      return REALtoken.deployed().then(function(REALtokenInstance) {
        console.log("change controller");
        REALtokenInstance.changeController(REALCrowdsale.address);
        return deployer.deploy(TeamTokensHolder, tokenController, REALCrowdsale.address, REALtokenInstance.address).then(function() {
            console.log("tokensholder deployed");
            return TeamTokensHolder.deployed().then(function(teamTokensHolderInstance) {
              console.log("get tokensholder instance");
              return deployer.deploy(MultiSigWallet, multisigArray, 1).then(function() {
                console.log("multisig deployed");
                return MultiSigWallet.deployed().then(function(multisigWalletInstance) {
                  console.log("get multisig object");
                  return REALCrowdsale.deployed().then(function(REALCrowdsaleInstance) {
                    console.log("get crowdsale object");
                    return REALCrowdsaleInstance.initialize(REALtoken.address,tokenController,startBlock,endBlock,teamTokensHolderInstance.address,reserveWallet,multisigWalletInstance.address).then(function(){
                      console.log("crowdsale initialized");
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
