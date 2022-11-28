const { ethers } = require("hardhat");
const addresses = require("../json/addresses.json");

const { MerkleTree } = require("merkletreejs");

const { keccak256 } = require("ethers/lib/utils");

function hashToken(account, id) {
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(["address", "uint256"], [account, id])
      .slice(2),
    "hex"
  );
}

function getMerkleTree(claimers) {
  console.log("claimers.length = ", claimers.length);
  return new MerkleTree(
    claimers.map((claimer) => hashToken(claimer.address, claimer.id)),
    keccak256,
    { sortPairs: true }
  );
}

async function main() {
  // bsc testnet provider
  const provider = ethers.providers.getDefaultProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545/"
    // "https://ropsten.infura.io/v3/78726f0065314390a6a936a15ea00067"
  );

  const signer = new ethers.Wallet(
    "0xb1057cf10bd7f971409e2c9918903c240b55346b0d168148d3ffdf6737064b35",
    provider
  );

  const contract = await (await ethers.getContract("PlaybuxClaim")).connect(
    signer
  );
  console.log("contract.address = ", contract.address);

  const merkleTree = getMerkleTree(addresses);
  const mk = merkleTree.getHexRoot();
  console.log("mk = ", mk);

  /*
  [{"address": "0x8a7b37b00e6451855A7965dfCB14333E496113a4", "id": 0},
{"address": "0xDc9Dc7153aD08097e0C0D1f32505A20E566b9eAD", "id": 1},
{"address": "0xe0C768fCC7fFCC2F1043cCDE6EF7107F48CD7017", "id": 2},
{"address": "0x0C57C480410b998088660948971bE24ABD8427Be", "id": 3},
{"address": "0x7f5D8887d7aFa9C7ba96A5186F47a082FF2530aF", "id": 4},
{"address": "0x4f62D360a48CfA3A6cfc31294180fC09dd37b442", "id": 5},
*/

  const user = signer.address;
  const id = 4;

  const proof = merkleTree.getHexProof(hashToken(user, id));
  console.log("proof", proof);

  const canClaim = await contract.canClaim(user, id, proof);
  console.log("canClaim = ", canClaim);

  const claimed = await contract.claim(id, proof);
  await claimed.wait();

  console.log("gg");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
