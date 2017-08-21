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

    const addressGuaranteed0 = accounts[7];
    const addressGuaranteed1 = accounts[8];

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

    it("Deploys all contracts", async function() { // PASS
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

    it("Checks initial parameters", async function() {
        assert.equal(await real.controller(), realCrowdsale.address);
    });

    it("Checks that nobody can buy before the sale starts", async function() {
        await assertFail(async function() {
            await real.send(web3.toWei(1));
        });
    });

    it("Adds 2 guaranteed addresses ", async function() {
        await realCrowdsale.setGuaranteedAddress(addressGuaranteed0, web3.toWei(1));
        await realCrowdsale.setGuaranteedAddress(addressGuaranteed1, web3.toWei(2));

        const permited7 = await realCrowdsale.guaranteedBuyersLimit(addressGuaranteed0);
        const permited8 = await realCrowdsale.guaranteedBuyersLimit(addressGuaranteed1);

        assert.equal(web3.fromWei(permited7).toNumber(), 1);
        assert.equal(web3.fromWei(permited8).toNumber(), 2);
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

    it("Returns the remaining of the last transaction ", async function() {
        const initialBalance = await web3.eth.getBalance(addressReal);
        await real.sendTransaction({value: web3.toWei(5), gas: 300000, gasPrice: "20000000000"});
        const finalBalance = await web3.eth.getBalance(addressReal);

        const b = 5;
        cur += b;

        const spent = web3.fromWei(initialBalance.sub(finalBalance)).toNumber();
        assert.isAbove(spent, b);
        assert.isBelow(spent, b + 0.02);

        const totalCollected = await realCrowdsale.totalCollected();
        assert.equal(web3.fromWei(totalCollected), cur);

        const balanceContributionWallet = await web3.eth.getBalance(contributionWallet.address);
        assert.equal(web3.fromWei(balanceContributionWallet), cur);
    });


    it("Doesn't allow transfers during contribution period", async function() {
        await assertFail(async function() {
            await real.transfer(addressSGTHolder, web3.toWei(1000));
        });
    });

    it("Checks that Guaranteed addresses are able to buy", async function() {
        await real.sendTransaction({value: web3.toWei(3), gas: 300000, from: addressGuaranteed0});
        await real.sendTransaction({value: web3.toWei(3), gas: 300000, from: addressGuaranteed1});

        const balance7 = await real.balanceOf(addressGuaranteed0);
        const balance8 = await real.balanceOf(addressGuaranteed1);

        assert.equal(web3.fromWei(balance7).toNumber(), (220 * 1.25));
        assert.equal(web3.fromWei(balance8).toNumber(), (440 * 1.25));
    });

    it("Finalizes", async function() {
        await realCrowdsale.setMockedBlockNumber(endBlock + 1);
        await realCrowdsale.finalize();

        const totalSupply = await real.totalSupply();
                                                              //Hard cap
        assert.isBelow(web3.fromWei(totalSupply).toNumber() - (400000 / 0.51), 0.01);

        const balanceDevs = await real.balanceOf(devTokensHolder.address);
        assert.equal(balanceDevs.toNumber(), totalSupply.mul(0.20).toNumber());

        const balanceSecondary = await real.balanceOf(multisigReserve.address);
        assert.equal(balanceSecondary.toNumber(), totalSupply.mul(0.15).toNumber());

        const balanceThird = await real.balanceOf(multisigBounties.address);
        assert.equal(balanceThird.toNumber(), totalSupply.mul(0.14).toNumber());
    });

    it("Moves the Ether to the final multisig", async function() {
      const prevBalanceContribution = await web3.eth.getBalance(contributionWallet.address);

        await multisigReal.submitTransaction(
            contributionWallet.address,
            0,
            contributionWallet.contract.withdraw.getData());

        const balanceContribution = await web3.eth.getBalance(contributionWallet.address);
        const balanceMultisig = await web3.eth.getBalance(multisigReal.address);

        assert.isBelow(Math.abs(web3.fromWei(balanceContribution).toNumber()), 0.00001);
        assert.equal(Math.abs(web3.fromWei(balanceMultisig).toNumber()), Math.abs(web3.fromWei(prevBalanceContribution).toNumber()));
    });

    it("Doesn't allow transfers in the 1 week period", async function() {
        await assertFail(async function() {
            await real.transfer(addressREALHolder, web3.toWei(1000));
        });
    });

    /*it("Allows transfers after 1 week period", async function() {
         const t = Math.floor(new Date().getTime() / 1000) + (86400 * 7) + 1000;
         await realPlaceHolder.setMockedTime(t);

         await real.transfer(accounts[5], web3.toWei(250));

         const balance2 = await real.balanceOf(accounts[5]);

         assert.equal(web3.fromWei(balance2).toNumber(), 250);
     });*/

    it("Disallows devs from transfering before 6 months have past", async function() {
        const t = Math.floor(new Date().getTime() / 1000) + (86400 * 7) + 1000;
        await devTokensHolder.setMockedTime(t);

        // This function will fail in the multisig
        await multisigDevs.submitTransaction(
            devTokensHolder.address,
            0,
            devTokensHolder.contract.collectTokens.getData(),
            {from: addressDevs, gas: 1000000});

        const balance = await real.balanceOf(multisigDevs.address);
        assert.equal(balance,0);
    });

    /*it("Allows devs to extract after 6 months", async function() {
      const t = (await realCrowdsale.finalizedTime()).toNumber() + (86400 * 185);
      await devTokensHolder.setMockedTime(t);

      const totalSupply = await real.totalSupply();

      await multisigDevs.submitTransaction(
          devTokensHolder.address,
          0,
          devTokensHolder.contract.collectTokens.getData(),
          {from: addressDevs});

      const balance = await real.balanceOf(multisigDevs.address);

      const calcTokens = web3.fromWei(totalSupply.mul(0.20).mul(0.5)).toNumber();
      const realTokens = web3.fromWei(balance).toNumber();

      assert.equal(realTokens, calcTokens);
    });

    it("Allows devs to extract everything after 24 months", async function() {
      const t = Math.floor(new Date().getTime() / 1000) + (86400 * 360 * 2);
      await devTokensHolder.setMockedTime(t);

      const totalSupply = await real.totalSupply();

      await multisigDevs.submitTransaction(
          devTokensHolder.address,
          0,
          devTokensHolder.contract.collectTokens.getData(),
          {from: addressDevs});

      const balance = await real.balanceOf(multisigDevs.address);

      const calcTokens = web3.fromWei(totalSupply.mul(0.20)).toNumber();
      const realTokens = web3.fromWei(balance).toNumber();

      assert.equal(calcTokens, realTokens);
    });*/

    it("Checks that REAL's Controller is upgradeable", async function() {
        await multisigCommunity.submitTransaction(
            realPlaceHolder.address,
            0,
            realPlaceHolder.contract.changeController.getData(accounts[6]),
            {from: addressCommunity});

        const controller = await real.controller();

        assert.equal(controller, accounts[6]);
    });
});
