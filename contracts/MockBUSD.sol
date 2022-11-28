// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBUSD is ERC20 {
    constructor() ERC20("Binance USD", "BUSD") {
        _mint(msg.sender, 1000000000 ether);
    }

    function faucet() public {
        _mint(msg.sender, 1000000 ether);
    }
}
