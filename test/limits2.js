// Simulate a full contribution

const MultiSigWallet = artifacts.require("MultiSigWallet");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const REAL = artifacts.require("REALMock");
const RealCrowdsaleClass = artifacts.require("REALCrowdsaleMock");
const ContributionWallet = artifacts.require("ContributionWallet");
const DevTokensHolder = artifacts.require("DevTokensHolderMock");
const REALPlaceHolderClass = artifacts.require("REALPlaceHolderMock");

const assertFail = require("./helpers/assertFail");

contract("REALCrowdsale", function(accounts) {
    const addressReal = accounts[0];
    const addressCommunity = accounts[1];
    const addressReserve = accounts[2];
    const addressBounties = accounts[9];
    const addressDevs = accounts[3];
    const addressREALHolder = accounts[4];
    const addressTest1 = accounts[5];
    const addressTest2 = accounts[6];
    const addressTest3 = accounts[7];
    const addressTest4 = accounts[8];
    const addressTestDummy = accounts[10];
    const addressTestDummy2 = accounts[11];

    let multisigReal;
    let multisigCommunity;
    let multisigReserve;
    let multisigBounties;
    let multisigDevs;
    let miniMeTokenFactory;
    let real;
    let realCrowdsale;
    let contributionWallet;
    let devTokensHolder;
    let realPlaceHolder;

    var cur = 0;

    const startBlock = 1000000;
    const endBlock = 1040000;

    it("Deploys all contracts again", async function() {
        multisigReal = await MultiSigWallet.new([addressReal], 1);
        multisigCommunity = await MultiSigWallet.new([addressCommunity], 1);
        multisigReserve = await MultiSigWallet.new([addressReserve], 1);
        multisigBounties = await MultiSigWallet.new([addressBounties], 1);
        multisigDevs = await MultiSigWallet.new([addressDevs], 1);

        miniMeTokenFactory = await MiniMeTokenFactory.new();

        real = await REAL.new(miniMeTokenFactory.address);

        realCrowdsale = await RealCrowdsaleClass.new();

        contributionWallet = await ContributionWallet.new(
            multisigReal.address,
            endBlock,
            realCrowdsale.address);
        devTokensHolder = await DevTokensHolder.new(
            multisigDevs.address,
            realCrowdsale.address,
            real.address);

        realPlaceHolder = await REALPlaceHolderClass.new(
            multisigCommunity.address,
            real.address,
            realCrowdsale.address);

        await real.changeController(realCrowdsale.address);

        await realCrowdsale.initialize(
            real.address,
            realPlaceHolder.address,

            startBlock,
            endBlock,

            contributionWallet.address,

            multisigReserve.address,
            devTokensHolder.address,
            multisigBounties.address);
    });

    it("Adds 2 guaranteed addresses again", async function() {
        await realCrowdsale.setGuaranteedAddress(addressTest1, web3.toWei(10));
        await realCrowdsale.setGuaranteedAddress(addressTest2, web3.toWei(10));

        const permited1 = await realCrowdsale.guaranteedBuyersLimit(addressTest1);
        const permited2 = await realCrowdsale.guaranteedBuyersLimit(addressTest2);

        assert.equal(web3.fromWei(permited1).toNumber(), 10);
        assert.equal(web3.fromWei(permited2).toNumber(), 10);
    });

    it("Checks limits again", async function() {
      var currentTotalCollected = 0;

      await realCrowdsale.setMockedBlockNumber(1000000);
      await real.setMockedBlockNumber(1000000);

      await real.sendTransaction({value: web3.toWei(1), gas: 300000, from: addressTest1});
      var balanceTest1 = await real.balanceOf(addressTest1);
      assert.equal(web3.fromWei(balanceTest1).toNumber(), 220*1.25);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest2});
      var balanceTest2 = await real.balanceOf(addressTest2);
      assert.equal(web3.fromWei(balanceTest2).toNumber(), 10*220*1.25);
      currentTotalCollected = await realCrowdsale.totalCollected();
      // console.log(web3.fromWei(currentTotalCollected).toNumber());
      assert.equal(web3.fromWei(currentTotalCollected).toNumber(), 11);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest3});
      var balanceTest3 = await real.balanceOf(addressTest3);
      assert.equal(web3.fromWei(balanceTest3).toNumber(), 10*220*1.25);
      currentTotalCollected = await realCrowdsale.totalCollected();
      // console.log(web3.fromWei(currentTotalCollected).toNumber());
      assert.equal(web3.fromWei(currentTotalCollected).toNumber(), 21);

      await realCrowdsale.setMockedBlockNumber(1001000);
      await real.setMockedBlockNumber(1001000);

      await real.sendTransaction({value: web3.toWei(25000), gas: 300000, from: addressTestDummy});
      currentTotalCollected = await realCrowdsale.totalCollected();
      // console.log(web3.fromWei(currentTotalCollected).toNumber());
      assert.equal(web3.fromWei(currentTotalCollected).toNumber(), 25021);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest1});
      currentTotalCollected = await realCrowdsale.totalCollected();
      // console.log(web3.fromWei(currentTotalCollected).toNumber());
      assert.equal(web3.fromWei(currentTotalCollected).toNumber(), 25030);
      balanceTest1 = await real.balanceOf(addressTest1);
      assert.equal(web3.fromWei(balanceTest1).toNumber(), (10*220*1.25));


      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest2});
      var balanceTest2 = await real.balanceOf(addressTest2);
      assert.equal(web3.fromWei(balanceTest2).toNumber(), (10*220*1.25)+(10*220*1.20));
      currentTotalCollected = await realCrowdsale.totalCollected();
      // console.log(web3.fromWei(currentTotalCollected).toNumber());
      assert.equal(web3.fromWei(currentTotalCollected).toNumber(), 25040);
    });
});
