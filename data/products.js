const models = require('../models/index');
const axios = require('axios');
const categoryData = require('./category');
require('dotenv').config();

const baseURL = 'https://api.upcdatabase.org/product';

/**
 * This method is used to find product in user_product table using barcode as a param
 */
const findUserProductUsingBarcode = async (barcode) => {
  const userProduct = await models.user_product.findOne({
    where: {
      barcode: barcode,
    },
  });
  if (userProduct != null) {
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
  if (product != null) {
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
const addProduct = async (barcode, decoded) => {
  const userProduct = await findUserProductUsingBarcode(barcode);
  if (userProduct.found) {
    let tempCategoryId = userProduct.userProduct.category_id;
    categoryById = await categoryData.getCategoryById(tempCategoryId);
    userProduct.userProduct.category = {
      id: categoryById.categoryById.id,
      name: categoryById.categoryById.name,
    };
    delete userProduct.userProduct['category_id'];
    return {
      type: 'USER_PRODUCT',
      product: userProduct.userProduct,
      found: true,
    };
  } else {
    const product = await findProductUsingBarcode(barcode);
    if (product.found) {
      return {
        type: 'PRODUCT',
        product: product.product,
        found: true,
      };
    } else {
      const upcProduct = await findUpcProductUsingBarcode(barcode);
      if (upcProduct.found) {
        const category = await categoryData.addCategory(
          upcProduct.upcProduct.category.toLowerCase()
        );
        const createdProduct = await createProductUsingUPC(
          upcProduct.upcProduct,
          decoded,
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
const createProductUsingUPC = async (upcProduct, decoded, categoryId) => {
  try {
    const addedProduct = await models.product.findOrCreate({
      where: {
        barcode: upcProduct.barcode,
        barcode_type: 'UPC',
        name: upcProduct.title,
        category_id: categoryId,
      },
    });
    const addedUserProduct = createUserProductUsingUPC(
      upcProduct,
      decoded,
      categoryId,
      addedProduct[0].dataValues
    );
    return addedUserProduct;
  } catch (error) {
    console.log(error);
  }
};

/**
 * This method is used to insert record from UPC databse to user_product table
 */
const createUserProductUsingUPC = async (
  upcProduct,
  decoded,
  categoryId,
  addedProductData
) => {
  try {
    const addedProduct = await models.user_product.findOrCreate({
      where: {
        user_id: decoded.userId,
        category_id: categoryId,
        barcode: addedProductData.barcode,
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
    console.log(error);
  }
};

/**
 * This method is used to find product(s) in user_product table using categoryId as a param
 */
const getUserProducts = async (categoryId) => {
  if (!categoryId) {
    throw new Error('Invalid or missing requirements');
  }
  const allUserProducts = await models.user_product.findAll({
    where: {
      category_id: categoryId,
    },
  });
  if (allUserProducts == null) {
    return { productsFound: false };
  } else {
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
  if (productById == null) {
    return { productsFound: false };
  } else {
    return { productsFound: true, productById: productById };
  }
};

module.exports = {
  addProduct,
  getUserProducts,
  getUserProductById,
};
