// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../interfaces/IPlaybuxQuestNFT.sol";

contract AirdropSTETopSpender is Ownable, Pausable {
    IPlaybuxQuestNFT public immutable NFT;
    address[] private RECEIVERS = [
        0xD3289ea7077d24e718545D9310f3D609Ef686F87,
        0x3083e52aDCb0F9550D4E932aD053D0E339562873,
        0x29358ff7B81c14d2aB8c7592131cD6a40b05aB0F,
        0x7CEA38C9316B0723541Fbf2e0c769C2305D6909F,
        0x2f46dD7a16ED677713EB61c685F808137d84Fed8,
        0x2b6e3ae5d5a7a8d481283a43c4B26692AEef3ba3,
        0xb9eF2Cde889B478097A63BFB3dD92F8C52704859,
        0x43Ff539EC26bE0c465Bb8e36b2B9f42F4d25C02a,
        0xEed323B7Cddd0f725294780e31d156d74afE9A3a,
        0x0276a2C14A62a0795774C3eD8aD17981bF60BF60,
        0xa26F88317D233430d2C6168f46e6bcaECF804085,
        0xA8aCe41404052A7f59EE640d3C2B6E6a0961aD91,
        0xd2bDf0b12044802CdA8e9481e5b9f05F5eeFb93c,
        0x555E89390e95B7285cD5A884f0a5bA8ccAc38ccE,
        0xb1B7a0A2ba8B487f941d58b5e512Fa2D9d810F36,
        0x7406151DD77BA04b70BE8B0CFD54A160d0233B9e,
        0x7C377e57C13A77fAD771640c9b694Ad268816C4d,
        0x8E115748f03de1b7BA44707480f1067d68b48B7e,
        0x3d547A197fb47D48477409AB952106789aab8AAB,
        0x586e750329bfaCb1E771d9BE910309C4Ea72291C,
        0xA2f3b15A70334213BC0F865740Dadd2589044b15,
        0xcc8Fa98E6F04825290B705D9E19A93b7De28461C,
        0x8054E34E86d819aAF46a7f4cB1B2d40d878Bc818,
        0x16cdE409BFaf3b7a254b6076972fA74f1f860a1C,
        0xaeC1E564E4E20629e371E428f76d8e53308cd7Fc,
        0x218333469983c68D10270A05773200cDF3dED5b0,
        0xC06875F14616b2BF681A8BBbAbeE2F160f01fF5f,
        0xda1C66a3186B65839bD15517Beebd72D3b801DE1,
        0xeF7A291B7381Bc689f227a092f4F503aCdE5A591,
        0x3969E4D8361E8266A27b3865394D53F26fBA2155,
        0x8Fae50cF2E2Ad4f25B2cBD12440aE0588815d67F,
        0x45a1FE688c01CCfd4606aC31D1F7b10FE2aa875e,
        0xE5d0101d8eBb71D38419C8a0130c08723818A1ff,
        0x1267790f2c06c42E6A7Eb369800EF275265fC33C,
        0x4E3cC50553F0d8544A298517844421C7f316EcF1,
        0x39ea75f28af4fB2354eE08b5E6B18e31DB236787,
        0xc755DC7c18341F498a8106aa8FfE1d30cE186283,
        0xfB68149c04B3F68dbe3c73A4600a0eb873100705,
        0x97431690B72fE45386b97ccaa6a65f15Ef8933E7,
        0x8A20bf5a59E8e51E211b24Dcb0847eF9559fe90f,
        0x21d2579F2F41ed042f91Ed06C780b00a47CcE398,
        0x3811EF608e5a7EBfcfEB72Eb3ec65dD720999495,
        0x1CC5DFbF9e4dfcE23Fcccb9aAB5bD08Ef44705F0,
        0xc9ed84388cCE5B51486D952F84afFC5E91A6C224,
        0x5d2639E6CE748DFCB543CEBBE7f5053CFA42CE61,
        0x3E68FCA5b47bF0510DEBB0fa95d51c54B032A1C8,
        0x63204B56124CA956eAd5D498290f5963a2dac19F,
        0x2904Cd62Abed42916990219Cee643f4A26BC5643
    ];

    uint256[] private TYPES = [
        19,
        18,
        17,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15
    ];
    bool private minted = false;

    constructor(IPlaybuxQuestNFT _nft) {
        NFT = _nft;
        _pause();
    }

    function airdrop() external onlyOwner whenNotPaused {
        require(RECEIVERS.length == TYPES.length, "Airdrop: invalid length");
        require(!minted, "Airdrop: minted");
        minted = true;
        for (uint256 i = 0; i < RECEIVERS.length; i++) {
            NFT.mintTo(RECEIVERS[i], TYPES[i]);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
