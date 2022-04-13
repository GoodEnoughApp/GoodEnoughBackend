const models = require('../models/index');

/**
 * This method is used to get all categories from Category table
 */
const getCategory = async () => {
  const allCategory = await models.category.findAll();
  if (allCategory == null || allCategory.length === 0) {
    return { categoryFound: false };
  }
  return { categoryFound: true, allCategory };
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

// This method is used to insert a unique category in Category table.
const addCategory = async (categoryName = 'other') => {
  const newCategory = await models.category.findOrCreate({
    where: { name: categoryName },
  });
  return newCategory;
};

module.exports = {
  getCategory,
  addCategory,
  getCategoryById,
};
