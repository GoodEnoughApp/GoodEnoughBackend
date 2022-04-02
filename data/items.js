const models = require('../models/index');
require('pg').defaults.parseInt8 = true;
const moment = require('moment');
const { Op } = require('sequelize');

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
  allItems = await models.item.findAll({
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
  const itemById = await models.item.findOne({
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
  const updatedItem = await models.item.update(
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
  const deletedItem = await models.item.destroy({
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

/**
 * This method is used to show item report
 */
const getReport = async (userId, startDate = '', endDate = '') => {
  let allItems;
  var sDate;
  var eDate;
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
  } else {
    for (let index = 0; index < allItems.length; index++) {
      delete allItems[index].dataValues['user_product'];
    }
    return { itemsFound: true, allItems: allItems };
  }
};

module.exports = {
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getReport,
};
