const MultiSigWallet = artifacts.require("MultiSigWallet");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
const REAL = artifacts.require("REAL");
const REALCrowdsale = artifacts.require("REALCrowdsale");
const ContributionWallet = artifacts.require("ContributionWallet");
const DevTokensHolder = artifacts.require("DevTokensHolder");
const REALPlaceHolder = artifacts.require("REALPlaceHolder");
const ReserveTokensHolder = artifacts.require("ReserveTokensHolder");


// All of these constants need to be configured before deploy
const addressBitcoinSuisse = "0x004B8b840DE404B607d6548b98c711Ac818D750e";
const addressMainOwner = "0x0581E7aF436e9380a8B772885A66Bd84F790939D";

const addressesReserve = [
    "0x2d1436D2Fe181212528c150E96df1c15f0e898d3",
    addressMainOwner,
    "0x57a491D445D51C351E9435289dEc6D2d850aA952",
    "0x912EEcc593B9D53d566e741744cc8DfCf5370844",
];
const multisigReserveReqs = 2;

const addressesDevs = [
    "0x2d1436D2Fe181212528c150E96df1c15f0e898d3",
    addressMainOwner,
    "0x57a491D445D51C351E9435289dEc6D2d850aA952",
    "0x912EEcc593B9D53d566e741744cc8DfCf5370844",
];
const multisigDevsReqs = 2;

const addressesBounties = [
    "0x2d1436D2Fe181212528c150E96df1c15f0e898d3",
    addressMainOwner,
    "0x57a491D445D51C351E9435289dEc6D2d850aA952",
    "0x912EEcc593B9D53d566e741744cc8DfCf5370844",
];
const multisigBountiesReqs = 2;

const startBlock = 1567500;
const endBlock = 1568000;


module.exports = async function(deployer, network, accounts) {
    // if (network === "development") return;  // Don't deploy on tests

    // MultiSigWallet send
    let multisigReserveFuture = MultiSigWallet.new(addressesReserve, multisigReserveReqs);
    let multisigDevsFuture = MultiSigWallet.new(addressesDevs, multisigDevsReqs);
    let multisigBountiesFuture = MultiSigWallet.new(addressesBounties, multisigBountiesReqs);
    // MiniMeTokenFactory send
    let miniMeTokenFactoryFuture = MiniMeTokenFactory.new();

    // MultiSigWallet wait
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
        addressBitcoinSuisse,
        endBlock,
        realCrowdsale.address);
    // DevTokensHolder send
    let devTokensHolderFuture = DevTokensHolder.new(
        multisigDevs.address,
        realCrowdsale.address);

    // ReserveTokensHolder send
    let reserveTokensHolderFuture = ReserveTokensHolder.new(
        multisigReserve.address,
        realCrowdsale.address);

    // ContributionWallet wait
    let contributionWallet = await contributionWalletFuture;
    console.log("ContributionWallet: " + contributionWallet.address);
    // DevTokensHolder wait
    let devTokensHolder = await devTokensHolderFuture;
    console.log("DevTokensHolder: " + devTokensHolder.address);
    console.log();

    let reserveTokensHolder = await reserveTokensHolderFuture;
    console.log("ReserveTokensHolder: " + reserveTokensHolder.address);
    console.log();

    // REALPlaceHolder send
    let realPlaceHolderFuture = REALPlaceHolder.new(
        addressMainOwner,
        real.address,
        realCrowdsale.address);

    // REALPlaceHolder wait
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

        reserveTokensHolder.address,
        devTokensHolder.address,
        multisigBounties.address);
    console.log("REAL Crowdsale initialized initialized!");
};
