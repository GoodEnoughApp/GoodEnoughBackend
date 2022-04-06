require('pg').defaults.parseInt8 = true;
const moment = require('moment');
const { Op } = require('sequelize');
const models = require('../models/index');

function mapItem(item) {
  const { dataValues } = item;
  // eslint-disable-next-line camelcase
  const { id, product_id, expiration_date, created_at, quantity, initial_quantity, cost, is_used } =
    dataValues;
  return {
    id,
    quantity,
    cost,
    // eslint-disable-next-line camelcase
    isUsed: is_used,
    // eslint-disable-next-line camelcase
    initialQuantity: initial_quantity,
    // eslint-disable-next-line camelcase
    createdAt: created_at,
    // eslint-disable-next-line camelcase
    expirationDate: expiration_date,
    // eslint-disable-next-line camelcase
    productId: product_id,
  };
}

/**
 * This method is used to show items from item table based on product_id and used condition
 */
const getItems = async (userId, productId = '', used = '') => {
  let allItems;
  const where = {};
  if (productId !== '') {
    where.product_id = productId;
  }
  if (used !== '') {
    where.is_used = used;
  }
  allItems = await models.item.findAll({
    include: [
      {
        model: models.user_product,
        where: {
          user_id: userId,
        },
      },
    ],
    where,
  });
  if (allItems === null) {
    return { itemsFound: false };
  }
  allItems = allItems.map(mapItem);
  return { itemsFound: true, allItems };
};

/**
 * This method is used to find item from item table using item_id
 */
const getItemById = async (id) => {
  if (!id) {
    throw new Error('Invalid or missing requirements');
  }
  const itemById = await models.item.findOne({
    where: {
      id,
    },
  });
  if (itemById == null) {
    return { itemsFound: false };
  }
  return { itemsFound: true, itemById: mapItem(itemById) };
};

/**
 * This method is used to update an item in Item table
 */
const updateItem = async (itemId, expirationDate, initialQuantity, quantity, cost, isUsed) => {
  const updatedItem = await models.item.update(
    {
      expiration_date: expirationDate,
      quantity,
      initial_quantity: initialQuantity,
      cost,
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
  return { itemUpdated: false };
};

/**
 * This method is used to delete an item in Item table
 */
const deleteItem = async (itemId) => {
  const deletedItem = await models.item.destroy({
    where: {
      id: itemId,
    },
  });
  if (deletedItem === 1) {
    return { delete: true };
  }
  return { delete: false };
};

/**
 * This method is used to show item report
 */
const getReport = async (userId, startDate = '', endDate = '') => {
  let allItems;
  let sDate;
  let eDate;
  if (startDate !== '' && endDate !== '') {
    sDate = new Date(startDate);
    eDate = new Date(endDate);
    sDate = moment(sDate).format('YYYY-MM-DD');
    eDate = moment(eDate).format('YYYY-MM-DD');
    allItems = await models.item.findAll({
      include: [
        {
          model: models.user_product,
          where: {
            user_id: userId,
          },
        },
      ],
      where: {
        is_used: false,
        expiration_date: {
          [Op.between]: [sDate, eDate],
        },
      },
    });
  } else if (startDate !== '') {
    sDate = new Date(startDate);
    sDate = moment(sDate).format('YYYY-MM-DD');
    allItems = await models.item.findAll({
      include: [
        {
          model: models.user_product,
          where: {
            user_id: userId,
          },
        },
      ],
      where: {
        is_used: false,
        expiration_date: {
          [Op.gte]: sDate,
        },
      },
    });
  } else {
    eDate = new Date(endDate);
    eDate = moment(eDate).format('YYYY-MM-DD');
    allItems = await models.item.findAll({
      include: [
        {
          model: models.user_product,
          where: {
            user_id: userId,
          },
        },
      ],
      where: {
        is_used: false,
        expiration_date: {
          [Op.lte]: eDate,
        },
      },
    });
  }
  if (allItems === null) {
    return { itemsFound: false };
  }
  const allItemsResponse = [];
  for (let index = 0; index < allItems.length; index += 1) {
    const item = {
      id: allItems[index].dataValues.id,
      productId: allItems[index].dataValues.product_id,
      expirationDate: allItems[index].dataValues.expiration_date,
      createdAt: allItems[index].dataValues.created_at,
      quantity: allItems[index].dataValues.quantity,
      initialQuantity: allItems[index].dataValues.initial_quantity,
      cost: allItems[index].dataValues.cost,
      isUsed: allItems[index].dataValues.is_used,
    };
    allItemsResponse.push(item);
  }
  return { itemsFound: true, allItems: allItemsResponse };
};

module.exports = {
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getReport,
};
