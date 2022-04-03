const models = require('../models/index');
require('pg').defaults.parseInt8 = true;

const addShoppingItem = async (productId, quantity, cost) => {
  let currentDate = new Date().toISOString();
  const addedShoppingItem = await models.shopping_list_item.findOrCreate({
    where: {
      product_id: productId,
    },
    defaults: {
      product_id: productId,
      quantity: quantity,
      cost: cost,
      created_at: currentDate,
    },
  });
  return {
    shoppingItem: addedShoppingItem[0].dataValues,
    isNew: addedShoppingItem[0]._options.isNewRecord,
  };
};

/**
 * This method is used to show all shopping items from shopping_list_item
 */
const getShoppingItems = async (userId) => {
  allItems = await models.shopping_list_item.findAll({
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
  } else {
    let allItemsResponse = [];
    for (let index = 0; index < allItems.length; index++) {
      let item = {
        id: allItems[index].dataValues.id,
        productId: allItems[index].dataValues.product_id,
        createdAt: allItems[index].dataValues.created_at,
        quantity: allItems[index].dataValues.quantity,
        cost: allItems[index].dataValues.cost,
        isUsed: allItems[index].dataValues.is_used,
      };
      allItemsResponse.push(item);
    }
    return { itemsFound: true, allItems: allItemsResponse };
  }
};

/**
 * This method is used to find shopping item from shopping_list_item table
 */
const getShoppingItemById = async (id) => {
  const itemById = await models.shopping_list_item.findOne({
    where: {
      id: id,
    },
  });
  if (itemById == null) {
    return { itemsFound: false };
  } else {
    let item = {
      id: itemById.dataValues.id,
      productId: itemById.dataValues.product_id,
      createdAt: itemById.dataValues.created_at,
      quantity: itemById.dataValues.quantity,
      cost: itemById.dataValues.cost,
      isUsed: itemById.dataValues.is_used,
    };
    return { itemsFound: true, itemById: item };
  }
};

/**
 * This method is used to update a shopping item in shopping_list_item table
 */
const updateShoppingItem = async (shoppingItemId, quantity, cost) => {
  const updatedItem = await models.shopping_list_item.update(
    {
      quantity: quantity,
      cost: cost,
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
  } else {
    return { delete: false };
  }
};

module.exports = {
  addShoppingItem,
  getShoppingItems,
  getShoppingItemById,
  updateShoppingItem,
  deleteShoppingItem,
};
