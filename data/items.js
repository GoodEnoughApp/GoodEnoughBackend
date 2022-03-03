const models = require('../models/index');

/**
 * This method is used to show items from item table based on product_id and used condition
 */
const getItems = async (productId, used) => {
  if (!productId || !used) {
    throw new Error('Invalid or missing requirements');
  }
  const allItems = await models.Item.findAll({
    where: {
      product_id: productId,
      is_used: used,
    },
  });
  if (allItems == null) {
    return { itemsFound: false };
  } else {
    return { itemsFound: true, allItems: allItems };
  }
};

/**
 * This method is used to find item from item table using item_id
 */
const getItemById = async (id) => {
  if (!id) {
    throw new Error('Invalid or missing requirements');
  }
  const itemById = await models.Item.findOne({
    where: {
      id: id,
    },
  });
  if (itemById == null) {
    return { itemsFound: false };
  } else {
    return { itemsFound: true, itemById: itemById.dataValues };
  }
};

const updateItem = async (itemId, expirationDate, initialQuantity, quantity, cost, isUsed) => {
  const updatedItem = await models.Item.update(
    {
      expiration_date: expirationDate,
      quantity: quantity,
      initial_quantity: initialQuantity,
      cost: cost,
      is_used: isUsed,
    },
    {
      where: {
        id: itemId,
      },
    }
  );
  if (updatedItem[0] === 1) {
    const newUpdatedItem = await getItemById(itemId);
    return { itemUpdated: true, item: newUpdatedItem.itemById };
  }
  console.log(updatedItem);
};

module.exports = {
  getItems,
  getItemById,
  updateItem,
};