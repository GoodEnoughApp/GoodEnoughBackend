const models = require('../models/index');
require('pg').defaults.parseInt8 = true;

function mapAllItems(item) {
  return {
    id: item.dataValues.id,
    productId: item.dataValues.product_id,
    createdAt: item.dataValues.created_at,
    quantity: item.dataValues.quantity,
    cost: item.dataValues.cost,
    isUsed: item.dataValues.is_used,
  };
}

const addShoppingItem = async (productId, quantity, cost) => {
  const currentDate = new Date().toISOString();
  const addedShoppingItem = await models.shopping_list_item.findOrCreate({
    where: {
      product_id: productId,
    },
    defaults: {
      product_id: productId,
      quantity,
      cost,
      created_at: currentDate,
    },
  });
  return {
    shoppingItem: mapAllItems(addedShoppingItem[0]),
    // eslint-disable-next-line no-underscore-dangle
    isNew: addedShoppingItem[0]._options.isNewRecord,
  };
};

/**
 * This method is used to show all shopping items from shopping_list_item
 */
const getShoppingItems = async (userId) => {
  const allItems = await models.shopping_list_item.findAll({
    include: [
      {
        model: models.user_product,
        where: {
          user_id: userId,
        },
      },
    ],
  });
  if (allItems == null) {
    return { itemsFound: false };
  }

  return {
    itemsFound: true,
    allItems: allItems.map(mapAllItems),
  };
};

/**
 * This method is used to find shopping item from shopping_list_item table
 */
const getShoppingItemById = async (id) => {
  const itemById = await models.shopping_list_item.findOne({
    where: {
      id,
    },
  });
  if (itemById == null) {
    return { itemsFound: false };
  }

  return { itemsFound: true, itemById: mapAllItems(itemById) };
};

/**
 * This method is used to update a shopping item in shopping_list_item table
 */
// eslint-disable-next-line consistent-return
const updateShoppingItem = async (shoppingItemId, quantity, cost) => {
  const updatedItem = await models.shopping_list_item.update(
    {
      quantity,
      cost,
    },
    {
      where: {
        id: shoppingItemId,
      },
    }
  );
  if (updatedItem[0] === 1) {
    const newUpdatedShoppingItem = await getShoppingItemById(shoppingItemId);
    return { itemUpdated: true, item: newUpdatedShoppingItem.itemById };
  }
};

/**
 * This method is used to delete a shopping item in shopping_list_item table
 */
const deleteShoppingItem = async (shoppingItemId) => {
  const deletedItem = await models.shopping_list_item.destroy({
    where: {
      id: shoppingItemId,
    },
  });
  if (deletedItem === 1) {
    return { delete: true };
  }

  return { delete: false };
};

module.exports = {
  addShoppingItem,
  getShoppingItems,
  getShoppingItemById,
  updateShoppingItem,
  deleteShoppingItem,
};
