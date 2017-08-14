pragma solidity ^0.4.11;

import "./Owned.sol";
import "./ERC20Token.sol";
import "./SafeMath.sol";
import "./REALCrowdsale.sol";


/// @title DevTokensHolder Contract
/// @author Jordi Baylina
/// @dev This contract will hold the tokens of the developers.
///  Tokens will not be able to be collected until 6 months after the contribution
///  period ends. And it will be increasing linearly until 2 years.


//  collectable tokens
//   |                         _/--------   vestedTokens rect
//   |                       _/
//   |                     _/
//   |                   _/
//   |                 _/
//   |               _/
//   |             _/
//   |           _/
//   |          |
//   |        . |
//   |      .   |
//   |    .     |
//   +===+======+--------------+----------> time
//     Contrib   6 Months       24 Months
//       End



contract DevTokensHolder is Owned {
    using SafeMath for uint256;

    uint256 collectedTokens;
    REALCrowdsale crowdsale;
    MiniMeToken real;

    function DevTokensHolder(address _owner, address _crowdsale, address _real) {
        owner = _owner;
        crowdsale = REALCrowdsale(_crowdsale);
        real = MiniMeToken(_real);
    }


    /// @notice The Dev (Owner) will call this method to extract the tokens
    function collectTokens() public onlyOwner {
        uint256 balance = real.balanceOf(address(this));
        uint256 total = collectedTokens.add(balance);

        uint256 finalizedTime = crowdsale.finalizedTime();

        Message("Required time");

        require(finalizedTime > 0 && getTime() > finalizedTime.add(months(6)));

        Message("Passed require");

        uint256 canExtract = total.mul(getTime().sub(finalizedTime)).div(months(24));

        Message("Can extract");

        canExtract = canExtract.sub(collectedTokens);

        if (canExtract > balance) {
            canExtract = balance;
        }

        collectedTokens = collectedTokens.add(canExtract);
        assert(real.transfer(owner, canExtract));

        TokensWithdrawn(owner, canExtract);
    }

    function months(uint256 m) internal returns (uint256) {
        return m.mul(30 days);
    }

    function getTime() internal returns (uint256) {
        return now;
    }


    //////////
    // Safety Methods
    //////////

    /// @notice This method can be used by the controller to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    ///  set to 0 in case you want to extract ether.
    function claimTokens(address _token) public onlyOwner {
        require(_token != address(real));
        if (_token == 0x0) {
            owner.transfer(this.balance);
            return;
        }

        ERC20Token token = ERC20Token(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
        ClaimedTokens(_token, owner, balance);
    }

    event ClaimedTokens(address indexed _token, address indexed _controller, uint256 _amount);
    event TokensWithdrawn(address indexed _holder, uint256 _amount);
    event Message(bytes message);
}
