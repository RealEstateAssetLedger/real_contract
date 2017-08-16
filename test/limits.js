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
    const addressDevs = accounts[3];
    const addressREALHolder = accounts[4];
    const addressTest1 = accounts[5];
    const addressTest2 = accounts[6];
    const addressTest3 = accounts[7];
    const addressTest4 = accounts[8];

    let multisigReal;
    let multisigCommunity;
    let multisigReserve;
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

    it("Deploys all contracts", async function() { // PASS
        multisigReal = await MultiSigWallet.new([addressReal], 1);
        multisigCommunity = await MultiSigWallet.new([addressCommunity], 1);
        multisigReserve = await MultiSigWallet.new([addressReserve], 1);
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
            devTokensHolder.address);
    });

    it("Checks initial parameters", async function() {
        assert.equal(await real.controller(), realCrowdsale.address);
    });

    it("Checks that nobody can buy before the sale starts", async function() {
        await assertFail(async function() {
            await real.send(web3.toWei(1));
        });
    });

    it("Pauses and resumes the contribution ", async function() {
        await realCrowdsale.setMockedBlockNumber(1000000);
        await real.setMockedBlockNumber(1000000);
        await realCrowdsale.pauseContribution();
        await assertFail(async function() {
            await real.sendTransaction({value: web3.toWei(5), gas: 300000, gasPrice: "20000000000"});
        });
        await realCrowdsale.resumeContribution();
    });

    it("Checks limits", async function() {
      realCrowdsale.setMockedTotalCollected(0);
      await realCrowdsale.setMockedBlockNumber(1000000);
      await real.setMockedBlockNumber(1000000);

      await real.sendTransaction({value: web3.toWei(1), gas: 300000, from: addressTest1});
      var balanceTest1 = await real.balanceOf(addressTest1);
      assert.equal(web3.fromWei(balanceTest1).toNumber(), 220*1.25);

      realCrowdsale.setMockedTotalCollected(39950);
      await realCrowdsale.setMockedBlockNumber(1001000);
      await real.setMockedBlockNumber(1001000);

      await real.sendTransaction({value: web3.toWei(100), gas: 300000, from: addressTest1});
      balanceTest1 = await real.balanceOf(addressTest1);
      assert.equal(web3.fromWei(balanceTest1).toNumber(), 220*1.25+(50*220*1.25)+(50*220*1.15));

      realCrowdsale.setMockedTotalCollected(40300);
      await realCrowdsale.setMockedBlockNumber(1002000);
      await real.setMockedBlockNumber(1002000);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest2});
      const balanceTest2 = await real.balanceOf(addressTest2);
      assert.equal(web3.fromWei(balanceTest2).toNumber(), 10*220*1.15);

      realCrowdsale.setMockedTotalCollected(79950);
      await realCrowdsale.setMockedBlockNumber(1003000);
      await real.setMockedBlockNumber(1001300);

      await real.sendTransaction({value: web3.toWei(100), gas: 300000, from: addressTest2});
      balanceTest2 = await real.balanceOf(addressTest2);
      assert.equal(web3.fromWei(balanceTest2).toNumber(), 10*220*1.15+(50*220*1.15)+(50*220*1.10));

      realCrowdsale.setMockedTotalCollected(80300);
      await realCrowdsale.setMockedBlockNumber(1004000);
      await real.setMockedBlockNumber(1004000);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest3});
      const balanceTest3 = await real.balanceOf(addressTest3);
      assert.equal(web3.fromWei(balanceTest3).toNumber(), 10*220*1.10);

      realCrowdsale.setMockedTotalCollected(119950);
      await realCrowdsale.setMockedBlockNumber(1005000);
      await real.setMockedBlockNumber(1005000);

      await real.sendTransaction({value: web3.toWei(100), gas: 300000, from: addressTest3});
      balanceTest3 = await real.balanceOf(addressTest3);
      assert.equal(web3.fromWei(balanceTest3).toNumber(), 10*220*1.10+(50*220*1.10)+(50*220*1.05));

      realCrowdsale.setMockedTotalCollected(120300);
      await realCrowdsale.setMockedBlockNumber(1006000);
      await real.setMockedBlockNumber(1006000);

      await real.sendTransaction({value: web3.toWei(10), gas: 300000, from: addressTest4});
      const balanceTest4 = await real.balanceOf(addressTest4);
      assert.equal(web3.fromWei(balanceTest4).toNumber(), 10*220*1.05);

      realCrowdsale.setMockedTotalCollected(159950);
      await realCrowdsale.setMockedBlockNumber(1007000);
      await real.setMockedBlockNumber(1007000);

      await real.sendTransaction({value: web3.toWei(100), gas: 300000, from: addressTest4});
      balanceTest4 = await real.balanceOf(addressTest4);
      assert.equal(web3.fromWei(balanceTest4).toNumber(), 10*220*1.05+(50*220*1.05)+(50*220));

      realCrowdsale.setMockedTotalCollected(160300);
      await realCrowdsale.setMockedBlockNumber(1008000);
      await real.setMockedBlockNumber(1008000);

      await real.sendTransaction({value: web3.toWei(100), gas: 300000, from: addressTest4});
      balanceTest4 = await real.balanceOf(addressTest4);
      assert.equal(web3.fromWei(balanceTest4).toNumber(), 10*220*1.05+(50*220*1.05)+(150*220));
    });
});
