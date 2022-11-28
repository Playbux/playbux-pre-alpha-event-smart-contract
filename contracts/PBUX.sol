// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PBUX is ERC20 {
    constructor() ERC20("Playbux Token", "PBUX") {
        _mint(msg.sender, 400000000 ether);
    }

    //! TODO: please remove this function after the first release
    function faucet() public {
        _mint(msg.sender, 1000000 ether);
    }
}
