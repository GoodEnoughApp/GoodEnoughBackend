const models = require('../models/index');
require('pg').defaults.parseInt8 = true;

/**
 * This method is used to show items from item table based on product_id and used condition
 */
const getItems = async (productId = '', used = '', userId) => {
  let allItems;
  let where = {};
  if (productId !== '') {
    where.product_id = productId;
  }
  if (used !== '') {
    where.is_used = used;
  }
  allItems = await models.Item.findAll({
    include: [
      {
        model: models.user_product,
        where: {
          user_id: userId,
        },
      },
    ],
    where: where,
  });
  if (allItems === null) {
    return { itemsFound: false };
  } else {
    for (let index = 0; index < allItems.length; index++) {
      delete allItems[index].dataValues['user_product'];
    }
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

/**
 * This method is used to update an item in Item table
 */
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
};

/**
 * This method is used to delete an item in Item table
 */
const deleteItem = async (itemId) => {
  const deletedItem = await models.Item.destroy({
    where: {
      id: itemId,
    },
  });
  if (deletedItem === 1) {
    return { delete: true };
  } else {
    return { delete: false };
  }
};

module.exports = {
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
