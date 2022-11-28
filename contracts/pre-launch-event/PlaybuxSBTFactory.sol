// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPlaybuxSBT.sol";

contract PlaybuxSBTFactory is AccessControl, Pausable, ReentrancyGuard {
    IERC20 public immutable busd;
    IPlaybuxSBT public immutable playbuxSBT;

    uint256 public SBTPrice = 2.99 ether;

    event Mint(address indexed _receiver);
    event Withdraw(address indexed _from, uint256 _value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor(IERC20 _busd, IPlaybuxSBT _playbuxSBT) {
        busd = _busd;
        playbuxSBT = _playbuxSBT;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _pause();
    }

    function mint(uint256 _type) external nonReentrant whenNotPaused {
        require(busd.balanceOf(_msgSender()) >= SBTPrice, "Insufficient BUSD balance");
        require(busd.transferFrom(_msgSender(), address(this), SBTPrice), "Transfer BUSD failed");

        // check if the receiver has already minted
        uint256 balance = playbuxSBT.balanceOf(_msgSender());
        require(balance == 0, "You already have SBT");

        playbuxSBT.mintTo(_msgSender(), _type);
        emit Mint(_msgSender());
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setSBTPrice(uint256 _newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newPrice > 0, "SBT price must be greater than 0");
        SBTPrice = _newPrice;
    }

    function withdraw(IERC20 _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _token.transfer(_msgSender(), _token.balanceOf(address(this)));
        emit Withdraw(_msgSender(), _token.balanceOf(address(this)));
    }

    fallback() external {}
}
