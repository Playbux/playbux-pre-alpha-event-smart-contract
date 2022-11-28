const ethers = require("ethers");
const fs = require("fs");

const addresses = require("./addresses.json");

const mnemonic =
  "guilt nation burst armed glad race cloth glue lumber kitchen echo electric captain arctic puppy";

const list = [];

function gen(num) {
  const pathFn = (p) => `m/44'/60'/0'/0/${p}`;
  fs.writeFileSync("./json/addresses.json", "[");
  for (let i = 0; i < num; i++) {
    // random 0-5
    const id = i % 6;

    const path = pathFn(i);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
    console.log("wallet.address = ", path, wallet.address);
    console.log("wallet.privateKey = ", wallet.privateKey);
    // list.push({
    //   address: wallet.address,
    //   id: i,
    // });
    if (i === num - 1) {
      fs.appendFileSync(
        "./json/addresses.json",
        `{"address": "${wallet.address}", "id": ${id}}]`
      );
    } else {
      fs.appendFileSync(
        "./json/addresses.json",
        `{"address": "${wallet.address}", "id": ${id}},\n`
      );
    }
  }
}

function getPrivateKey(num = 200000) {
  const list = [];
  const pathFn = (p) => `m/44'/60'/0'/0/${p}`;
  for (let i = 0; i < num; i++) {
    const path = pathFn(i);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

    list.push(wallet);
  }

  console.log(" hi");

  // // sort by address
  // list.sort((a, b) => {
  //   return a.address.localeCompare(b.address);
  // });

  console.log("list[0].privateKey = ", list[0].privateKey);
  console.log("list[199999].privateKey = ", list[199999].privateKey);
}

getPrivateKey();

// gen(200000);
