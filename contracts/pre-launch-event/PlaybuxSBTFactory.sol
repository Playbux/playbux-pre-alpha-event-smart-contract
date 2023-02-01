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

    mapping(uint256 => uint256) public SBTPriceByType;
    mapping(uint256 => bool) public openToSaleByType;

    event Mint(address indexed _receiver);
    event Withdraw(address indexed _from, uint256 _value);
    event AdminChanged(address oldAdmin, address newAdmin);

    constructor(IERC20 _busd, IPlaybuxSBT _playbuxSBT) {
        require(address(_busd) != address(0), "BUSD address is invalid");
        require(address(_playbuxSBT) != address(0), "Playbux SBT address is invalid");
        busd = _busd;
        playbuxSBT = _playbuxSBT;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        SBTPriceByType[1] = 2.99 ether;
        openToSaleByType[1] = true;
        _pause();
    }

    function mint(uint256 _type) external nonReentrant whenNotPaused {
        require(openToSaleByType[_type], "SBT type is not open to sale");
        require(busd.balanceOf(_msgSender()) >= SBTPriceByType[_type], "Insufficient BUSD balance");
        require(busd.transferFrom(_msgSender(), address(this), SBTPriceByType[_type]), "Transfer BUSD failed");

        playbuxSBT.mintTo(_msgSender(), _type);
        emit Mint(_msgSender());
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setSBTPriceByType(uint256 _type, uint256 _newPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_type > 0, "SBT type must be greater than 0");
        require(_newPrice > 0, "SBT price must be greater than 0");
        SBTPriceByType[_type] = _newPrice;
    }

    function setOpenToSaleByType(uint256 _type, bool _openToSale) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_type > 0, "SBT type must be greater than 0");
        openToSaleByType[_type] = _openToSale;
    }

    function withdraw(IERC20 _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _token.transfer(_msgSender(), _token.balanceOf(address(this)));
        emit Withdraw(_msgSender(), _token.balanceOf(address(this)));
    }

    fallback() external {}
}
