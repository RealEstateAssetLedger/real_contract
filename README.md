# REAL Token

<img width="200px" src="assets/logo_real.png"/>

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

- [REAL.sol](/contracts/REALToken/REAL.sol): Main contract for the token. Derives MiniMeToken.
- [MiniMeToken.sol](/contracts/REALToken/MiniMeToken.sol): Token implementation.

Sale:

- [RealCrowdsale.sol](/contracts/REALCrowdsale.sol): Implementation of the initial distribution of REAL.
- [DevTokensHolder.sol](/contracts/DevTokensHolder.sol): Simple contract that will hold all dev funds until final block of the sale.
- [TeamTokensHolder.sol](/contracts/TeamTokensHolder.sol): Simple contract that will hold all team funds until final block of the sale.
- [MultisigWallet.sol](/contracts/MultiSigWallet.sol): Gnosis multisig used for REAL and community multisigs.

## Reviewers and audits
