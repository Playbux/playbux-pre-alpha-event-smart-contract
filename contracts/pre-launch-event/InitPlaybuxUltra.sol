// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IPlaybuxUltraNFT.sol";

contract InitPlaybuxUltra is Ownable, Pausable {
    IPlaybuxUltraNFT public immutable NFT;

    bool[20] private mintedTypes = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ];

    uint256[] private IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    uint256[] private AMOUNT = [
        360,
        360,
        360,
        360,
        360,
        135,
        135,
        135,
        135,
        135,
        90,
        90,
        90,
        90,
        90,
        15,
        15,
        15,
        15,
        15
    ];

    constructor(IPlaybuxUltraNFT _nft) {
        require(AMOUNT.length == IDS.length, "InitialNFT: invalid length");
        NFT = _nft;
    }

    function preMint(uint256 index, address receiver) external onlyOwner whenNotPaused {
        require(!mintedTypes[index], "InitialNFT: minted");
        mintedTypes[index] = true;
        // mintTo receiver AMOUNT[index] NFTs with IDS[index]
        // confirm all NFTs are minted
        uint256 beforeBalance = NFT.balanceOf(receiver);

        for (uint256 i = 0; i < AMOUNT[index]; i++) {
            NFT.mintTo(receiver, IDS[index]);
        }

        uint256 afterBalance = NFT.balanceOf(receiver);
        require(afterBalance - beforeBalance == AMOUNT[index], "InitialNFT: minted amount mismatch");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
