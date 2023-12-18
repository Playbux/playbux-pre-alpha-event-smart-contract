// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

contract Exchange is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using AddressUpgradeable for address payable;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    mapping(address => bool) public supportedTokens;

    uint256 public constant PERCENT_BASIC_POINT = 10000;
    /* ========== EVENTS ========== */

    event Withdrawal(address indexed receiver, address indexed token, uint256 amount);
    event Deposited(address indexed sender, address indexed token, uint256 amount, uint256 quotationId, uint256 expiredAt);
    
    event SupportedTokenSet(address indexed token);
    event SupportedTokenRemoved(address indexed token);

    /* ========== GOVERNANCE ========== */
    function initialize() public virtual initializer {
        OwnableUpgradeable.__Ownable_init();
        PausableUpgradeable.__Pausable_init();
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function pause() external onlyOwner {
        PausableUpgradeable._pause();
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function unpause() external onlyOwner {
        PausableUpgradeable._unpause();
    }

    /**
     * @dev function to withdraw fund by owner
     * @param token address
     * @param receiver address to receive fund
     * @param amount amount withdraw
     *
     * Emits {Withdrawal} event indicating fund withdrawal and receiver
     */
    function withdraw(
        address token,
        address receiver,
        uint256 amount
    ) external nonReentrant onlyOwner {
        require(supportedTokens[token], "Token not supported");

        if (token == address(0)) {
            payable(receiver).sendValue(amount);
        } else {
            IERC20Upgradeable(token).transfer(receiver, amount);
        }

        emit Withdrawal(receiver, token, amount);
    }

    /**
     * @dev function to add supported token
     * @param token token to set
     *
     * Emits {SupportedTokenSet} event indicating token and status set
     */
    function addSupportedToken(address token) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;

        emit SupportedTokenSet(token);
    }

    /**
     * @dev function to add supported token
     * @param token token to set
     *
     * Emits {SupportedTokenSet} event indicating token and status set
     */
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token already removed");
        supportedTokens[token] = false;

        emit SupportedTokenRemoved(token);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    /**
     * @dev function for user to deposit onchain token and get offchain token
     * @param token address
     * @param amount amount of token to deposit
     * @param quotationId id of transaction request
     * @param expiredAt of transaction
     *
     * Emits {Deposited} event indicating amount and user who deposited
     */
    function deposit(address token, uint256 amount, uint256 quotationId, uint256 expiredAt) external payable nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(expiredAt >= block.timestamp, "Expired time");

        // native token = address(0)
        if (token == address(0)) {
            require(msg.value >= amount, 'Invalid-amount');
        } else {
            IERC20Upgradeable(token).transferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        emit Deposited(msg.sender, token, amount, quotationId, expiredAt);
    }
}
