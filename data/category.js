const { Op } = require('sequelize');
const models = require('../models/index');
const { Op } = require('sequelize');

function mapItem(value) {
  const { dataValues } = value;
  // eslint-disable-next-line camelcase
  const { id, name, category_type } = dataValues;
  return {
    id,
    name,
    // eslint-disable-next-line camelcase
    categoryType: category_type,
  };
}

function mapItem(value) {
  const { dataValues } = value;
  // eslint-disable-next-line camelcase
  const { id, name, category_type } = dataValues;
  return {
    id,
    name,
    // eslint-disable-next-line camelcase
    type: category_type,
  };
}

/**
 * This method is used to get all categories from Category table
 */
const getCategory = async () => {
  let allCategory = await models.category.findAll({
    where: {
      category_type: {
        [Op.not]: null,
      },
    },
  });
  if (allCategory != null) {
    allCategory = allCategory.map(mapItem);
    return { categoryFound: true, allCategory };
  }
  return { categoryFound: false };
};

/**
 * This method is used to find category by category_id from Category table
 */
const getCategoryById = async (id) => {
  const categoryById = await models.category.findOne({ where: { id } });
  if (categoryById == null) {
    return { categoryFound: false };
  }
  return { categoryFound: true, categoryById: categoryById.dataValues };
};

// // This method is used to insert a unique category in Category table.
const useCategory = async (name) => {
  const categoryById = await models.category.findOne({
    where: {
      name,
    },
  });
  if (categoryById === null) {
    const otherId = await models.category.findOne({ where: { name: 'other' } });
    return otherId;
  }
  return categoryById;
};

module.exports = {
  getCategory,
  useCategory,
  getCategoryById,
};
