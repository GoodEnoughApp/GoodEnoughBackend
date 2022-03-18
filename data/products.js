const models = require('../models/index');
const axios = require('axios');
const categoryData = require('./category');
require('dotenv').config();
require('pg').defaults.parseInt8 = true;

const baseURL = 'https://api.upcdatabase.org/product';

/**
 * This method is used to find product in user_product table using barcode as a param
 */
const findUserProductUsingBarcode = async (barcode) => {
  const userProduct = await models.user_product.findOne({
    where: {
      barcode: barcode,
      user_id: userId,
    },
  });
  if (userProduct !== null) {
    return { found: true, userProduct: userProduct.dataValues };
  } else {
    return { found: false };
  }
};

/**
 * This method is used to find product in product table using barcode as a param
 */
const findProductUsingBarcode = async (barcode) => {
  const product = await models.product.findOne({
    where: {
      barcode: barcode,
    },
  });
  if (product !== null) {
    return { found: true, product: product.dataValues };
  } else {
    return { found: false };
  }
};

/**
 * This method is used to find product in UPC database using barcode as a param
 */
const findUpcProductUsingBarcode = async (barcode) => {
  let url = `${baseURL}/${barcode}?apikey=${process.env.UPC_API_KEY}`;
  const upcProduct = await axios.get(url);
  if (upcProduct.data.success === true) {
    return { found: true, upcProduct: upcProduct.data };
  } else {
    return { found: false };
  }
};

/**
 * This method is used to do an upsert using barcode
 * The method first checks for prodcut in user_product table
 * Found in user_product table ? return prodcut details(200) : check in product table
 * Found in product table ? return product_id(201) : check in UPC database
 * Found in UPC database ? insert category(if new) and insert result in product and user_product table and return record from user_product(201) : return product_id as null(201)
 */
const addProduct = async (barcode, userId) => {
  const userProduct = await findUserProductUsingBarcode(barcode, userId);
  if (userProduct.found) {
    let tempCategoryId = userProduct.userProduct.category_id;
    let categoryById = await categoryData.getCategoryById(tempCategoryId);
    userProduct.userProduct.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    delete userProduct.userProduct['category_id'];
    delete userProduct.userProduct['user_id'];
    return {
      type: 'USER_PRODUCT',
      product: userProduct.userProduct,
      found: true,
    };
  } else {
    const product = await findProductUsingBarcode(barcode);
    if (product.found) {
      const upcProduct = await findUpcProductUsingBarcode(barcode);
      if (upcProduct.found) {
        const addedUserProduct = await createUserProductUsingUPC(
          barcode,
          upcProduct.upcProduct,
          userId,
          product.product.category_id
        );
        return {
          type: 'PRODUCT',
          product: addedUserProduct,
          found: true,
        };
      } else {
        return { found: false };
      }
    } else {
      const upcProduct = await findUpcProductUsingBarcode(barcode);
      if (upcProduct.found) {
        const category = await categoryData.addCategory(
          upcProduct.upcProduct.category.toLowerCase()
        );
        const createdProduct = await createProductUsingUPC(
          barcode,
          upcProduct.upcProduct,
          userId,
          category[0].dataValues.id
        );
        return {
          type: 'UPC_PRODUCT',
          product: createdProduct,
          found: true,
        };
      } else {
        return { found: false };
      }
    }
  }
};

/**
 * This method is used to insert record form UPC database into the product table
 */
const createProductUsingUPC = async (barcode, upcProduct, userId, categoryId) => {
  try {
    const addedProduct = await models.product.findOrCreate({
      where: {
        barcode: barcode,
        barcode_type: 'UPC',
        name: upcProduct.title,
        category_id: categoryId,
      },
    });
    const addedUserProduct = createUserProductUsingUPC(barcode, upcProduct, userId, categoryId);
    return addedUserProduct;
  } catch (error) {
    console.log(error);
  }
};

/**
 * This method is used to insert record from UPC databse to user_product table
 */
