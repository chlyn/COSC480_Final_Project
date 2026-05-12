'use strict';

const tags = ['', 'New Arrival', 'Best Seller', 'Limited'];

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getProductImage(category, type, number) {
  if (category !== 'women') return '';
  if (type === 'Top' && number >= 1 && number <= 10) return `/images/products/women-top-${number}.png`;
  if (type === 'Bottom' && number >= 11 && number <= 12) return `/images/products/women-bottom-${number}.png`;
  return '';
}

function buildProducts(category, startId) {
  const now = new Date();
  const types = [
    ...Array(10).fill('Top'),
    ...Array(5).fill('Bottom'),
    ...Array(5).fill('Shoes'),
  ];

  return types.map((type, index) => {
    const number = index + 1;
    const tag = category === 'sales' ? '50% Off' : tags[index % tags.length];
    const price = type === 'Shoes' ? 69 + (index % 4) * 10 : type === 'Bottom' ? 45 + (index % 4) * 8 : 25 + (index % 5) * 6;

    return {
      id: startId + index,
      name: `${titleCase(category)} ${type} ${number}`,
      description: `A versatile ${type.toLowerCase()} designed for everyday styling in the ${titleCase(category)} collection.`,
      type,
      price: `$${price.toFixed(2)}`,
      rating: Number((4 + ((index % 10) / 10)).toFixed(1)),
      tag,
      image: getProductImage(category, type, number),
      category,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function buildAccessories(startId) {
  const now = new Date();
  const accessoryTypes = ['Bag', 'Hat', 'Belt', 'Sunglasses', 'Jewelry'];

  return Array.from({ length: 20 }, (_, index) => {
    const type = accessoryTypes[index % accessoryTypes.length];
    const price = 18 + (index % 6) * 7;

    return {
      id: startId + index,
      name: `Accessory ${type} ${index + 1}`,
      description: `A polished ${type.toLowerCase()} made to finish your look with a clean Rouge detail.`,
      type: 'Accessory',
      price: `$${price.toFixed(2)}`,
      rating: Number((4 + ((index % 10) / 10)).toFixed(1)),
      tag: tags[index % tags.length],
      image: '',
      category: 'accessories',
      createdAt: now,
      updatedAt: now,
    };
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      ...buildProducts('women', 1),
      ...buildProducts('men', 21),
      ...buildProducts('kids', 41),
      ...buildAccessories(61),
      ...buildProducts('sales', 81),
    ];

    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkInsert('Products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  },
};
