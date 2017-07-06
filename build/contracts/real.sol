pragma solidity ^0.4.11;

/*
    Copyright 2016, Jordi Baylina

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import "./MiniMeToken.sol";


contract REAL is MiniMeToken {
    // @dev REAL constructor just parametrizes the MiniMeIrrevocableVestedToken constructor
    function REAL(address _tokenFactory)
            MiniMeToken(
                _tokenFactory,
                0x0,                         // no parent token
                0,                           // no snapshot block number from parent
                "Real Estate Asset Ledger",  // Token name
                18,                          // Decimals
                "REAL",                      // Symbol
                true                         // Enable transfers
            ) {}
}
