// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IAggregationRouterV4.sol";
import "hardhat/console.sol";

pragma solidity 0.8.14;

contract Aggregator is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    ISwapRouter public router;
    uint256 constant denominator = 1 ether;
    uint256 fee = 0.005 ether;
    mapping(IERC20 => bool) public knownToken;

    constructor(address _1inch) {
        router = ISwapRouter(_1inch);
    }

    function approveToken(IERC20 _token, uint256 _amount) external onlyOwner {
        if (_amount == 0) {
            knownToken[_token] = false;
        } else {
            knownToken[_token] = true;
        }
        _token.approve(address(router), _amount);
    }

    function swap(
        IAggregationExecutor caller,
        IAggregationRouterV4.SwapDescription calldata desc,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        require(knownToken[desc.srcToken], "Unknown token");

        require(desc.amount > 0, "Amount must be greater than 0");
        IERC20(desc.srcToken).safeTransferFrom(msg.sender, address(this), desc.amount);

        address srcToken = address(desc.srcToken);
        address dstToken = address(desc.dstToken);
        address[] memory paths = new address[](2);
        paths[0] = srcToken;
        paths[1] = dstToken;
        uint256[] memory amounts = router.swapExactTokensForTokens(
            desc.amount,
            desc.minReturnAmount,
            paths,
            address(this),
            1755798532
        );

        console.log("amounts", amounts[0]);
        console.log("amounts", amounts[1]);
        uint256 outputDecimals = ERC20(srcToken).decimals();
        console.log("outputDecimals", outputDecimals);
        uint256 feeWithDecimals = fee / (10**(18 - outputDecimals));
        console.log("feeWithDecimals", feeWithDecimals);
        uint256 feeAmount = (amounts[1] * feeWithDecimals) / (10**outputDecimals);
        console.log("feeAmount", feeAmount);
        uint256 receivedAmount = amounts[1] - feeAmount;
        console.log("receivedAmount", receivedAmount);

        IERC20(dstToken).transfer(desc.srcReceiver, receivedAmount);
    }

    function adjustFee(uint256 _fee) external onlyOwner {
        require(_fee <= 0.05 ether, "Fee must be less than or equal to 5 percent");
        fee = _fee;
    }

    function withdrawFee(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
