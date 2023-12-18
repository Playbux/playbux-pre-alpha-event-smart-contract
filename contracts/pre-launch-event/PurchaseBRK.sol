// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity 0.8.14;

contract PurchaseBRK is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    address public admin;

    event Purchase(address indexed coin, address indexed _from, string userId, uint256 _value, string remark);
    event EmergencyWithdraw(address indexed _from, uint256 _value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor(address _admin) {
        admin = _admin;

        _pause();
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function purchase(
        address coin,
        string memory userId,
        uint256 _amount,
        string memory remark
    ) external nonReentrant whenNotPaused {
        IERC20(coin).safeTransferFrom(msg.sender, address(this), _amount);

        emit Purchase(coin, msg.sender, userId, _amount, remark);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setAdmin(address _admin) external onlyOwner {
        address oldAdmin = admin;
        admin = _admin;

        emit AdminChanged(oldAdmin, _admin);
    }

    function emergencyWithdraw(address _coin) external onlyOwner {
        IERC20 coin = IERC20(_coin);
        coin.transfer(owner(), coin.balanceOf(address(this)));

        emit EmergencyWithdraw(owner(), coin.balanceOf(address(this)));
    }

    fallback() external {}
}
