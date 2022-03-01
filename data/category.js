const models = require('../models/index');

const getCategory = async () => {
  const allCategory = await models.Category.findAll();
  if (allCategory == null) {
    return { categoryFound: false };
  } else {
    return { categoryFound: true, allCategory: allCategory };
  }
};

const getCategoryById = async (id) => {
  const categoryById = await models.Category.findOne({ where: { id: id } });
  if (categoryById == null) {
    return { categoryFound: false };
  } else {
    return { categoryFound: true, categoryById: categoryById.dataValues };
  }
};

const addCategory = async (categoryName) => {
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
