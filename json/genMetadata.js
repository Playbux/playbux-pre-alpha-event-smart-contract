const fs = require('fs');

/*
#1
Name : Playbux T-Shirt
Rarity : Normal
Type : Shirt
Costume Set : Playbux Set
Collection : Early Bird Quest

#2
Name : Formal Pants
Rarity : Normal
Type : Pants
Costume Set : Formal Set
Collection : Early Bird Quest

#3
Name : Bunny Slippers
Rarity : Rare
Type : Shoes
Costume Set : Bunny Set
Collection : Early Bird Quest

#4
Name : Gentleman Sunglasses
Rarity : Rare
Type : Face
Costume Set : Gentleman Set
Collection : Early Bird Quest

#5
Name : Rainbow Head
Rarity : Super Rare
Type : Head
Costume Set : Rainbow Set
Collection : Early Bird Quest

#6
Name : Royal Crown
Rarity : Special Super Rare
Type : Hat
Costume Set : Royal Set
Collection : Early Bird Quest
*/

function main() {
  const list = [];

  const names = [
    'Playbux T-Shirt',
    'Formal Pants',
    'Bunny Slippers',
    'Gentleman Sunglasses',
    'Rainbow Head',
    'Royal Crown',
  ];

  const rarities = ['Normal', 'Normal', 'Rare', 'Rare', 'Super Rare', 'Special Super Rare'];
  const types = ['Shirt', 'Pants', 'Shoes', 'Face', 'Head', 'Hat'];

  const set = ['Playbux Set', 'Formal Set', 'Bunny Set', 'Gentleman Set', 'Rainbow Set', 'Royal Set'];

  const collection = [
    'Early Bird Quest',
    'Early Bird Quest',
    'Early Bird Quest',
    'Early Bird Quest',
    'Early Bird Quest',
    'Early Bird Quest',
  ];

  const images = [
    'QmWvdFD24KJ4q9Jw9Hqd5TBYYQavbybkV58z3zQXmnZtmV',
    'QmTYGw8xzyGeUPPJxiFoRBm6QDj3GBtd4n3QdQFQbdA3ET',
    'QmYNBprW2n8Tb3KjQPUwbY5oH7uyZXZ3W95n5Xad2FTTdT',
    'QmQLbqT2TjGMgR3UVnHWxVDiqS42FFSokdURPZ7dza8yct',
    'QmPkrYDskrrfCzqWccPoxf3pyHuWyisa8LQpUihuc83efx',
    'QmPrE88tVg4PCdTCTcA6ToEXBuKYqKnFJorPk2Ny7AAz4F',
  ];

  for (let i = 0; i < 6; i++) {
    const item = {
      name: names[i],
      image: `ipfs://${images[i]}`,
      attributes: [
        {
          trait_type: 'Rarity',
          value: rarities[i],
        },
        {
          trait_type: 'Type',
          value: types[i],
        },
        {
          trait_type: 'Costume Set',
          value: set[i],
        },

        {
          trait_type: 'Collection',
          value: collection[i],
        },
      ],
    };

    const json = JSON.stringify(item, null, 2);
    fs.writeFileSync(`${__dirname}/../metadata/${i + 1}`, json);
  }
}

main();
