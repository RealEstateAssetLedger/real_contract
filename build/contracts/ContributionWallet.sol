pragma solidity ^0.4.11;


import "./REALCrowdsale.sol"

/// @title ContributionWallet Contract
/// @author Jordi Baylina
/// @dev This contract will be hold the Ether during the contribution period.
///  The idea of this contract is to avoid recycling Ether during the contribution
///  period. So all the ETH collected will be locked here until the contribution
///  period ends

// @dev Contract to hold sale raised funds during the sale period.
// Prevents attack in which the Aragon Multisig sends raised ether
// to the sale contract to mint tokens to itself, and getting the
// funds back immediately.



contract ContributionWallet {

    // Public variables
    address public multisig;
    uint256 public endBlock;
    REALCrowdsale public crowdsale;

    // @dev Constructor initializes public variables
    // @param _multisig The address of the multisig that will receive the funds
    // @param _endBlock Block after which the multisig can request the funds
    // @param _crowdsale Address of the REALCrowdsale contract
    function ContributionWallet(address _multisig, uint256 _endBlock, address _crowdsale) {
        require(_multisig != 0x0);
        require(_crowdsale != 0x0);
        require(_endBlock != 0 && _endBlock <= 4000000);
        multisig = _multisig;
        endBlock = _endBlock;
        crowdsale = REALCrowdsale(_crowdsale);
    }

    // @dev Receive all sent funds without any further logic
    function () public payable {}

    // @dev Withdraw function sends all the funds to the wallet if conditions are correct
    function withdraw() public {
        require(msg.sender == multisig);              // Only the multisig can request it
        require(block.number > endBlock ||            // Allow after end block
        crowdsale.finalizedBlock() != 0);  // Allow when sale is finalized
        multisig.transfer(this.balance);
    }

}
