const models = require('../models/index');

/**
 * This method is used to get all categories from Category table
 */
const getCategory = async () => {
  const allCategory = await models.category.findAll();
  if (allCategory == null || allCategory.length === 0) {
    return { categoryFound: false };
  } else {
    return { categoryFound: true, allCategory: allCategory };
  }
};

/**
 * This method is used to find category by category_id from Category table
 */
const getCategoryById = async (id) => {
  const categoryById = await models.category.findOne({ where: { id: id } });
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
