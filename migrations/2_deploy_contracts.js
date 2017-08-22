const MultiSigWallet = artifacts.require("MultiSigWallet");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const REAL = artifacts.require("REAL");
const REALCrowdsale = artifacts.require("REALCrowdsale");
const ContributionWallet = artifacts.require("ContributionWallet");
const DevTokensHolder = artifacts.require("DevTokensHolder");
const REALPlaceHolder = artifacts.require("REALPlaceHolder");


// All of these constants need to be configured before deploy
const addressOwner = "0x004B8b840DE404B607d6548b98c711Ac818D750e";
const addressesReal = [
    "0x006198045873CFfaf4a4b31D0044592aEAA0f0de"
];
const multisigRealReqs = 1;
const addressesCommunity = [
    "0x004B8b840DE404B607d6548b98c711Ac818D750e",
];
const multisigCommunityReqs = 1;
const addressesReserve = [
    "0x004B8b840DE404B607d6548b98c711Ac818D750e",
];
const multisigReserveReqs = 1;
const addressesDevs = [
    "0x004B8b840DE404B607d6548b98c711Ac818D750e",
];
const multisigDevsReqs = 1;
const addressesBounties = [
    "0x004B8b840DE404B607d6548b98c711Ac818D750e",
];
const multisigBountiesReqs = 1;

const startBlock = 3800000;
const endBlock = 3900000;


module.exports = async function(deployer, network, accounts) {
    if (network === "development") return;  // Don't deploy on tests

    // MultiSigWallet send
    let multisigRealFuture = MultiSigWallet.new(addressesReal, multisigRealReqs);
    let multisigCommunityFuture = MultiSigWallet.new(addressesCommunity, multisigCommunityReqs);
    let multisigReserveFuture = MultiSigWallet.new(addressesReserve, multisigReserveReqs);
    let multisigDevsFuture = MultiSigWallet.new(addressesDevs, multisigDevsReqs);
    let multisigBountiesFuture = MultiSigWallet.new(addressesBounties, multisigBountiesReqs);
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
    let multisigBounties = await multisigBountiesFuture;
    console.log("MultiSigWallet Bounties: " + multisigBounties.address);
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
        devTokensHolder.address,
        multisigBounties.address);
    console.log("REAL Crowdsale initialized initialized!");
};