const createUserProductUsingUPC = async (barcode, upcProduct, userId, categoryId) => {
  try {
    const addedProduct = await models.user_product.findOrCreate({
      where: {
        user_id: userId,
        category_id: categoryId,
        barcode: barcode,
        barcode_type: 'UPC',
        name: upcProduct.title,
        alias: upcProduct.alias,
        description: upcProduct.description,
        brand: upcProduct.brand,
        manufacturer: upcProduct.manufacturer,
      },
    });
    return addedProduct[0].dataValues;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * This method is used to find product(s) in user_product table using categoryId as a param
 */
const getUserProducts = async (categoryId = '', userId) => {
  let allUserProducts;
  let where = {};
  if (categoryId.trim() !== '') {
    where.category_id = categoryId;
  }
  where.user_id = userId;
  allUserProducts = await models.user_product.findAll({
    where: where,
  });
  if (allUserProducts == null) {
    return { productsFound: false };
  } else {
    for (let index = 0; index < allUserProducts.length; index++) {
      let tempCategoryId = allUserProducts[index].category_id;
      let categoryById = await categoryData.getCategoryById(tempCategoryId);
      allUserProducts[index].dataValues.category = {
        id: categoryById.categoryById.id,
        name: categoryById.categoryById.name,
      };
      delete allUserProducts[index]['category_id'];
      delete allUserProducts[index]['user_id'];
    }
    return { productsFound: true, allUserProducts: allUserProducts };
  }
};

/**
 * This method is used to find product in user_product table using product_id as a param
 */
const getUserProductById = async (id) => {
  if (!id) {
    throw new Error('Invalid or missing requirements');
  }
  const productById = await models.user_product.findOne({
    where: {
      id: id,
    },
  });
  if (productById == null || productById.length === 0) {
    return { productsFound: false };
  } else {
    return { productsFound: true, productById: productById.dataValues };
  }
};

/**
 * This method is used to add a custom product where user provides all the details manually
 * This method/endpoint will be invoked incase /products: put request gives null result
 */
const addCustomProduct = async (
  barcode,
  name,
  alias,
  description,
  brand,
  manufacturer,
  categoryId,
  userId
) => {
  try {
    const addedProduct = await models.product.findOrCreate({
      where: {
        barcode: barcode,
        barcode_type: 'EAN',
        name: name,
        category_id: categoryId,
      },
    });
    const addedUserProduct = await models.user_product.findOrCreate({
      where: {
        user_id: userId,
        category_id: categoryId,
        barcode: barcode,
        barcode_type: 'EAN',
        name: name,
        alias: alias,
        description: description,
        brand: brand,
        manufacturer: manufacturer,
      },
    });
    let tempCategoryId = addedUserProduct[0].dataValues.category_id;
    let categoryById = await categoryData.getCategoryById(tempCategoryId);
    addedUserProduct[0].dataValues.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    delete addedUserProduct[0].dataValues['category_id'];
    delete addedUserProduct[0].dataValues['user_id'];
    return {
      customProduct: addedUserProduct[0].dataValues,
      isNew: addedUserProduct[0]._options.isNewRecord,
    };
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Method to add item in Item table referencing a user product
 */
const addToItem = async (expirationDate, quantity, cost, productId) => {
  let currentDate = new Date().toISOString();
  const addedItem = await models.Item.create({
    product_id: productId,
    expiration_date: expirationDate,
    created_at: currentDate,
    quantity: parseInt(quantity),
    initial_quantity: 0,
    cost: parseFloat(cost),
    is_used: false,
  });
  if (addedItem === null) {
    return { itemAdded: false };
  } else {
    return { itemAdded: true, addedItem: addedItem.dataValues };
  }
};

const deleteProduct = async (productId) => {
  const deletedProduct = await models.user_product.destroy({
    where: {
      id: productId,
    },
  });
  if (deletedProduct === 1) {
    return { delete: true };
  } else {
    return { delete: false };
  }
};

module.exports = {
  addProduct,
  getUserProducts,
  getUserProductById,
  addCustomProduct,
  findUserProductUsingBarcode,
  addToItem,
  deleteProduct,
};
