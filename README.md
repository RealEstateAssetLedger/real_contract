# REAL Token

<img src="resources/real.jpg"/>

Important resources:
- If integrating REAL in an exchange or automated system, please read: [A note for exchanges or holders interacting with REAL in an automated manner](https://real.markets)
- [Presale allocation details](/PRESALE.md)
- [Multisig structure](/MULTISIG.md)
- [Token sale flow](/SALE_FLOW.md)

## ABIs

Sale:

```

```


REAL:

```

```

MultiSig:

```

```

## Technical definition

At the technical level REAL is a ERC20-compliant token, derived from the [MiniMe Token](https://github.com/Giveth/minime) that allows for token cloning (forking), which will be useful for many future usecases.

REAL is slightly diverges with the ERC20 standard, on invalid token transactions or approvals it throws instead of returning false.

## Contracts

Token:

- [REAL.sol](/contracts/ANT.sol): Main contract for the token. Derives MiniMeToken.
- [MiniMeToken.sol](/contracts/MiniMeToken.sol): Token implementation.

Sale:

- [RealCrowdsale.sol](/contracts/RealCrowdsale.sol): Implementation of the initial distribution of REAL.
- [ContributionWallet.sol](/contracts/ContributionWallet.sol): Simple contract that will hold all funds until final block of the sale.
- [MultisigWallet.sol](/contracts/MultisigWallet.sol): Gnosis multisig used for REAL and community multisigs.

## Reviewers and audits
