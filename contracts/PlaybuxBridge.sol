// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./meta-transactions/ContextMixin.sol";
import "./meta-transactions/NativeMetaTransaction.sol";

pragma solidity 0.8.14;

contract PlaybuxBridge is ContextMixin, ReentrancyGuard, Ownable, Pausable, NativeMetaTransaction {
    string public constant name = "Playbux Bridge";
    uint256 public constant BLOCK_PER_DAY = 28000;

    IERC20 public immutable PBX;

    address public admin;
    uint256 public withdrawalLimitPerDay = 5000 ether;

    mapping(address => uint256) public withdrawAmount;
    mapping(address => uint256) public lastWithdraw;

    event Deposit(address indexed _from, uint256 _value);
    event Withdraw(address indexed _from, uint256 _value, string _transactionId);
    event EmergencyWithdraw(address indexed _from, uint256 _value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor(IERC20 _pbx, address _admin) {
        PBX = _pbx;
        admin = _admin;

        _initializeEIP712(name);
        _pause();
    }

    modifier onlyAdmin() {
        require(_msgSender() == admin, "Only admin can call this function");
        _;
    }

    function deposit(uint256 _amount) external nonReentrant whenNotPaused {
        PBX.transferFrom(_msgSender(), address(this), _amount);

        emit Deposit(_msgSender(), _amount);
    }

    //! TODO: put onlyAdmin to this function for production
    function withdraw(
        uint256 _amount,
        address _receiver,
        uint256 _expirationBlock,
        string memory _transactionId
    ) external nonReentrant whenNotPaused {
        require(block.number < _expirationBlock, "Meta transaction is expired");

        uint256 receivedAmount = _amount;

        if (block.number - lastWithdraw[_receiver] > BLOCK_PER_DAY) {
            require(receivedAmount <= withdrawalLimitPerDay, "Withdrawal limit exceeded");
            withdrawAmount[_receiver] = 0; // reset amount
        } else {
            require(
                withdrawAmount[_receiver] + receivedAmount <= withdrawalLimitPerDay,
                "Withdrawal limit per day is exceeded"
            );
        }

        withdrawAmount[_receiver] += receivedAmount;
        lastWithdraw[_receiver] = block.number;

        PBX.transfer(_receiver, receivedAmount);

        emit Withdraw(_receiver, receivedAmount, _transactionId);
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

    function setWithdrawalLimitPerDay(uint256 _limit) external onlyOwner {
        withdrawalLimitPerDay = _limit;
    }

    function emergencyWithdraw() external onlyOwner {
        PBX.transfer(owner(), PBX.balanceOf(address(this)));

        emit EmergencyWithdraw(owner(), PBX.balanceOf(address(this)));
    }

    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }

    fallback() external {}
}
