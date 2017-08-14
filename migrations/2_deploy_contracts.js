const randomBytes = require("random-bytes");

const MultiSigWallet = artifacts.require("MultiSigWallet");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const REAL = artifacts.require("REAL");
const REALCrowdsale = artifacts.require("RealCrowdsale");
const ContributionWallet = artifacts.require("ContributionWallet");
const DevTokensHolder = artifacts.require("DevTokensHolder");
const REALPlaceHolder = artifacts.require("REALPlaceHolder");


// All of these constants need to be configured before deploy
const addressOwner = "0x8a838b1722750ba185f189092833791adb98955f";
const addressesReal = [
    "0x5f61a7da478e982bbd147201380c089e34543ab4",
];
const multisigRealReqs = 1
const addressesCommunity = [
    "0x790d74d4a69a526b6c30401eca367dad499455dd",
];
const multisigCommunityReqs = 1
const addressesReserve = [
    "0x4522a965f4c12683a8ccaf2f43446a5e97c0364a",
];
const multisigReserveReqs = 1
const addressesDevs = [
    "0x60971b70bef61aab41af496ed35e2e23ec8ff9ba",
];
const multisigDevsReqs = 1

const startBlock = 3800000;
const endBlock = 3900000;


module.exports = async function(deployer, network, accounts) {
    if (network === "development") return;  // Don't deploy on tests

    // MultiSigWallet send
    let multisigRealFuture = MultiSigWallet.new(addressesReal, multisigRealReqs);
    let multisigCommunityFuture = MultiSigWallet.new(addressesCommunity, multisigCommunityReqs);
    let multisigReserveFuture = MultiSigWallet.new(addressesReserve, multisigReserveReqs);
    let multisigDevsFuture = MultiSigWallet.new(addressesDevs, multisigDevsReqs);
    // MiniMeTokenFactory send
    let miniMeTokenFactoryFuture = MiniMeTokenFactory.new();

    // MultiSigWallet wait
    let multisigReal = await multisigRealFuture;
    console.log("\nMultiSigWallet Real: " + multisigReal.address);
    let multisigCommunity = await multisigCommunityFuture;
    console.log("MultiSigWallet Community: " + multisigCommunity.address);
    let multisigReserve = await multisigReserveFuture;
    console.log("MultiSigWallet Reserve: " + multisigReserve.address);
    let multisigDevs = await multisigDevsFuture;
    console.log("MultiSigWallet Devs: " + multisigDevs.address);
    // MiniMeTokenFactory wait
    let miniMeTokenFactory = await miniMeTokenFactoryFuture;
    console.log("MiniMeTokenFactory: " + miniMeTokenFactory.address);
    console.log();

    // REAL send
    let realFuture = REAL.new(miniMeTokenFactory.address);
    // StatusContribution send
    let realCrowdsaleFuture = REALCrowdsale.new();

    // REAL wait
    let real = await realFuture;
    console.log("REAL: " + real.address);
    // StatusContribution wait
    let realCrowdsale = await realCrowdsaleFuture;
    console.log("REAL Crowdsale: " + realCrowdsale.address);
    console.log();

    // REAL initialize checkpoints for 0th TX gas savings
    await real.generateTokens('0x0', 1);
    await real.destroyTokens('0x0', 1);

    // REAL changeController send
    let realChangeControllerFuture = real.changeController(realCrowdsale.address);
    // ContributionWallet send
    let contributionWalletFuture = ContributionWallet.new(
        multisigReal.address,
        endBlock,
        realCrowdsale.address);
    // DevTokensHolder send
    let devTokensHolderFuture = DevTokensHolder.new(
        multisigDevs.address,
        realCrowdsale.address);

    // ContributionWallet wait
    let contributionWallet = await contributionWalletFuture;
    console.log("ContributionWallet: " + contributionWallet.address);
    // DevTokensHolder wait
    let devTokensHolder = await devTokensHolderFuture;
    console.log("DevTokensHolder: " + devTokensHolder.address);
    console.log();

    // REALPlaceHolder send
    let realPlaceHolderFuture = REALPlaceHolder.new(
        multisigCommunity.address,
        real.address,
        realCrowdsale.address);

    // SNTPlaceHolder wait
    let placeHolder = await realPlaceHolderFuture;
    console.log("REALPlaceHolder: " + placeHolder.address);
    console.log();

    // StatusContribution initialize send/wait
    await realCrowdsale.initialize(
        real.address,
        placeHolder.address,

        startBlock,
        endBlock,

        contributionWallet.address,

        multisigReserve.address,
        devTokensHolder.address);
    console.log("REAL Crowdsale initialized initialized!");
};
