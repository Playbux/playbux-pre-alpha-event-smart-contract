// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOneDayCashbackNFT.sol";

contract PlaybuxSBTFactory is AccessControl, Pausable, ReentrancyGuard {
    IERC20 public immutable busd;
    IOneDayCashbackNFT public immutable oneDayNFT;

    uint256 public NFTPrice = 2.99 ether;

    event Mint(address indexed _receiver);
    event Withdraw(address indexed _from, uint256 _value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor(IERC20 _busd, IOneDayCashbackNFT _oneDayNFT) {
        busd = _busd;
        oneDayNFT = _oneDayNFT;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _pause();
    }

    function mint(uint256 _type) external nonReentrant whenNotPaused {
        require(busd.balanceOf(_msgSender()) >= NFTPrice, "Insufficient BUSD balance");
        require(busd.transferFrom(_msgSender(), address(this), NFTPrice), "Transfer BUSD failed");

        // check if the receiver has already minted
        uint256 balance = oneDayNFT.balanceOf(_msgSender());
        require(balance == 0, "You already have NFT");

        oneDayNFT.mintTo(_msgSender(), _type);
        emit Mint(_msgSender());
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setNFTPrice(uint256 _newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newPrice > 0, "NFT price must be greater than 0");
        NFTPrice = _newPrice;
    }

    function withdraw(IERC20 _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _token.transfer(_msgSender(), _token.balanceOf(address(this)));
        emit Withdraw(_msgSender(), _token.balanceOf(address(this)));
    }

    fallback() external {}
}
