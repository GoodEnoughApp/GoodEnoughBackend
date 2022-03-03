const models = require('../models/index');

/**
 * This method is used to get all categories from Category table
 */
const getCategory = async () => {
  const allCategory = await models.Category.findAll();
  if (allCategory == null) {
    return { categoryFound: false };
  } else {
    return { categoryFound: true, allCategory: allCategory };
  }
};

/**
 * This method is used to find category by category_id from Category table
 */
const getCategoryById = async (id) => {
  const categoryById = await models.Category.findOne({ where: { id: id } });
  if (categoryById == null) {
    return { categoryFound: false };
  } else {
    return { categoryFound: true, categoryById: categoryById.dataValues };
  }
};

// This method is used to insert a unique category in Category table.
const addCategory = async (categoryName) => {
  if (categoryName === '') {
    categoryName = 'other';
  }
  const newCategory = await models.Category.findOrCreate({
    where: { name: categoryName },
  });
  return newCategory;
};

module.exports = {
  getCategory,
  addCategory,
  getCategoryById,
};
