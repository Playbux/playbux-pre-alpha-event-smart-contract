const fs = require("fs");
const csv = require("csvtojson");

const csvFilePath = `${__dirname}/raw_addresses.csv`;

async function main() {
  const jsonArray = await csv().fromFile(csvFilePath);
  console.log("jsonArray = ", jsonArray[0]);
  console.log("jsonArray = ", jsonArray[1]);
  let count = 0;

  const result = jsonArray.map((item) => {
    const rawRewardLevel = +item.reward_level;

    count += rawRewardLevel;
    const id = rawRewardLevel - 1;

    return {
      address: item.address,
      id,
    };
  });

  console.log("count = ", count);

  fs.writeFileSync("./json/prod_address.json", JSON.stringify(result, null, 2));

  console.log(" done");
}

main();
