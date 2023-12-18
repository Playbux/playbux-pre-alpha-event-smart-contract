// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity 0.8.14;

contract PlaybuxQuest is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // count address doQuest  per questType
    mapping(uint8 => mapping(address => uint256)) public questCount;

    event DoQuest(
        uint8 indexed questType,
        address indexed from,
        uint256 value,
        string remark,
        uint256 count,
        bool isToken
    );
    event EmergencyWithdraw(address indexed from, uint256 value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor() {}

    // modifier onlyEOA
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "PlaybuxQuest: onlyEOA");
        _;
    }

    // doquest with payable
    function doQuest(uint8 questType, string memory remark) external payable nonReentrant whenNotPaused onlyEOA {
        questCount[questType][msg.sender] += 1;

        emit DoQuest(questType, msg.sender, msg.value, remark, questCount[questType][msg.sender], false);
    }

    // do quest with ERC20 token
    function doQuestWithToken(
        uint8 questType,
        address _token, // ERC20 token address
        uint256 value,
        string memory remark
    ) external nonReentrant whenNotPaused onlyEOA {
        IERC20 token = IERC20(_token);
        token.safeTransferFrom(msg.sender, address(this), value);

        questCount[questType][msg.sender] += 1;

        emit DoQuest(questType, msg.sender, value, remark, questCount[questType][msg.sender], true);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // emergency withdarw native token
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);

        emit EmergencyWithdraw(owner(), address(this).balance);
    }

    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(owner(), token.balanceOf(address(this)));

        emit EmergencyWithdraw(owner(), token.balanceOf(address(this)));
    }

    fallback() external {}
}
