pragma solidity ^0.4.11;

import '../TeamTokensHolder.sol';

// @dev TeamTokensHolderMock mocks current block number

contract TeamTokensHolderMock is TeamTokensHolder {

    uint mock_time;

    function TeamTokensHolderMock(address _owner, address _contribution, address _real)
    TeamTokensHolder(_owner, _contribution, _real) {
        mock_time = now;
    }

    function getTime() internal returns (uint) {
        return mock_time;
    }

    function setMockedTime(uint _t) {
        mock_time = _t;
    }
}
